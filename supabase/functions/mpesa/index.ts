import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\+]/g, "").replace(/[^\d]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  } else if (cleaned.startsWith("254") && cleaned.length === 12) {
    // already correct
  } else {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

function generateTimestamp(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}${part("month")}${part("day")}${part("hour")}${part("minute")}${part("second")}`;
}

async function getOAuthToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa Consumer Key or Consumer Secret in Supabase secrets.");
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const res = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("M-Pesa OAuth error:", errorText);
    throw new Error(`Failed to generate M-Pesa token: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "initiate";

    const shortcode = Deno.env.get("MPESA_SHORTCODE") || Deno.env.get("MPESA_SHORT_CODE") || "4048051";
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const transactionType = Deno.env.get("MPESA_TRANSACTION_TYPE") || "CustomerPayBillOnline";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lkebnghhbgptfswoihcy.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!passkey) {
      throw new Error("Missing M-Pesa Passkey in Supabase secrets.");
    }

    // ─── INITIATE: Send STK Push to customer's phone ───────────────────────────
    if (action === "initiate") {
      const token = await getOAuthToken();
      const formattedPhone = formatPhoneNumber(body.phone || body.phone_number || "");
      const timestamp = generateTimestamp();
      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      const numericAmount = Math.round(Number(body.amount));
      if (numericAmount <= 0) throw new Error("Amount must be greater than zero");

      // Sanitize account reference — strips XML-unsafe chars, max 12 chars
      const rawRef = body.programme || body.accountReference || "StakenHub";
      const safeRef = String(rawRef)
        .replace(/[&<>"']/g, "")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .trim()
        .substring(0, 12) || "StakenHub";

      // CallBackURL points to the dedicated mpesa-callback function (no-verify-jwt)
      const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;

      const stkPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: numericAmount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: safeRef,
        TransactionDesc: "TuitionPayment",
      };

      console.log("Initiating STK Push:", JSON.stringify({ ...stkPayload, Password: "***" }));

      const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      });

      const responseText = await res.text();
      console.log("STK Push Response:", responseText);

      if (!res.ok) {
        return new Response(JSON.stringify({ error: responseText }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const stkData = JSON.parse(responseText);

      // ── Pre-insert the application row BEFORE Safaricom can fire the callback ──
      // This guarantees the row exists in DB when mpesa-callback tries to update it.
      if (stkData.ResponseCode === "0" && stkData.CheckoutRequestID && supabaseUrl && supabaseServiceKey) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });

          const { error: insertErr } = await supabaseAdmin.from("applications").insert({
            first_name: body.firstName || "",
            last_name: body.lastName || "",
            email: body.email || "",
            phone: body.phone || formattedPhone,
            programme: body.programme || "",
            mode: body.mode || "Online",
            goals: body.goals || "",
            coupon_code: body.couponCode || null,
            child_name: null,
            child_age: null,
            payment_method: "M-Pesa Auto Pay",
            amount_paid: `KES ${numericAmount.toLocaleString()}`,
            payment_status: "Pending",
            mpesa_reference: "Pending",
            checkout_request_id: stkData.CheckoutRequestID,
          });

          if (insertErr) {
            console.error("Pre-insert application error:", JSON.stringify(insertErr));
          } else {
            console.log(`Pre-inserted application for CheckoutRequestID: ${stkData.CheckoutRequestID}`);
          }
        } catch (dbErr: any) {
          console.error("DB pre-insert error:", dbErr.message);
        }
      }

      return new Response(responseText, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── QUERY: Check if customer has entered PIN and payment is done ──────────
    if (action === "query") {
      const token = await getOAuthToken();
      const timestamp = generateTimestamp();
      const password = btoa(`${shortcode}${passkey}${timestamp}`);
      const checkoutRequestId = body.checkoutRequestId || body.CheckoutRequestID;

      if (!checkoutRequestId) {
        throw new Error("Missing checkoutRequestId in query request");
      }

      // Check DB first — mpesa-callback may have already written the real receipt
      let dbReceiptNumber = "";
      if (supabaseUrl && supabaseServiceKey) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          const { data: appRow } = await supabaseAdmin
            .from("applications")
            .select("mpesa_reference")
            .eq("checkout_request_id", checkoutRequestId)
            .maybeSingle();

          const ref = appRow?.mpesa_reference || "";
          if (ref && ref !== "Pending" && ref !== "Pending PIN" && !ref.startsWith("ws_CO_")) {
            dbReceiptNumber = ref;
            console.log(`Found real receipt in DB: ${dbReceiptNumber}`);
          }
        } catch (dbErr) {
          console.error("DB lookup error:", dbErr);
        }
      }

      const queryPayload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      });

      const responseText = await res.text();
      console.log("STK Query Response:", responseText);

      let resData: any = {};
      try {
        resData = JSON.parse(responseText);
      } catch (_) {}

      const msg = (
        resData.ResultDesc ||
        resData.ResponseDescription ||
        resData.errorMessage ||
        ""
      ).toLowerCase();

      const errCode = String(resData.ResultCode ?? resData.errorCode ?? resData.ResponseCode ?? "");

      // Transaction is still waiting for PIN entry on handset
      const isProcessing =
        errCode === "500.002.1001" ||
        msg.includes("processing") ||
        msg.includes("being processed") ||
        msg.includes("under processing") ||
        msg.includes("in progress") ||
        msg.includes("not found");

      if (isProcessing) {
        return new Response(
          JSON.stringify({
            status: "pending",
            data: resData,
            message: resData.ResultDesc || resData.ResponseDescription || resData.errorMessage || "Transaction is still under processing",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!res.ok) {
        return new Response(JSON.stringify({ error: responseText }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let status = "pending";
      if (errCode === "0" || resData.ResultCode === "0") {
        status = "success";
      } else if (resData.ResultCode !== undefined && resData.ResultCode !== null) {
        status = "failed";
      }

      return new Response(
        JSON.stringify({
          status,
          data: resData,
          // NOTE: Safaricom query does NOT return MpesaReceiptNumber.
          // Real receipt comes ONLY via mpesa-callback. We return what's in DB.
          mpesaReceiptNumber: dbReceiptNumber,
          message: resData.ResultDesc || resData.ResponseDescription || resData.errorMessage,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'initiate' or 'query'." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("M-Pesa function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

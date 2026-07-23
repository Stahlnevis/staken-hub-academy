import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  } else if (cleaned.startsWith("+254")) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith("254") && cleaned.length === 12) {
    // correct
  } else {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

function getMpesaTimestamp(): string {
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

async function getMpesaToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa Consumer Key or Consumer Secret in Supabase secrets.");
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const res = await fetch("https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to generate M-Pesa token: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

serve(async (req) => {
  // Handle CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    if (action === "initiate") {
      const token = await getMpesaToken();
      const shortcode = Deno.env.get("MPESA_SHORTCODE") || "4048051";
      const passkey = Deno.env.get("MPESA_PASSKEY");

      if (!passkey) {
        throw new Error("Missing M-Pesa Passkey in Supabase secrets.");
      }

      const formattedPhone = formatPhoneNumber(data.phone);
      const timestamp = getMpesaTimestamp();

      const password = btoa(`${shortcode}${passkey}${timestamp}`);

        // Sanitize programme name: strip special chars, collapse spaces, max 20 chars (Safaricom limit)
        const safeProg = (data.programme as string || "")
          .replace(/[^a-zA-Z0-9 ]/g, "")   // remove special chars like &
          .replace(/\s+/g, "-")            // spaces → hyphens
          .substring(0, 20);              // max 20 chars

        const payload = {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: Math.round(data.amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: "https://stakenhub.com/api/mpesa-callback",
          AccountReference: safeProg || "KensabAcademy",
          TransactionDesc: "Tuition-Payment",
        };

      console.log("Initiating M-Pesa STK Push in Edge Function:", { ...payload, Password: "***" });

      const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("M-Pesa STK Response:", responseText);

      if (!res.ok) {
        return new Response(JSON.stringify({ error: responseText }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(responseText, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "query") {
      const token = await getMpesaToken();
      const shortcode = Deno.env.get("MPESA_SHORTCODE") || "4048051";
      const passkey = Deno.env.get("MPESA_PASSKEY");

      if (!passkey) {
        throw new Error("Missing M-Pesa Passkey in Supabase secrets.");
      }

      const timestamp = getMpesaTimestamp();

      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: data.checkoutRequestId,
      };

      const res = await fetch("https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("M-Pesa query response:", responseText);

      if (!res.ok) {
        try {
          const errObj = JSON.parse(responseText);
          if (
            errObj.errorCode === "500.002.1001" ||
            errObj.errorMessage?.toLowerCase().includes("being processed") ||
            errObj.errorMessage?.toLowerCase().includes("not found")
          ) {
            return new Response(JSON.stringify({ status: "pending", message: errObj.errorMessage }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } catch (_) {}

        return new Response(JSON.stringify({ error: responseText }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resData = JSON.parse(responseText);

      let status = "pending";
      if (resData.ResultCode === "0") {
        status = "success";
      } else if (resData.ResultCode) {
        status = "failed";
      }

      return new Response(JSON.stringify({ status, data: resData, message: resData.ResultDesc }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

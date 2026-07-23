import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa Callback received:", JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      console.error("Invalid callback — no stkCallback found in body");
      // Always return 200 so Safaricom doesn't retry endlessly
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    console.log(`CheckoutRequestID=${CheckoutRequestID}, ResultCode=${ResultCode}, ResultDesc=${ResultDesc}`);

    // Extract the real M-Pesa receipt number and metadata from Safaricom's callback
    let mpesaReceiptNumber = "";
    let paidAmount = 0;
    let transactionDate = "";
    let phoneNumber = "";

    if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
      for (const item of CallbackMetadata.Item) {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceiptNumber = String(item.Value ?? "");
            break;
          case "Amount":
            paidAmount = Number(item.Value ?? 0);
            break;
          case "TransactionDate":
            transactionDate = String(item.Value ?? "");
            break;
          case "PhoneNumber":
            phoneNumber = String(item.Value ?? "");
            break;
        }
      }
    }

    console.log(`Receipt=${mpesaReceiptNumber}, Amount=${paidAmount}, Phone=${phoneNumber}, Date=${transactionDate}`);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase credentials in secrets");
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (ResultCode === 0 && mpesaReceiptNumber) {
      // SUCCESS — update the application row with the real M-Pesa receipt code
      const { error } = await supabaseAdmin
        .from("applications")
        .update({
          mpesa_reference: mpesaReceiptNumber,
          payment_status: "Completed",
        })
        .eq("checkout_request_id", CheckoutRequestID);

      if (error) {
        console.error("DB update error on success callback:", JSON.stringify(error));
      } else {
        console.log(`Application updated with receipt: ${mpesaReceiptNumber} for CheckoutRequestID: ${CheckoutRequestID}`);
      }
    } else {
      // FAILED — update status accordingly
      console.log(`Payment failed. ResultCode=${ResultCode}, Desc=${ResultDesc}`);
      const { error } = await supabaseAdmin
        .from("applications")
        .update({
          payment_status: "Failed",
        })
        .eq("checkout_request_id", CheckoutRequestID);

      if (error) {
        console.error("DB update error on failed callback:", JSON.stringify(error));
      }
    }

    // Always acknowledge Safaricom with 200 + ResultCode 0 to stop retries
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("mpesa-callback error:", error.message);
    // Still return 200 so Safaricom doesn't retry
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

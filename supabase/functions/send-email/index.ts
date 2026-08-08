import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "StakenHub Academy <admissions@stakenhub.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, to_name, subject, html, text, from_name } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, html or text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY secret not set");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromAddress = from_name
      ? `${from_name} <admissions@stakenhub.com>`
      : FROM_EMAIL;

    // Build Resend payload
    const resendPayload: Record<string, unknown> = {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      reply_to: "admissions@stakenhub.com",
    };

    if (html) {
      resendPayload.html = html;
    } else {
      // Convert plain text to basic HTML with line breaks preserved
      resendPayload.html = `<pre style="font-family:sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${text}</pre>`;
    }

    console.log(`send-email: Sending to ${to} | Subject: ${subject}`);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendRes.json();
    console.log("send-email: Resend response:", JSON.stringify(resendData));

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: resendData }),
        { status: resendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-email: Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

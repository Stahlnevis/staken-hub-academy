import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "StakenHub Academy <admissions@stakenhub.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseTextToStyledHtml(text: string): string {
  const lines = text.split("\n");
  let html = "";
  let inKeyValueBlock = false;
  let kvRows: { key: string; value: string }[] = [];

  const flushKvBlock = () => {
    if (kvRows.length > 0) {
      html += `<div style="margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #f8fafc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">`;
      kvRows.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        let valDisplay = escapeHtml(row.value);

        // Highlight status if key is Status
        if (row.key.toLowerCase().includes("status")) {
          if (row.value.toUpperCase().includes("APPROVED")) {
            valDisplay = `<span style="display:inline-block; background-color:#dcfce7; color:#15803d; border:1px solid #bbf7d0; padding:3px 10px; border-radius:12px; font-weight:700; font-size:12px; text-transform:uppercase;">${escapeHtml(row.value)}</span>`;
          } else if (row.value.toUpperCase().includes("REJECT") || row.value.toUpperCase().includes("UNFORTUNATELY")) {
            valDisplay = `<span style="display:inline-block; background-color:#fee2e2; color:#b91c1c; border:1px solid #fecaca; padding:3px 10px; border-radius:12px; font-weight:700; font-size:12px; text-transform:uppercase;">${escapeHtml(row.value)}</span>`;
          } else if (row.value.toUpperCase().includes("PENDING")) {
            valDisplay = `<span style="display:inline-block; background-color:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:3px 10px; border-radius:12px; font-weight:700; font-size:12px; text-transform:uppercase;">${escapeHtml(row.value)}</span>`;
          }
        }

        // Convert URLs in values to clickable links/buttons
        const urlMatch = row.value.match(/(https?:\/\/[^\s]+)/g);
        if (urlMatch) {
          urlMatch.forEach((url) => {
            valDisplay = valDisplay.replace(
              escapeHtml(url),
              `<a href="${escapeHtml(url)}" target="_blank" style="color:#e11d48; text-decoration:underline; font-weight:600;">${escapeHtml(url)}</a>`
            );
          });
        }

        html += `<tr>
          <td style="padding: 10px 14px; width: 38%; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 13px; background-color: ${bg};">${escapeHtml(row.key)}</td>
          <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-size: 13px; background-color: ${bg}; font-weight: 500;">${valDisplay}</td>
        </tr>`;
      });
      html += `</table></div>`;
      kvRows = [];
    }
    inKeyValueBlock = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip divider lines like ------- or ======
    if (/^[-=]{3,}$/.test(line)) {
      continue;
    }

    if (!line) {
      flushKvBlock();
      continue;
    }

    // Check if line is a section heading (all caps ending with colon, or ending with colon after underline)
    const isHeading = /^[A-Z0-9\s&/\-–—]+:$/.test(line) || (line.endsWith(":") && (i + 1 < lines.length && /^[-=]{3,}$/.test(lines[i + 1].trim())));
    if (isHeading) {
      flushKvBlock();
      const headingText = line.replace(/:$/, "").trim();
      html += `<div style="margin-top: 24px; margin-bottom: 12px;">
        <span style="background-color: #0f172a; color: #ffffff; padding: 5px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block; border-left: 3px solid #e11d48;">
          ${escapeHtml(headingText)}
        </span>
      </div>`;
      continue;
    }

    // Check if line is Key: Value
    const kvMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (kvMatch && !line.startsWith("http://") && !line.startsWith("https://")) {
      inKeyValueBlock = true;
      kvRows.push({ key: kvMatch[1].trim(), value: kvMatch[2].trim() });
      continue;
    }

    // If not key-value, flush any ongoing block
    flushKvBlock();

    // Convert standalone URL to button
    const standaloneUrlMatch = line.match(/^(https?:\/\/[^\s]+)$/);
    if (standaloneUrlMatch) {
      const url = standaloneUrlMatch[1];
      html += `<div style="margin: 16px 0; text-align: left;">
        <a href="${escapeHtml(url)}" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 4px rgba(225,29,72,0.2);">
          Open Portal / Link &rarr;
        </a>
      </div>`;
      continue;
    }

    // Regular line / paragraph: replace inline URLs with styled links
    let formattedLine = escapeHtml(line);
    const inlineUrls = line.match(/(https?:\/\/[^\s]+)/g);
    if (inlineUrls) {
      inlineUrls.forEach((url) => {
        const cleanUrl = url.replace(/[).,]+$/, "");
        formattedLine = formattedLine.replace(
          escapeHtml(cleanUrl),
          `<a href="${escapeHtml(cleanUrl)}" target="_blank" style="color:#e11d48; text-decoration:underline; font-weight:600;">${escapeHtml(cleanUrl)}</a>`
        );
      });
    }

    html += `<p style="margin: 0 0 10px 0; color: #334155; line-height: 1.6; font-size: 14px;">${formattedLine}</p>`;
  }

  flushKvBlock();
  return html;
}

function buildStyledEmailHtml(params: {
  subject: string;
  html?: string;
  text?: string;
  to_name?: string;
  from_name?: string;
}): string {
  const { subject, html, text, to_name } = params;

  // If full HTML document passed, use it directly
  if (html && (html.includes("<!DOCTYPE") || html.includes("<html"))) {
    return html;
  }

  let bodyContent = "";
  if (html && html.trim().length > 0) {
    bodyContent = html;
  } else if (text && text.trim().length > 0) {
    bodyContent = parseTextToStyledHtml(text);
  } else {
    bodyContent = `<p style="color: #334155;">No message content provided.</p>`;
  }

  const greeting = to_name ? `<p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Hello ${escapeHtml(to_name)},</p>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color:#0f172a; padding: 26px 32px; border-bottom: 4px solid #e11d48; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing: 0.5px; font-family: sans-serif;">
                      STAKEN<span style="color:#e11d48;">HUB</span> ACADEMY
                    </div>
                    <div style="color:#94a3b8; font-size:11px; margin-top:4px; font-weight:600; text-transform: uppercase; letter-spacing: 1.2px;">
                      Empowering Digital & Tech Excellence
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SUBJECT BANNER -->
          <tr>
            <td style="background-color:#f8fafc; padding: 18px 32px; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin:0; color:#0f172a; font-size:17px; font-weight:700; line-height:1.4;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>

          <!-- CONTENT BODY -->
          <tr>
            <td style="padding: 32px; color:#334155; font-size:14px; line-height:1.6;">
              ${greeting}
              ${bodyContent}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; color:#64748b; font-size:12px; line-height:1.5;">
              <p style="margin: 0 0 6px 0; font-weight:700; color:#334155;">
                StakenHub Academy & Ecosystem
              </p>
              <p style="margin: 0 0 12px 0; color: #64748b;">
                Empowering Digital Skills & Institution Partnerships Worldwide
              </p>
              <p style="margin: 0;">
                <a href="https://stakenhub.com" target="_blank" style="color:#e11d48; text-decoration:none; font-weight:600;">Visit Main Website</a> &nbsp;&bull;&nbsp; 
                <a href="https://academy.stakenhub.com" target="_blank" style="color:#e11d48; text-decoration:none; font-weight:600;">Academy Portal</a> &nbsp;&bull;&nbsp; 
                <a href="mailto:admissions@stakenhub.com" style="color:#e11d48; text-decoration:none; font-weight:600;">Contact Admissions</a>
              </p>
              <div style="margin-top: 16px; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
                This is an automated notification from StakenHub Academy. Please do not reply directly to system alerts.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

    // Build styled HTML template
    const finalHtml = buildStyledEmailHtml({
      subject,
      html,
      text,
      to_name,
      from_name,
    });

    // Build Resend payload
    const resendPayload: Record<string, unknown> = {
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      reply_to: "admissions@stakenhub.com",
      html: finalHtml,
      ...(text ? { text } : {}),
    };

    console.log(`send-email: Sending styled email to ${to} | Subject: ${subject}`);

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


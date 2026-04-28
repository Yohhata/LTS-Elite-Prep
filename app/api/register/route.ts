import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type } = body;

    if (!name || !email || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceMap: Record<string, string> = {
      "drop-in": "$75",
      "pass-5": "$299",
      "pass-10": "$449",
    };

    const typeLabels: Record<string, string> = {
      "drop-in": "Single Drop-in",
      "pass-5": "5-Session Pass",
      "pass-10": "10-Session Pass",
    };

    const amount = priceMap[type] || "TBD";
    const label = typeLabels[type] || type;

    // 1. Supabase に保存 (registrations テーブルを想定)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseServer = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await supabaseServer.from("registrations").insert({
        name,
        email,
        type: label,
        amount,
        status: "pending_payment"
      });
    }

    // 2. Resend で自動返信メール (Invoice)
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      // ユーザーへの確認メール
      await resend.emails.send({
        from: "LTS Elite Prep <info@ltseliteprep.ca>",
        to: email,
        subject: "Action Required: Complete your registration for LTS Elite Prep",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
            <p>Hi ${name},</p>
            <p>Thank you for registering with LTS Elite Prep!</p>
            <p>To secure your spot for the <strong>${label}</strong>, please complete the payment via E-transfer within the next 48 hours.</p>
            
            <div style="margin:30px 0;padding:25px;background:#f9f9f9;border-radius:16px;border:1px solid #eee;">
              <h3 style="margin-top:0;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Payment Details</h3>
              <p style="margin:10px 0;"><strong>E-transfer to:</strong> info@ltseliteprep.ca</p>
              <p style="margin:10px 0;"><strong>Amount:</strong> ${amount}</p>
              <p style="margin:10px 0;font-size:13px;color:#666;"><em>Note: Please include the athlete's name in the transfer notes.</em></p>
            </div>

            <p style="color:#d93025;font-weight:bold;">Please note: If payment is not received within 48 hours, your registration may be automatically cancelled.</p>
            <p>Once we receive your payment, we will send you a formal receipt/invoice. We look forward to seeing you on the court!</p>
            
            <p style="margin-top:40px;">Best regards,</p>
            <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
          </div>
        `,
      });

      // 管理者への通知
      await resend.emails.send({
        from: "LTS System <info@ltseliteprep.ca>",
        to: "info@ltseliteprep.ca",
        subject: `NEW REGISTRATION: ${name} (${label})`,
        html: `<p>New registration received from <strong>${name}</strong> (${email}) for <strong>${label}</strong>. Payment of <strong>${amount}</strong> is pending.</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

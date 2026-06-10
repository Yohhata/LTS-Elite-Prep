import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, passType, pass_type: body_pass_type } = body;
    const pass_type = passType || body_pass_type;

    if (!name || !email || !pass_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (pass_type !== "pass-5" && pass_type !== "pass-10") {
      return NextResponse.json({ error: "Invalid pass type" }, { status: 400 });
    }

    const sessions_total = pass_type === "pass-5" ? 5 : 10;
    const amount = pass_type === "pass-5" ? "$299" : "$449";
    const label = pass_type === "pass-5" ? "5-Session Pass" : "10-Session Pass";

    // 1. pass_holders テーブルに保存
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: dbError } = await supabase.from("pass_holders").insert({
        name,
        email: email.trim().toLowerCase(),
        phone: phone || null,
        pass_type,
        sessions_total,
        sessions_used: 0,
        status: "active",
      });

      if (dbError) {
        console.error("DB Error:", dbError);
        // テーブルがまだない場合でもメールは送る
      }
    }

    // 2. メール送信
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true, warning: "Email not configured" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ユーザーへのインボイスメール
    await resend.emails.send({
      from: "LTS Elite Prep <info@ltseliteprep.ca>",
      to: email,
      subject: `Action Required: Complete your ${label} purchase — LTS Elite Prep`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
          <h2 style="font-size:24px;font-weight:900;text-transform:uppercase;margin-bottom:4px;">
            ${label} 🏀
          </h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with LTS Elite Prep! To activate your pass, please complete the payment via E-transfer within the next 48 hours.</p>

          <div style="margin:30px 0;padding:25px;background:#f9f9f9;border-radius:16px;border:1px solid #eee;">
            <h3 style="margin-top:0;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;">Payment Details</h3>
            <p style="margin:10px 0;"><strong>E-transfer to:</strong> info@ltseliteprep.ca</p>
            <p style="margin:10px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin:10px 0;"><strong>Pass:</strong> ${label} (${sessions_total} sessions)</p>
            <p style="margin:10px 0;font-size:13px;color:#666;"><em>Note: Please include the athlete's name in the transfer notes.</em></p>
          </div>

          <p style="color:#d93025;font-weight:bold;">
            ⚠️ If payment is not received within 48 hours, your registration may be automatically cancelled.
          </p>
          <p>Once we receive your payment, your pass will be activated and you can start booking sessions. We look forward to seeing you on the court!</p>

          <p style="margin-top:40px;">Best regards,</p>
          <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
        </div>
      `,
    });

    // 管理者への通知
    await resend.emails.send({
      from: "LTS System <info@ltseliteprep.ca>",
      to: "paolo@ltseliteprep.ca",
      subject: `NEW PASS PURCHASE: ${name} — ${label}`,
      html: `
        <h2>New Pass Purchase 🏀</h2>
        <table style="border-collapse:collapse;">
          <tr><td style="padding:6px 12px;color:#666;">Name</td><td style="padding:6px 12px;font-weight:bold;">${name}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Email</td><td style="padding:6px 12px;">${email}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Phone</td><td style="padding:6px 12px;">${phone || "—"}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Pass</td><td style="padding:6px 12px;">${label}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">Amount</td><td style="padding:6px 12px;font-weight:bold;">${amount}</td></tr>
        </table>
        <p style="color:#d93025;">Payment pending — awaiting E-transfer.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Buy Pass API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

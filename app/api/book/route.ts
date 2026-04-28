// ============================================================
// 予約 API ルート (app/api/book/route.ts)
// サーバーサイドで Supabase に保存 + Resend でメール通知
// ============================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, program, preferred_date, preferred_time, message } = body;

    // バリデーション
    if (!name || !email || !program) {
      return NextResponse.json(
        { error: "Name, email, and program are required" },
        { status: 400 }
      );
    }

    // 環境変数が設定されていない場合は、デモ用として成功レスポンスを返す
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "") {
      console.log("Mock booking success (Supabase is not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }

    // サーバー専用の Supabase クライアント（サービスロールキー使用）
    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    // 金額マッピング
    const priceMap: Record<string, string> = {
      futures: "$75",
      high: "$75",
      "pass-5": "$299",
      "pass-10": "$449",
      private: "TBD",
    };
    const amount = priceMap[program] || "TBD";

    // Googleスプレッドシート（GAS）への連携
    if (process.env.GOOGLE_WEBHOOK_URL) {
      try {
        await fetch(process.env.GOOGLE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: phone || "",
            program,
            amount, // GAS側でインボイスに使用
            preferred_date: preferred_date || "",
            preferred_time: preferred_time || "",
            message: message || "",
            created_at: new Date().toISOString()
          }),
          redirect: "follow"
        });
      } catch (gasError) {
        console.error("GAS Webhook Error:", gasError);
      }
    }

    // Supabase に保存
    let dbData = null;
    try {
      const { data, error: dbError } = await supabaseServer
        .from("bookings")
        .insert({
          name,
          email,
          phone: phone || null,
          program,
          preferred_date: preferred_date || null,
          preferred_time: preferred_time || null,
          message: message || null,
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB Error:", JSON.stringify(dbError, null, 2));
      } else {
        dbData = data;
      }
    } catch (e) {
      console.error("Supabase Error:", e);
    }

    // Resend でメール通知（設定されている場合のみ）
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const programLabels: Record<string, string> = {
          futures: "LTS Futures (Youth)",
          high: "LTS High (High School)",
          college: "LTS College (College Prep)",
          private: "1-on-1 Private Training",
        };

        // 1. 管理者（あなた）への通知
        await resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "yoshimasa@w-japan.net",
          subject: `New Session Booking: ${name} — ${programLabels[program] || program}`,
          html: `
            <h2>New Booking Request 🏀</h2>
            <table style="border-collapse:collapse;">
              <tr><td style="padding:6px 12px;color:#666;">Name</td><td style="padding:6px 12px;font-weight:bold;">${name}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Email</td><td style="padding:6px 12px;">${email}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Phone</td><td style="padding:6px 12px;">${phone || "—"}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Program</td><td style="padding:6px 12px;">${programLabels[program] || program}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Preferred Date</td><td style="padding:6px 12px;">${preferred_date || "No preference"}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Preferred Time</td><td style="padding:6px 12px;">${preferred_time || "No preference"}</td></tr>
              <tr><td style="padding:6px 12px;color:#666;">Message</td><td style="padding:6px 12px;">${message || "—"}</td></tr>
            </table>
          `,
        });

        // 2. ユーザー（お客さん）への確認メール (Invoice)
        await resend.emails.send({
          from: "LTS Elite Prep <info@ltseliteprep.ca>",
          to: email,
          subject: "Action Required: Complete your registration for LTS Elite Prep",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <p>Hi ${name},</p>
              <p>Thank you for registering with LTS Elite Prep!</p>
              <p>To secure your spot for the <strong>${programLabels[program] || program}</strong>, please complete the payment via E-transfer within the next 48 hours.</p>
              
              <div style="margin:30px 0;padding:25px;background:#f9f9f9;border-radius:16px;border:1px solid #eee;">
                <h3 style="margin-top:0;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Payment Details</h3>
                <p style="margin:10px 0;"><strong>E-transfer to:</strong> info@ltseliteprep.ca</p>
                <p style="margin:10px 0;"><strong>Amount:</strong> $75</p>
                <p style="margin:10px 0;font-size:13px;color:#666;"><em>Note: Please include the athlete's name in the transfer notes.</em></p>
              </div>

              <p style="color:#d93025;font-weight:bold;">Please note: If payment is not received within 48 hours, your registration may be automatically cancelled.</p>
              <p>Once we receive your payment, we will send you a formal receipt/invoice. We look forward to seeing you on the court!</p>
              
              <p style="margin-top:40px;">Best regards,</p>
              <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
            </div>
          `,
        });
      } catch (emailErr) {
        // メール送信失敗は予約自体の失敗にはしない
        console.error("Email notification error:", emailErr);
      }
    }

    return NextResponse.json({ success: true, booking: dbData });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

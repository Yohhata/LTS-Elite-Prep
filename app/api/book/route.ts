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
      "micro-academy": "$70",
      "pass-5": "$299",
      "pass-10": "$449",
      "pass-usage": "Pre-paid (Pass)",
      private: "$85",
    };
    const isPassUsage = message === "PASS USAGE" || message?.startsWith("PASS USAGE");
    let amount = priceMap[program] || "TBD";
    if (isPassUsage) amount = "Pre-paid (Pass)";

    // Validate pass remaining sessions if pass-usage
    if (isPassUsage) {
      const { data: pastBookings, error: fetchError } = await supabaseServer
        .from("bookings")
        .select("program, message")
        .eq("email", email.trim().toLowerCase())
        .neq("status", "cancelled");

      if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return NextResponse.json({ error: "Failed to validate pass usage." }, { status: 500 });
      }

      let capacity = 0;
      let used = 0;
      pastBookings?.forEach(b => {
        const isPastUsage = b.message?.includes("PASS USAGE");
        if (b.program === "pass-5" && !isPastUsage) { 
          capacity += 5; 
          if (b.message !== 'ADMIN MANUAL ADDITION') used += 1; 
        }
        else if (b.program === "pass-10" && !isPastUsage) { 
          capacity += 10; 
          if (b.message !== 'ADMIN MANUAL ADDITION') used += 1; 
        }
        else if (b.program === "pass-usage" || isPastUsage) { 
          used += 1; 
        }
      });

      if (capacity - used <= 0) {
        return NextResponse.json({ error: "No active session pass found or all sessions have been used. Please purchase a new pass." }, { status: 400 });
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

    // Resend のキーがない場合はエラーとして処理する（ローカルでのテスト対策）
    if (!process.env.RESEND_API_KEY) {
      console.error("CRITICAL: RESEND_API_KEY is completely missing in this environment!");
      return NextResponse.json(
        { error: "Email configuration missing (RESEND_API_KEY not found)" },
        { status: 500 }
      );
    }

    try {
      const { Resend } = require("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const programLabels: Record<string, string> = {
          "micro-academy": "Micro Academy (Ages 8-18)",
          college: "LTS College (College Prep)",
          private: "1-on-1 Private Training",
        };

        // 1. 管理者（あなた）への通知
        const { data: adminData, error: adminError } = await resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "paolo@ltseliteprep.ca",
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
        if (adminError) return NextResponse.json({ error: "Admin email failed", details: adminError }, { status: 500 });

        // 2. ユーザー（お客さん）への確認メール (Invoice or Confirmation)
        const userSubject = isPassUsage
          ? "Booking Confirmed — LTS Elite Prep"
          : "Action Required: Complete your registration for LTS Elite Prep";

        const userHtml = isPassUsage
          ? `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <p>Hi ${name},</p>
              <p>Your session booking has been received!</p>
              <p><strong>Date:</strong> ${preferred_date || "TBD"}</p>
              <p><strong>Time:</strong> ${preferred_time || "TBD"}</p>
              <p>One session will be deducted from your pass. We look forward to seeing you on the court!</p>
              <p style="margin-top:40px;">Best regards,</p>
              <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
            </div>
          `
          : `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <p>Hi ${name},</p>
              <p>Thank you for registering with LTS Elite Prep!</p>
              <p>To secure your spot for the <strong>${programLabels[program] || program}</strong>, please complete the payment via E-transfer within the next 48 hours.</p>

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
          `;

        const { data: userData, error: userError } = await resend.emails.send({
          from: "LTS Elite Prep <info@ltseliteprep.ca>",
          to: email,
          subject: userSubject,
          html: userHtml,
        });
        if (userError) return NextResponse.json({ error: "User email failed", details: userError }, { status: 500 });

        return NextResponse.json({ 
          success: true, 
          booking: dbData,
          debug: {
            admin: { data: adminData, error: adminError },
            user: { data: userData, error: userError }
          }
        });

      } catch (emailErr: any) {
        console.error("Resend Exception:", emailErr);
        return NextResponse.json({ 
          error: "Email exception", 
          message: emailErr.message || String(emailErr),
          stack: emailErr.stack
        }, { status: 500 });
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

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, level, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Supabase に保存 (inquiries テーブルを想定)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseServer = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await supabaseServer.from("college_inquiries").insert({
        name,
        email,
        level: level || "",
        message: message || ""
      });
    }

    // 2. Resend で自動返信
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "LTS Elite Prep <info@ltseliteprep.ca>",
        to: email,
        subject: "We received your LTS College Inquiry",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
            <p>Hi ${name},</p>
            <p>Thank you for your interest in the LTS College program!</p>
            <p>We have received your application and Coach Paolo will review it personally. Since this is an elite-level program, we ensure every athlete is the right fit for the environment.</p>
            <p>You can expect to hear back from us within 24-48 hours regarding the next steps.</p>
            <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:10px;font-size:14px;color:#666;">
              <strong>Your message:</strong><br>${message || "No additional message provided."}
            </div>
            <p>Best regards,</p>
            <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
          </div>
        `,
      });

      // 管理者への通知
      await resend.emails.send({
        from: "LTS System <info@ltseliteprep.ca>",
        to: "yoshimasa@w-japan.net",
        subject: `NEW COLLEGE INQUIRY: ${name}`,
        html: `
          <h3>New College Level Inquiry</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Current Level:</strong> ${level || "—"}</p>
          <p><strong>Message:</strong> ${message || "—"}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("College API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

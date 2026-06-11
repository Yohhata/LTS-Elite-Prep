import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parentName, email, phone, program, preferred_date, preferred_time } = body;

    if (!name || !email || !program) {
      return NextResponse.json({ error: "Name, email, and program are required" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log("Mock booking (Supabase not configured):", body);
      return NextResponse.json({ success: true, mocked: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    );

    // ── Pass check via pass_holders table ────────────────────
    let isPassHolder = false;

    if (program !== "private") {
      const { data: passes } = await supabase
        .from("pass_holders")
        .select("id, sessions_total, sessions_used")
        .eq("email", email.trim().toLowerCase())
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (passes && passes.length > 0) {
        // Find first pass with remaining sessions
        const activePass = passes.find((p) => p.sessions_used < p.sessions_total);
        if (activePass) {
          isPassHolder = true;
          // Increment sessions_used
          await supabase
            .from("pass_holders")
            .update({ sessions_used: activePass.sessions_used + 1 })
            .eq("id", activePass.id);

          // Auto-expire if fully used
          if (activePass.sessions_used + 1 >= activePass.sessions_total) {
            await supabase
              .from("pass_holders")
              .update({ status: "expired" })
              .eq("id", activePass.id);
          }
        }
      }
    }

    const amount = isPassHolder ? "Pre-paid (Pass)" : program === "private" ? "$85" : "$70";

    // ── Save booking ──────────────────────────────────────────
    await supabase.from("bookings").insert({
      name,
      email,
      phone: phone || null,
      program: program === "private" ? "private" : "micro-academy",
      preferred_date: preferred_date || null,
      preferred_time: preferred_time || null,
      message: isPassHolder ? "PASS USAGE" : program === "private" ? null : "DROP-IN",
    });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const dateLabel = preferred_date
      ? new Date(preferred_date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        })
      : "TBD";

    const userHtml = isPassHolder
      ? `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
          <p>Hi ${name},</p>
          <p>Your session has been booked and <strong>1 session has been deducted from your pass</strong>.</p>
          <div style="margin:24px 0;padding:20px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;">
            <p style="margin:6px 0;"><strong>Date:</strong> ${dateLabel}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${preferred_time || "TBD"}</p>
          </div>
          <p>See you on the court!</p>
          <p style="margin-top:40px;">Best regards,<br><strong>Paolo</strong><br>LTS Elite Prep Team</p>
        </div>
      `
      : `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
          <p>Hi ${name},</p>
          <p>Thanks for booking a ${program === "private" ? "1-on-1 Private Training" : "Drop-In"} session with LTS Elite Prep!</p>
          <p>To secure your spot, please complete the payment via E-transfer within the next 48 hours.</p>
          <div style="margin:24px 0;padding:20px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;">
            <p style="margin:6px 0;"><strong>Date:</strong> ${dateLabel}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${preferred_time || "TBD"}</p>
            <p style="margin:16px 0 6px;"><strong>E-transfer to:</strong> info@ltseliteprep.ca</p>
            <p style="margin:6px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin:10px 0;font-size:13px;color:#666;"><em>Include your name in the transfer notes.</em></p>
          </div>
          <p style="color:#d93025;font-weight:bold;">Payment must be received within 48 hours to hold your spot.</p>
          <p>💡 <strong>Want to save?</strong> Purchase a session pass at <a href="https://ltseliteprep.ca/buy-pass">ltseliteprep.ca/buy-pass</a> for better per-session rates.</p>
          <p style="margin-top:40px;">Best regards,<br><strong>Paolo</strong><br>LTS Elite Prep Team</p>
        </div>
      `;

    await Promise.all([
      resend.emails.send({
        from: "LTS Elite Prep <info@ltseliteprep.ca>",
        to: email,
        subject: isPassHolder
          ? "Session Booked — LTS Elite Prep"
          : `Action Required: Payment for your ${program === "private" ? "Private Training" : "Drop-In"} session`,
        html: userHtml,
      }),
      resend.emails.send({
        from: "LTS System <info@ltseliteprep.ca>",
        to: "paolo@ltseliteprep.ca",
        subject: `New Booking: ${name} — ${isPassHolder ? "Pass Usage" : program === "private" ? "Private" : "Drop-In"}`,
        html: `
          <h2>New Session Booking</h2>
          <p><strong>Athlete:</strong> ${name}</p>
          <p><strong>Parent:</strong> ${parentName || "—"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "—"}</p>
          <p><strong>Type:</strong> ${isPassHolder ? "Pass Holder (1 session deducted)" : program === "private" ? "Private Training ($85)" : "Drop-In ($70)"}</p>
          <p><strong>Date:</strong> ${dateLabel}</p>
          <p><strong>Time:</strong> ${preferred_time || "TBD"}</p>
        `,
      }),
    ]);

    return NextResponse.json({ success: true, isPassHolder });
  } catch (err) {
    console.error("Book API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

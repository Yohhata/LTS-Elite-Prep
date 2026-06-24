import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PACKAGE_LABELS: Record<string, string> = {
  "weekend-1": "Weekend 1 — July 11 (BUILD) + July 12 (PERFORM)",
  "weekend-2": "Weekend 2 — July 18 (BUILD) + July 19 (PERFORM)",
  "both": "Both Weekends — July 11, 12, 18 & 19",
  "dropin": "Drop-in (single session)",
};

const SESSION_LABELS: Record<string, string> = {
  jul11: "July 11 (Sat) · BUILD · 2:00–5:00 PM",
  jul12: "July 12 (Sun) · PERFORM · 4:00–7:00 PM",
  jul18: "July 18 (Sat) · BUILD · 2:00–5:00 PM",
  jul19: "July 19 (Sun) · PERFORM · 2:00–5:00 PM",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athleteName, parentName, parentEmail, campId, campName, campPrice, packageType, dropinSession } = body;

    if (!athleteName || !parentName || !parentEmail) {
      return NextResponse.json({ error: "Athlete name, parent name, and parent email are required" }, { status: 400 });
    }

    const pkgLabel = PACKAGE_LABELS[packageType] || packageType || "—";
    const sessionLabel = dropinSession ? SESSION_LABELS[dropinSession] || dropinSession : null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await supabase.from("camp_registrations").insert({
        athlete_name: athleteName,
        parent_name: parentName,
        parent_email: parentEmail,
        camp_id: campId || null,
        camp_name: campName || null,
        amount: campPrice || null,
        package_type: packageType || null,
        dropin_session: dropinSession || null,
        status: "pending_payment",
      });
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await Promise.all([
        // ── Parent confirmation email ──────────────────────────
        resend.emails.send({
          from: "LTS Elite Prep <info@ltseliteprep.ca>",
          to: parentEmail,
          subject: `Registration Confirmed: Blueprint Series — ${athleteName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
              <div style="background:#000;padding:28px 32px;border-radius:16px 16px 0 0;">
                <p style="color:#fff;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">LTS Elite Prep</p>
                <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-0.02em;">Blueprint Series</h1>
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;">July 2026 · High School</p>
              </div>

              <div style="background:#f9f9f9;padding:28px 32px;">
                <p>Hi <strong>${parentName}</strong>,</p>
                <p>We've received your registration for <strong>${athleteName}</strong>.
                Your spot is held — please complete the e-transfer payment within <strong>48 hours</strong> to confirm it.</p>

                <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:20px;margin:24px 0;">
                  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 12px;">Registration Summary</p>
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${athleteName}</td></tr>
                    <tr><td style="padding:6px 0;color:#666;">Package</td><td style="padding:6px 0;font-weight:700;">${pkgLabel}</td></tr>
                    ${sessionLabel ? `<tr><td style="padding:6px 0;color:#666;">Session</td><td style="padding:6px 0;font-weight:700;">${sessionLabel}</td></tr>` : ""}
                    <tr><td style="padding:6px 0;color:#666;">Amount Due</td><td style="padding:6px 0;font-size:20px;font-weight:900;">${campPrice || "TBD"}</td></tr>
                  </table>
                </div>

                <div style="background:#000;border-radius:12px;padding:20px;margin:24px 0;">
                  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin:0 0 12px;">Payment Instructions</p>
                  <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">E-transfer to:</strong> info@ltseliteprep.ca</p>
                  <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Amount:</strong> ${campPrice || "TBD"}</p>
                  <p style="color:#fff;margin:6px 0;font-size:14px;"><strong style="color:rgba(255,255,255,0.5);">Notes:</strong> ${athleteName} — Blueprint Series</p>
                </div>

                <p style="color:#d93025;font-weight:700;font-size:13px;">⚠ Payment must be received within 48 hours to hold your spot.</p>
                <p>Questions? Reply to this email or contact <a href="mailto:info@ltseliteprep.ca">info@ltseliteprep.ca</a></p>

                <p style="margin-top:32px;font-size:14px;">See you on the court,<br/><strong>Paolo</strong><br/>LTS Elite Prep Team</p>
              </div>

              <div style="background:#f0f0f0;padding:16px 32px;border-radius:0 0 16px 16px;text-align:center;">
                <p style="font-size:11px;color:#999;margin:0;">Blueprint Series · July 2026 · High School Athletes · Registration closes July 10</p>
              </div>
            </div>
          `,
        }),

        // ── Admin notification ──────────────────────────────────
        resend.emails.send({
          from: "LTS System <info@ltseliteprep.ca>",
          to: "paolo@ltseliteprep.ca",
          subject: `🏀 NEW CAMP REG: ${athleteName} — ${pkgLabel}`,
          html: `
            <h2 style="font-family:sans-serif;">New Blueprint Series Registration</h2>
            <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
              <tr><td style="padding:6px 16px 6px 0;color:#666;">Athlete</td><td style="padding:6px 0;font-weight:700;">${athleteName}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666;">Parent</td><td style="padding:6px 0;">${parentName}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666;">Email</td><td style="padding:6px 0;">${parentEmail}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666;">Package</td><td style="padding:6px 0;font-weight:700;">${pkgLabel}</td></tr>
              ${sessionLabel ? `<tr><td style="padding:6px 16px 6px 0;color:#666;">Session</td><td style="padding:6px 0;">${sessionLabel}</td></tr>` : ""}
              <tr><td style="padding:6px 16px 6px 0;color:#666;">Amount</td><td style="padding:6px 0;font-size:18px;font-weight:900;">${campPrice || "TBD"}</td></tr>
            </table>
          `,
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Camp API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

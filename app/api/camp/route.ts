import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { athleteName, parentName, parentEmail, campId, campName, campPrice, packageType, dropinSession } = body;

    if (!athleteName || !parentName || !parentEmail) {
      return NextResponse.json({ error: "Athlete name, parent name, and parent email are required" }, { status: 400 });
    }

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

      await resend.emails.send({
        from: "LTS Elite Prep <info@ltseliteprep.ca>",
        to: parentEmail,
        subject: "Action Required: Complete your camp registration for LTS Elite Prep",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#000;line-height:1.6;">
            <p>Hi ${parentName},</p>
            <p>Thank you for registering <strong>${athleteName}</strong> for <strong>${campName || "LTS Summer Camp/Clinic"}</strong>!</p>
            <p>To secure your spot, please complete the payment via E-transfer within the next 48 hours.</p>

            <div style="margin:30px 0;padding:25px;background:#f9f9f9;border-radius:16px;border:1px solid #eee;">
              <h3 style="margin-top:0;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Registration Summary</h3>
              ${packageType ? `<p style="margin:10px 0;"><strong>Package:</strong> ${packageType}</p>` : ""}
              ${dropinSession ? `<p style="margin:10px 0;"><strong>Session:</strong> ${dropinSession}</p>` : ""}
              <h3 style="margin-top:16px;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;">Payment Details</h3>
              <p style="margin:10px 0;"><strong>E-transfer to:</strong> info@ltseliteprep.ca</p>
              ${campPrice ? `<p style="margin:10px 0;"><strong>Amount:</strong> ${campPrice}</p>` : ""}
              <p style="margin:10px 0;font-size:13px;color:#666;"><em>Note: Please include the athlete's name (${athleteName}) in the transfer notes.</em></p>
            </div>

            <p style="color:#d93025;font-weight:bold;">If payment is not received within 48 hours, your registration may be cancelled.</p>
            <p>We look forward to seeing ${athleteName} on the court!</p>

            <p style="margin-top:40px;">Best regards,</p>
            <p><strong>Paolo</strong><br>LTS Elite Prep Team</p>
          </div>
        `,
      });

      await resend.emails.send({
        from: "LTS System <info@ltseliteprep.ca>",
        to: "paolo@ltseliteprep.ca",
        subject: `NEW CAMP REGISTRATION: ${athleteName} (${campName || "Camp"})`,
        html: `
          <h2>New Camp Registration</h2>
          <p><strong>Athlete:</strong> ${athleteName}</p>
          <p><strong>Parent:</strong> ${parentName}</p>
          <p><strong>Parent Email:</strong> ${parentEmail}</p>
          <p><strong>Camp:</strong> ${campName || "—"}</p>
          <p><strong>Package:</strong> ${packageType || "—"}</p>
          ${dropinSession ? `<p><strong>Drop-in Session:</strong> ${dropinSession}</p>` : ""}
          <p><strong>Amount:</strong> ${campPrice || "TBD"}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Camp API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

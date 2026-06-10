import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { to, subject, html, from } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Resend API key is not configured" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: from || "LTS Elite Prep <info@ltseliteprep.ca>",
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

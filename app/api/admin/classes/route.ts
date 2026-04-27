import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role key for admin operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Simple password check (for MVP)
    if (data.password !== "lts2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, class_date, start_time, end_time, coach, capacity } = data;

    const { data: insertedData, error } = await supabaseAdmin
      .from("classes")
      .insert([{
        title,
        description: description || null,
        class_date,
        start_time,
        end_time,
        coach: coach || null,
        capacity: parseInt(capacity) || 15
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Admin Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertedData });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const password = searchParams.get("password");

    if (password !== "lts2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

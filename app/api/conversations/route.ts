import { NextResponse } from "next/server";
import { enrichConversation } from "@/lib/leadLogic";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ConversationInput } from "@/lib/types";

function normalizePayload(payload: ConversationInput): ConversationInput {
  const clean = (value?: string | null) => (typeof value === "string" && value.trim() && value.trim() !== "Not set" ? value.trim() : null);

  return {
    company_name: clean(payload.company_name),
    role: clean(payload.role),
    person_name: clean(payload.person_name),
    mobile: clean(payload.mobile),
    email: clean(payload.email),
    event_day: clean(payload.event_day),
    time_window: clean(payload.time_window),
    meeting_time: clean(payload.meeting_time),
    hall: clean(payload.hall),
    stand_number: clean(payload.stand_number),
    shared_stand: clean(payload.shared_stand),
    country: clean(payload.country),
    linkedin_connected: typeof payload.linkedin_connected === "boolean" ? payload.linkedin_connected : false,
    linkedin_message_sent_to: clean(payload.linkedin_message_sent_to),
    linkedin_message_status: clean(payload.linkedin_message_status) ?? "Not contacted",
    linkedin_reply_notes: clean(payload.linkedin_reply_notes),
    company_relevance: clean(payload.company_relevance),
    person_decision_proximity: clean(payload.person_decision_proximity),
    pain_confirmed: clean(payload.pain_confirmed),
    pain_category: clean(payload.pain_category),
    pilot_possible: clean(payload.pilot_possible),
    next_step: clean(payload.next_step),
    notes: clean(payload.notes),
    previous_contact: clean(payload.previous_contact),
    meeting_outcome: clean(payload.meeting_outcome),
    follow_up_consent: typeof payload.follow_up_consent === "boolean" ? payload.follow_up_consent : null
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ila_conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ records: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConversationInput;
    const normalized = normalizePayload(body);
    const enriched = enrichConversation(normalized);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("ila_conversations")
      .insert(enriched)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ record: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as ConversationInput & { id?: string };

    if (!body.id) {
      return NextResponse.json({ error: "Conversation id is required." }, { status: 400 });
    }

    const normalized = normalizePayload(body);
    const enriched = enrichConversation(normalized);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("ila_conversations")
      .update({
        ...enriched,
        updated_at: new Date().toISOString()
      })
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ record: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json({ error: "Conversation id is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("ila_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error." },
      { status: 500 }
    );
  }
}

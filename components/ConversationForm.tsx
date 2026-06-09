"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ConversationInput, ConversationRecord } from "@/lib/types";

const roleOptions = [
  "Head of Operations",
  "Operations Director",
  "COO",
  "General Manager",
  "Production Director",
  "Head of Production",
  "Plant Manager",
  "Production Program Manager",
  "Head of Engineering",
  "Manufacturing Engineering Manager",
  "Technical Director",
  "Supply Chain Director",
  "Procurement Director",
  "Quality Manager",
  "AS9100 / Compliance Manager",
  "Estimating Manager",
  "Business Development Manager",
  "CTO / Digital Transformation Lead",
  "Other"
];

const fields = {
  event_day: ["Wed", "Thu", "Fri"],
  time_window: ["Morning", "Noon", "Afternoon"],
  company_relevance: ["High", "Medium", "Low"],
  person_decision_proximity: ["Decision maker", "Influencer", "Referral only", "Not relevant"],
  pain_confirmed: ["Strongly", "Somewhat", "Not really"],
  pain_category: [
    "Multiple / All",
    "Capacity",
    "Engineering",
    "Supplier risk",
    "Quality / Compliance",
    "Delivery",
    "Margin",
    "Internal coordination",
    "Unknown"
  ],
  pilot_possible: ["Yes", "Maybe", "No", "Unknown"],
  next_step: ["Send follow-up", "Send demo link", "Book call", "Send NDA", "Ask for referral", "No action"],
  previous_contact: ["Yes", "No"],
  meeting_outcome: [
    "Hot Pilot Candidate",
    "Warm Demo Follow-up",
    "NDA / Data-Sensitive Lead",
    "Referral Needed",
    "Send Info / Keep Warm",
    "Not ICP / Low Priority",
    "Partner / Media / Network Contact",
    "Post-Event Timing / Later Follow-up"
  ]
};

const initialForm: ConversationInput = {
  company_name: "",
  role: "",
  person_name: "",
  mobile: "",
  email: "",
  event_day: "",
  time_window: "",
  company_relevance: "",
  person_decision_proximity: "",
  pain_confirmed: "",
  pain_category: "",
  pilot_possible: "",
  next_step: "",
  notes: "",
  previous_contact: "",
  meeting_outcome: "",
  follow_up_consent: false
};

function formFromRecord(record?: ConversationInput | null): ConversationInput {
  return {
    company_name: record?.company_name ?? "",
    role: record?.role ?? "",
    person_name: record?.person_name ?? "",
    mobile: record?.mobile ?? "",
    email: record?.email ?? "",
    event_day: record?.event_day ?? "",
    time_window: record?.time_window ?? "",
    company_relevance: record?.company_relevance ?? "",
    person_decision_proximity: record?.person_decision_proximity ?? "",
    pain_confirmed: record?.pain_confirmed ?? "",
    pain_category: record?.pain_category ?? "",
    pilot_possible: record?.pilot_possible ?? "",
    next_step: record?.next_step ?? "",
    notes: record?.notes ?? "",
    previous_contact: record?.previous_contact ?? "",
    meeting_outcome: record?.meeting_outcome ?? "",
    follow_up_consent: Boolean(record?.follow_up_consent)
  };
}

function inputClass() {
  return "mt-2 min-h-[52px] w-full rounded-xl border border-white/10 bg-[#0b111d]/90 px-4 py-3 text-base text-white shadow-inner shadow-black/20 outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20";
}

function TextField({
  label,
  helper,
  name,
  type = "text",
  value,
  onChange
}: {
  label: string;
  helper?: string;
  name: keyof ConversationInput;
  type?: string;
  value: string;
  onChange: (name: keyof ConversationInput, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.95rem] font-semibold text-slate-100">{label}</span>
      {helper ? <span className="mt-1 block text-sm leading-5 text-slate-400">{helper}</span> : null}
      <input type={type} value={value} onChange={(event) => onChange(name, event.target.value)} className={inputClass()} />
    </label>
  );
}

function SelectField({
  label,
  helper,
  name,
  value,
  options,
  placeholder = "Select...",
  onChange
}: {
  label: string;
  helper?: string;
  name: keyof ConversationInput;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (name: keyof ConversationInput, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.95rem] font-semibold text-slate-100">{label}</span>
      {helper ? <span className="mt-1 block text-sm leading-5 text-slate-400">{helper}</span> : null}
      <select value={value} onChange={(event) => onChange(name, event.target.value)} className={inputClass()}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormSection({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101827]/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal/80">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function statusClasses(status?: string | null) {
  if (status === "Hot Lead") return "border-amber-400/40 bg-amber-500/[0.12] text-amber-100";
  if (status === "Warm Lead") return "border-signal/40 bg-signal/[0.12] text-teal-100";
  if (status === "Nurture") return "border-sky-400/35 bg-sky-500/[0.12] text-sky-100";
  return "border-slate-500/35 bg-slate-700/25 text-slate-100";
}

export function ConversationForm({
  initialRecord,
  mode = "create",
  embedded = false,
  onSaved,
  onCancel
}: {
  initialRecord?: ConversationRecord | null;
  mode?: "create" | "edit";
  embedded?: boolean;
  onSaved?: (record: ConversationRecord) => void;
  onCancel?: () => void;
} = {}) {
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<ConversationInput>(() => formFromRecord(initialRecord ?? initialForm));
  const [savedRecord, setSavedRecord] = useState<ConversationRecord | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm(formFromRecord(initialRecord ?? initialForm));
    setSavedRecord(null);
    setCopied(false);
    setError("");
  }, [initialRecord]);

  function updateField(name: keyof ConversationInput, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const response = await fetch("/api/conversations", {
      method: isEditMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEditMode ? { ...form, id: initialRecord?.id } : form)
    });

    const data = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Could not save conversation.");
      return;
    }

    if (isEditMode) {
      onSaved?.(data.record);
      return;
    }

    setSavedRecord(data.record);
  }

  async function copyFollowUp() {
    if (!savedRecord?.generated_follow_up) return;
    await navigator.clipboard.writeText(savedRecord.generated_follow_up);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function startNew() {
    setForm(initialForm);
    setSavedRecord(null);
    setCopied(false);
    setError("");
  }

  if (savedRecord) {
    return (
      <main className="min-h-screen bg-field-console px-4 py-6">
        <section className="mx-auto w-full max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-[#101827]/85 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Conversation Saved</p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Lead intelligence ready</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Score, status, next action, and follow-up message were generated from the captured conversation.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0b111d] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lead Score</p>
                <p className="mt-2 text-5xl font-bold text-white">{savedRecord.lead_score}</p>
                <p className="mt-1 text-sm text-slate-500">Capped at 100</p>
              </div>
              <div className={`rounded-2xl border p-5 ${statusClasses(savedRecord.lead_status)}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">Lead Status</p>
                <p className="mt-2 text-3xl font-bold">{savedRecord.lead_status}</p>
                <p className="mt-3 text-sm leading-6 opacity-90">{savedRecord.suggested_action}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b111d]/90 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Generated Follow-up Message</p>
              <pre className="mt-4 max-h-[460px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.08] bg-black/20 p-4 text-[0.95rem] leading-7 text-slate-100">
                {savedRecord.generated_follow_up}
              </pre>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={copyFollowUp} className="h-[52px] rounded-xl bg-signal px-4 font-bold text-ink shadow-lg shadow-signal/10">
                {copied ? "Copied" : "Copy Follow-up"}
              </button>
              <button type="button" onClick={startNew} className="h-[52px] rounded-xl border border-white/10 bg-white/5 px-4 font-semibold text-white">
                New Conversation
              </button>
              <Link href="/records" className="flex h-[52px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 font-semibold text-white">
                View Records
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={embedded ? "bg-field-console" : "min-h-screen bg-field-console pb-28"}>
      {!embedded ? (
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#080b12]/88 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">ALYN Internal</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">ILA Scout</h1>
            <p className="mt-1 text-sm leading-5 text-slate-400">Capture ILA conversations. Score leads. Generate follow-ups.</p>
          </div>
          <Link href="/records" className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 shadow-lg shadow-black/20">
            Records
          </Link>
        </div>
      </header>
      ) : null}

      <form onSubmit={handleSubmit} className={embedded ? "grid w-full gap-5" : "mx-auto grid w-full max-w-3xl gap-5 px-4 py-5"}>
        <FormSection eyebrow="01" title="Company & Contact">
          <TextField label="Company Name" name="company_name" value={form.company_name ?? ""} onChange={updateField} />
          <SelectField label="Role" name="role" value={form.role ?? ""} options={roleOptions} onChange={updateField} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Person Name" name="person_name" value={form.person_name ?? ""} onChange={updateField} />
            <TextField label="Mobile" name="mobile" value={form.mobile ?? ""} onChange={updateField} />
          </div>
          <TextField label="Email" name="email" type="email" value={form.email ?? ""} onChange={updateField} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Event Day"
              name="event_day"
              value={form.event_day ?? ""}
              options={fields.event_day}
              placeholder="Not set"
              onChange={updateField}
            />
            <SelectField
              label="Time Window"
              name="time_window"
              value={form.time_window ?? ""}
              options={fields.time_window}
              placeholder="Not set"
              onChange={updateField}
            />
          </div>
        </FormSection>

        <FormSection eyebrow="02" title="Relevance & Decision Fit">
          <SelectField
            label="Was this company relevant for ALYN Aerospace?"
            helper="How close is this company to ALYN Aerospace ICP?"
            name="company_relevance"
            value={form.company_relevance ?? ""}
            options={fields.company_relevance}
            onChange={updateField}
          />
          <SelectField
            label="Was the person close to the RFQ / operations decision?"
            helper="Is this person close to RFQ, operations, production, engineering, quality, or supply-chain decisions?"
            name="person_decision_proximity"
            value={form.person_decision_proximity ?? ""}
            options={fields.person_decision_proximity}
            onChange={updateField}
          />
          <SelectField
            label="Was there previous LinkedIn / email contact?"
            name="previous_contact"
            value={form.previous_contact ?? ""}
            options={fields.previous_contact}
            onChange={updateField}
          />
        </FormSection>

        <FormSection eyebrow="03" title="Pain & Pilot Signal">
          <SelectField
            label="Did they confirm the RFQ decision pain?"
            helper="Did they clearly recognize the RFQ decision problem?"
            name="pain_confirmed"
            value={form.pain_confirmed ?? ""}
            options={fields.pain_confirmed}
            onChange={updateField}
          />
          <SelectField
            label="Where does the pain sit?"
            name="pain_category"
            value={form.pain_category ?? ""}
            options={fields.pain_category}
            onChange={updateField}
          />
          <SelectField
            label="Is a pilot possible?"
            helper="Could they realistically test ALYN with recent or anonymized RFQs?"
            name="pilot_possible"
            value={form.pilot_possible ?? ""}
            options={fields.pilot_possible}
            onChange={updateField}
          />
        </FormSection>

        <FormSection eyebrow="04" title="Outcome & Notes">
          <SelectField label="What is the next step?" name="next_step" value={form.next_step ?? ""} options={fields.next_step} onChange={updateField} />
          <SelectField
            label="Meeting Outcome"
            helper="Choose the closest result of the conversation."
            name="meeting_outcome"
            value={form.meeting_outcome ?? ""}
            options={fields.meeting_outcome}
            onChange={updateField}
          />
          <label className="block">
            <span className="text-[0.95rem] font-semibold text-slate-100">Notes</span>
            <textarea
              value={form.notes ?? ""}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b111d]/90 px-4 py-3 text-base leading-6 text-white shadow-inner shadow-black/20 outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
          </label>
          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-[0.95rem] leading-6 text-slate-100">
            <input
              type="checkbox"
              checked={Boolean(form.follow_up_consent)}
              onChange={(event) => setForm((current) => ({ ...current, follow_up_consent: event.target.checked }))}
              className="mt-1 h-5 w-5 shrink-0 accent-signal"
            />
            <span>Person gave permission for ALYN to follow up after ILA.</span>
          </label>
        </FormSection>

        {error ? <p className="rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-sm text-red-200">{error}</p> : null}

        <div className={embedded ? "rounded-2xl border border-white/10 bg-[#101827]/80 p-4" : "fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#080b12]/92 px-4 py-3 backdrop-blur-xl sm:static sm:rounded-2xl sm:border sm:bg-[#101827]/80 sm:p-4"}>
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-center text-sm text-slate-400 sm:text-left">All fields are optional. Save whatever you captured.</p>
            <div className={embedded ? "grid gap-3 sm:grid-cols-[1fr_auto]" : ""}>
              <button
                type="submit"
                disabled={isSaving}
                className="h-14 w-full rounded-xl bg-signal px-5 text-base font-bold text-ink shadow-xl shadow-signal/10 transition hover:bg-[#7be3c7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : isEditMode ? "Save Update" : "Save Conversation"}
              </button>
              {embedded && onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-14 rounded-xl border border-white/10 bg-white/5 px-5 text-base font-semibold text-white"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

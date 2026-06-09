"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConversationForm } from "@/components/ConversationForm";
import type { ConversationRecord } from "@/lib/types";

const columns: Array<{ key: keyof ConversationRecord; label: string }> = [
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Updated At" },
  { key: "event_day", label: "Event Day" },
  { key: "time_window", label: "Time Window" },
  { key: "meeting_time", label: "Meeting Time" },
  { key: "country", label: "Country" },
  { key: "company_name", label: "Company" },
  { key: "person_name", label: "Person" },
  { key: "role", label: "Role" },
  { key: "linkedin_connected", label: "LinkedIn Connected" },
  { key: "linkedin_message_sent_to", label: "LinkedIn Sent To" },
  { key: "linkedin_message_status", label: "LinkedIn Status" },
  { key: "linkedin_reply_notes", label: "LinkedIn Notes" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "company_relevance", label: "Company Relevance" },
  { key: "person_decision_proximity", label: "Decision Proximity" },
  { key: "pain_confirmed", label: "Pain Confirmed" },
  { key: "pain_category", label: "Pain Category" },
  { key: "pilot_possible", label: "Pilot Possible" },
  { key: "next_step", label: "Next Step" },
  { key: "meeting_outcome", label: "Meeting Outcome" },
  { key: "notes", label: "Notes" }
];

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function displayValue(record: ConversationRecord, key: keyof ConversationRecord) {
  if (key === "created_at" || key === "updated_at") return formatDate(record[key]);
  if (key === "linkedin_connected") return record.linkedin_connected ? "Yes" : "No";
  if (key === "linkedin_message_status") return record.linkedin_message_status || "Not contacted";
  if (key === "linkedin_message_sent_to" || key === "linkedin_reply_notes") return record[key] || "Not set";
  if (key === "event_day" || key === "time_window" || key === "meeting_time" || key === "country") return record[key] || "Not set";
  return String(record[key] ?? "");
}

function relevancePill(relevance?: string | null) {
  if (relevance === "High") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (relevance === "Medium") return "border-amber-200 bg-amber-50 text-amber-800";
  if (relevance === "Low") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-slate-200 bg-white text-slate-500";
}

function linkedinStatusPill(status?: string | null) {
  if (status === "Meeting agreed") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  if (status === "Replied" || status === "Interested to talk") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "Seen / no reply" || status === "Follow up later") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "Message sent") return "border-sky-200 bg-sky-50 text-sky-800";
  if (status === "Not relevant") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-slate-200 bg-white text-slate-500";
}

export function RecordsTable() {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [meetingOutcome, setMeetingOutcome] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [country, setCountry] = useState("");
  const [linkedinConnected, setLinkedinConnected] = useState("");
  const [linkedinMessageStatus, setLinkedinMessageStatus] = useState("");
  const [editingRecord, setEditingRecord] = useState<ConversationRecord | null>(null);
  const [deletingId, setDeletingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(data.error ?? "Could not load records.");
        return;
      }

      setRecords(data.records ?? []);
    }

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !term ||
        columns.some(({ key }) => String(record[key] ?? "").toLowerCase().includes(term)) ||
        String(record.generated_follow_up ?? "").toLowerCase().includes(term);
      const matchesOutcome = !meetingOutcome || record.meeting_outcome === meetingOutcome;
      const matchesEventDay = !eventDay || (record.event_day ?? "") === eventDay;
      const matchesTimeWindow = !timeWindow || (record.time_window ?? "") === timeWindow;
      const matchesMeetingTime = !meetingTime || (record.meeting_time ?? "") === meetingTime;
      const matchesCountry = !country || (record.country ?? "").toLowerCase() === country.toLowerCase();
      const matchesLinkedin =
        !linkedinConnected ||
        (linkedinConnected === "Yes" ? Boolean(record.linkedin_connected) : !record.linkedin_connected);
      const matchesLinkedinStatus =
        !linkedinMessageStatus || (record.linkedin_message_status ?? "Not contacted") === linkedinMessageStatus;
      return matchesSearch && matchesOutcome && matchesEventDay && matchesTimeWindow && matchesMeetingTime && matchesCountry && matchesLinkedin && matchesLinkedinStatus;
    });
  }, [records, search, meetingOutcome, eventDay, timeWindow, meetingTime, country, linkedinConnected, linkedinMessageStatus]);

  const meetingOutcomes = Array.from(new Set(records.map((record) => record.meeting_outcome).filter(Boolean)));
  const eventDays = ["Wed", "Thu", "Fri"];
  const timeWindows = ["Morning", "Noon", "Afternoon"];
  const meetingTimes = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00"
  ];
  const countries = Array.from(new Set(records.map((record) => record.country).filter(Boolean))).sort();
  const linkedinMessageStatuses = [
    "Not contacted",
    "Message sent",
    "Seen / no reply",
    "Replied",
    "Interested to talk",
    "Meeting agreed",
    "Not relevant",
    "Follow up later"
  ];

  function exportCsv() {
    const header = columns.map((column) => column.label);
    const rows = filteredRecords.map((record) => [
      ...columns.map(({ key }) => displayValue(record, key))
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alyn-ila-scout-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleRecordUpdated(updatedRecord: ConversationRecord) {
    setRecords((current) => current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)));
    setEditingRecord(null);
  }

  async function deleteRecord(record: ConversationRecord) {
    const label = record.company_name || record.person_name || "this record";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    setDeletingId(record.id);
    setError("");
    const response = await fetch("/api/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id })
    });
    const data = await response.json();
    setDeletingId("");

    if (!response.ok) {
      setError(data.error ?? "Could not delete record.");
      return;
    }

    setRecords((current) => current.filter((item) => item.id !== record.id));
  }

  return (
    <main className="min-h-screen bg-field-console">
      <header className="border-b border-slate-200 bg-white/90 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ALYN Internal</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Conversation Records</h1>
            <p className="mt-1 text-sm leading-5 text-slate-600">Review captured contacts, meeting timing, notes, and export CSV.</p>
          </div>
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm">
            New Conversation
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records"
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <select
              value={meetingOutcome}
              onChange={(event) => setMeetingOutcome(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All outcomes</option>
              {meetingOutcomes.map((outcome) => (
                <option key={outcome} value={outcome ?? ""}>
                  {outcome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="h-[52px] rounded-xl bg-signal px-5 font-bold text-ink shadow-lg shadow-signal/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!filteredRecords.length}
            >
              Export CSV
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[160px_180px_180px_180px_170px_220px]">
            <select
              value={eventDay}
              onChange={(event) => setEventDay(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All event days</option>
              {eventDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select
              value={timeWindow}
              onChange={(event) => setTimeWindow(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All time windows</option>
              {timeWindows.map((window) => (
                <option key={window} value={window}>
                  {window}
                </option>
              ))}
            </select>
            <select
              value={meetingTime}
              onChange={(event) => setMeetingTime(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All meeting times</option>
              {meetingTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item ?? ""}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={linkedinConnected}
              onChange={(event) => setLinkedinConnected(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All LinkedIn</option>
              <option value="Yes">LinkedIn: Yes</option>
              <option value="No">LinkedIn: No</option>
            </select>
            <select
              value={linkedinMessageStatus}
              onChange={(event) => setLinkedinMessageStatus(event.target.value)}
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All message statuses</option>
              {linkedinMessageStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{filteredRecords.length} shown</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{records.length} total</span>
          </div>
        </div>

        {isLoading ? <p className="mt-6 text-slate-600">Loading records...</p> : null}
        {error ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[2500px] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-[0.04em] text-slate-600">
                <tr>
                  <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">
                    Update
                  </th>
                  <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">
                    Delete
                  </th>
                  {columns.map((column) => (
                    <th key={column.key} className="border-b border-r border-slate-200 px-4 py-4 font-semibold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 odd:bg-slate-50/60 hover:bg-emerald-50/40">
                    <td className="border-r border-slate-100 px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(record)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:border-signal/50"
                      >
                        Update
                      </button>
                    </td>
                    <td className="border-r border-slate-100 px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => deleteRecord(record)}
                        disabled={deletingId === record.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === record.id ? "Deleting" : "Delete"}
                      </button>
                    </td>
                    {columns.map(({ key }) => (
                      <td key={key} className="max-w-[280px] border-r border-slate-100 px-4 py-4 align-top text-slate-800">
                        {key === "created_at" || key === "updated_at" ? (
                          formatDate(record[key])
                        ) : key === "company_relevance" ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${relevancePill(record.company_relevance)}`}>
                            {record.company_relevance || "Not set"}
                          </span>
                        ) : key === "linkedin_connected" ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${record.linkedin_connected ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                            {record.linkedin_connected ? "Yes" : "No"}
                          </span>
                        ) : key === "linkedin_message_status" ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${linkedinStatusPill(record.linkedin_message_status)}`}>
                            {record.linkedin_message_status || "Not contacted"}
                          </span>
                        ) : key === "linkedin_message_sent_to" || key === "linkedin_reply_notes" ? (
                          <span className={record[key] ? "text-slate-800" : "text-slate-400"}>{record[key] || "Not set"}</span>
                        ) : key === "event_day" || key === "time_window" || key === "meeting_time" || key === "country" ? (
                          <span className={record[key] ? "text-slate-800" : "text-slate-400"}>{record[key] || "Not set"}</span>
                        ) : (
                          String(record[key] ?? "")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {!filteredRecords.length && !isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-3 py-10 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {editingRecord ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/35 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/15 sm:p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Update Record</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{editingRecord.company_name || "Conversation record"}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  Saving updates this record, preserves its original created timestamp, and regenerates lead scoring and follow-up text.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm"
              >
                Close
              </button>
            </div>
            <ConversationForm
              embedded
              mode="edit"
              initialRecord={editingRecord}
              onSaved={handleRecordUpdated}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ConversationRecord } from "@/lib/types";

const columns: Array<{ key: keyof ConversationRecord; label: string }> = [
  { key: "created_at", label: "Created At" },
  { key: "company_name", label: "Company" },
  { key: "person_name", label: "Person" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "company_relevance", label: "Company Relevance" },
  { key: "person_decision_proximity", label: "Decision Proximity" },
  { key: "pain_confirmed", label: "Pain Confirmed" },
  { key: "pain_category", label: "Pain Category" },
  { key: "pilot_possible", label: "Pilot Possible" },
  { key: "next_step", label: "Next Step" },
  { key: "meeting_outcome", label: "Meeting Outcome" },
  { key: "lead_score", label: "Lead Score" },
  { key: "lead_status", label: "Lead Status" },
  { key: "suggested_action", label: "Suggested Action" },
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

function statusPill(status?: string | null) {
  if (status === "Hot Lead") return "border-amber-400/35 bg-amber-500/15 text-amber-100";
  if (status === "Warm Lead") return "border-signal/35 bg-signal/15 text-teal-100";
  if (status === "Nurture") return "border-sky-400/30 bg-sky-500/15 text-sky-100";
  return "border-slate-500/30 bg-slate-700/30 text-slate-200";
}

export function RecordsTable() {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [meetingOutcome, setMeetingOutcome] = useState("");
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
      const matchesStatus = !leadStatus || record.lead_status === leadStatus;
      const matchesOutcome = !meetingOutcome || record.meeting_outcome === meetingOutcome;
      return matchesSearch && matchesStatus && matchesOutcome;
    });
  }, [records, search, leadStatus, meetingOutcome]);

  const leadStatuses = Array.from(new Set(records.map((record) => record.lead_status).filter(Boolean)));
  const meetingOutcomes = Array.from(new Set(records.map((record) => record.meeting_outcome).filter(Boolean)));

  function exportCsv() {
    const header = [...columns.map((column) => column.label), "Generated Follow-up"];
    const rows = filteredRecords.map((record) => [
      ...columns.map(({ key }) => (key === "created_at" ? formatDate(record.created_at) : record[key])),
      record.generated_follow_up
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

  async function copyFollowUp(message?: string | null) {
    if (!message) return;
    await navigator.clipboard.writeText(message);
  }

  return (
    <main className="min-h-screen bg-field-console">
      <header className="border-b border-white/10 bg-[#080b12]/90 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">ALYN Internal</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Conversation Records</h1>
            <p className="mt-1 text-sm leading-5 text-slate-400">Review captured leads, follow-up status, and export CSV.</p>
          </div>
          <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 shadow-lg shadow-black/20">
            New Conversation
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-white/10 bg-[#101827]/80 p-4 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_260px_auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records"
              className="h-[52px] rounded-xl border border-white/10 bg-[#0b111d] px-4 text-base text-white outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <select
              value={leadStatus}
              onChange={(event) => setLeadStatus(event.target.value)}
              className="h-[52px] rounded-xl border border-white/10 bg-[#0b111d] px-4 text-base text-white outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">All statuses</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status ?? ""}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={meetingOutcome}
              onChange={(event) => setMeetingOutcome(event.target.value)}
              className="h-[52px] rounded-xl border border-white/10 bg-[#0b111d] px-4 text-base text-white outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
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

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{filteredRecords.length} shown</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{records.length} total</span>
          </div>
        </div>

        {isLoading ? <p className="mt-6 text-slate-300">Loading records...</p> : null}
        {error ? <p className="mt-6 rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-sm text-red-200">{error}</p> : null}

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#101827]/80 shadow-2xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="min-w-[1900px] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-[#151f2d] text-xs uppercase tracking-[0.04em] text-slate-300">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="border-b border-r border-white/10 px-4 py-4 font-semibold">
                      {column.label}
                    </th>
                  ))}
                  <th className="border-b border-white/10 px-4 py-4 font-semibold">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-white/[0.06] odd:bg-white/[0.025] hover:bg-white/[0.045]">
                    {columns.map(({ key }) => (
                      <td key={key} className="max-w-[280px] border-r border-white/[0.08] px-4 py-4 align-top text-slate-100">
                        {key === "created_at" ? (
                          formatDate(record.created_at)
                        ) : key === "lead_status" ? (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusPill(record.lead_status)}`}>
                            {record.lead_status}
                          </span>
                        ) : key === "lead_score" ? (
                          <span className="font-bold text-white">{String(record[key] ?? "")}</span>
                        ) : (
                          String(record[key] ?? "")
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => copyFollowUp(record.generated_follow_up)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:border-signal/40"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredRecords.length && !isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-3 py-10 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

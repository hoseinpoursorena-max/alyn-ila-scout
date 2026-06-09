"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ConversationRecord } from "@/lib/types";

const eventDays = ["Wed", "Thu", "Fri"];
const timeWindows = ["Morning", "Noon", "Afternoon"];
const halls = ["Hall A", "Hall B", "Hall C", "Hall D", "Outside"];

function rank(values: string[], value?: string | null) {
  const index = values.indexOf(value ?? "");
  return index === -1 ? values.length : index;
}

function timeMinutes(value?: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function display(value?: string | null) {
  return value?.trim() || "Not set";
}

function PlanBadge({ label }: { label?: string | null }) {
  const value = display(label);
  return (
    <span className={value === "Not set" ? "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-400" : "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"}>
      {value}
    </span>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  const text = display(value);
  return (
    <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className={text === "Not set" ? "text-sm text-slate-400" : "text-sm leading-5 text-slate-800"}>{text}</dd>
    </div>
  );
}

function groupKey(record: ConversationRecord) {
  return [
    display(record.event_day),
    display(record.meeting_time || record.time_window),
    display(record.hall),
    display(record.stand_number)
  ].join(" | ");
}

export function PlanView() {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [eventDay, setEventDay] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [hall, setHall] = useState("");
  const [country, setCountry] = useState("");
  const [meetingOutcome, setMeetingOutcome] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecords() {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(data.error ?? "Could not load plan.");
        return;
      }

      setRecords(data.records ?? []);
    }

    loadRecords();
  }, []);

  const countries = useMemo(() => Array.from(new Set(records.map((record) => record.country).filter(Boolean))).sort(), [records]);
  const meetingOutcomes = useMemo(
    () => Array.from(new Set(records.map((record) => record.meeting_outcome).filter(Boolean))).sort(),
    [records]
  );

  const plannedRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const searchable = [
          record.company_name,
          record.person_name,
          record.role,
          record.country,
          record.event_day,
          record.time_window,
          record.meeting_time,
          record.hall,
          record.stand_number,
          record.shared_stand,
          record.meeting_outcome,
          record.next_step,
          record.notes
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!term || searchable.includes(term)) &&
          (!eventDay || record.event_day === eventDay) &&
          (!timeWindow || record.time_window === timeWindow) &&
          (!hall || record.hall === hall) &&
          (!country || (record.country ?? "").toLowerCase() === country.toLowerCase()) &&
          (!meetingOutcome || record.meeting_outcome === meetingOutcome)
        );
      })
      .sort((a, b) => {
        const dayCompare = rank(eventDays, a.event_day) - rank(eventDays, b.event_day);
        if (dayCompare) return dayCompare;

        const timeCompare = timeMinutes(a.meeting_time) - timeMinutes(b.meeting_time);
        if (timeCompare) return timeCompare;

        const windowCompare = rank(timeWindows, a.time_window) - rank(timeWindows, b.time_window);
        if (windowCompare) return windowCompare;

        const hallCompare = rank(halls, a.hall) - rank(halls, b.hall);
        if (hallCompare) return hallCompare;

        const standCompare = display(a.stand_number).localeCompare(display(b.stand_number));
        if (standCompare) return standCompare;

        return display(a.company_name).localeCompare(display(b.company_name));
      });
  }, [records, search, eventDay, timeWindow, hall, country, meetingOutcome]);

  const groups = useMemo(() => {
    const grouped = new Map<string, ConversationRecord[]>();
    plannedRecords.forEach((record) => {
      const key = groupKey(record);
      grouped.set(key, [...(grouped.get(key) ?? []), record]);
    });
    return Array.from(grouped.entries());
  }, [plannedRecords]);

  return (
    <main className="min-h-screen bg-field-console">
      <header className="border-b border-slate-200 bg-white/90 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ALYN Internal</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">ILA Meeting Plan</h1>
            <p className="mt-1 text-sm leading-5 text-slate-600">Who to meet, when, and where during ILA.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/records" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm">
              View Records
            </Link>
            <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm">
              New Conversation
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_140px_170px_140px_180px_260px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plan"
              className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
            <select value={eventDay} onChange={(event) => setEventDay(event.target.value)} className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20">
              <option value="">All days</option>
              {eventDays.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select value={timeWindow} onChange={(event) => setTimeWindow(event.target.value)} className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20">
              <option value="">All windows</option>
              {timeWindows.map((window) => (
                <option key={window} value={window}>{window}</option>
              ))}
            </select>
            <select value={hall} onChange={(event) => setHall(event.target.value)} className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20">
              <option value="">All halls</option>
              {halls.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20">
              <option value="">All countries</option>
              {countries.map((item) => (
                <option key={item} value={item ?? ""}>{item}</option>
              ))}
            </select>
            <select value={meetingOutcome} onChange={(event) => setMeetingOutcome(event.target.value)} className="h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 shadow-sm outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20">
              <option value="">All outcomes</option>
              {meetingOutcomes.map((outcome) => (
                <option key={outcome} value={outcome ?? ""}>{outcome}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{plannedRecords.length} shown</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{records.length} total</span>
          </div>
        </div>

        {isLoading ? <p className="mt-6 text-slate-600">Loading plan...</p> : null}
        {error ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-4">
          {groups.map(([key, items]) => {
            const [day, time, groupHall, stand] = key.split(" | ");
            return (
              <section key={key} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PlanBadge label={day} />
                    <PlanBadge label={time} />
                    <PlanBadge label={groupHall} />
                    <PlanBadge label={stand} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {items.length} contact{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((record) => (
                    <article key={record.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[260px_1fr]">
                      <div>
                        <h2 className="text-base font-bold text-slate-950">{display(record.company_name)}</h2>
                        <p className="mt-1 text-sm text-slate-700">{display(record.person_name)}</p>
                        <p className="mt-1 text-sm text-slate-500">{display(record.role)}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <PlanBadge label={record.country} />
                          <PlanBadge label={record.hall} />
                          <PlanBadge label={record.stand_number} />
                        </div>
                      </div>
                      <dl className="grid gap-3">
                        <InfoLine label="Shared stand" value={record.shared_stand} />
                        <InfoLine label="Meeting outcome" value={record.meeting_outcome} />
                        <InfoLine label="Next step" value={record.next_step} />
                        <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
                          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</dt>
                          <dd className="max-h-[72px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm leading-[1.4] text-slate-800">
                            {display(record.notes)}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          {!groups.length && !isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              No plan items found.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

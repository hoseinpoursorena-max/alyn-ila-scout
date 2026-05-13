"use client";

import { FormEvent, useEffect, useState } from "react";

const storageKey = "alyn_ila_scout_access";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(storageKey) === "true");
    setIsChecking(false);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Password did not match.");
      return;
    }

    localStorage.setItem(storageKey, "true");
    setIsAuthenticated(true);
  }

  if (isChecking) {
    return <main className="min-h-screen bg-field-console" />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-field-console px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#101827]/85 p-6 shadow-2xl shadow-black/40 backdrop-blur"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">ALYN Internal</p>
        <h1 className="mt-2 text-3xl font-bold text-white">ILA Scout</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Capture ILA conversations. Score leads. Generate follow-ups.</p>
        <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-[52px] w-full rounded-xl border border-white/10 bg-[#0b111d] px-4 text-base text-white outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
          autoFocus
        />
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-[52px] w-full rounded-xl bg-signal px-4 font-bold text-ink shadow-lg shadow-signal/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Checking..." : "Enter"}
        </button>
      </form>
    </main>
  );
}

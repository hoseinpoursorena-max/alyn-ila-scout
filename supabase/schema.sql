create extension if not exists pgcrypto;

create table if not exists public.ila_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz null,
  company_name text null,
  role text null,
  person_name text null,
  mobile text null,
  email text null,
  event_day text null,
  time_window text null,
  company_relevance text null,
  person_decision_proximity text null,
  pain_confirmed text null,
  pain_category text null,
  pilot_possible text null,
  next_step text null,
  notes text null,
  previous_contact text null,
  meeting_outcome text null,
  follow_up_consent boolean null,
  lead_score integer null,
  lead_status text null,
  suggested_action text null,
  generated_follow_up text null
);

alter table public.ila_conversations
  add column if not exists updated_at timestamptz null,
  add column if not exists event_day text null,
  add column if not exists time_window text null;

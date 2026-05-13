export type ConversationInput = {
  company_name?: string | null;
  role?: string | null;
  person_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  company_relevance?: string | null;
  person_decision_proximity?: string | null;
  pain_confirmed?: string | null;
  pain_category?: string | null;
  pilot_possible?: string | null;
  next_step?: string | null;
  notes?: string | null;
  previous_contact?: string | null;
  meeting_outcome?: string | null;
  follow_up_consent?: boolean | null;
};

export type ConversationRecord = ConversationInput & {
  id: string;
  created_at: string;
  lead_score: number | null;
  lead_status: string | null;
  suggested_action: string | null;
  generated_follow_up: string | null;
};

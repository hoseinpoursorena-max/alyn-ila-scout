import type { ConversationInput } from "./types";

const scoreMap = {
  company_relevance: { High: 15, Medium: 8, Low: 0 },
  person_decision_proximity: {
    "Decision maker": 20,
    Influencer: 14,
    "Referral only": 7,
    "Not relevant": 0
  },
  pain_confirmed: { Strongly: 25, Somewhat: 12, "Not really": 0 },
  pilot_possible: { Yes: 20, Maybe: 10, No: 0, Unknown: 0 },
  next_step: {
    "Book call": 15,
    "Send NDA": 12,
    "Send demo link": 8,
    "Send follow-up": 6,
    "Ask for referral": 5,
    "No action": 0
  },
  previous_contact: { Yes: 5, No: 0 }
} as const;

const suggestedActions: Record<string, string> = {
  "Hot Pilot Candidate": "Send hot follow-up and propose 5-10 RFQ diagnostic pilot.",
  "NDA / Data-Sensitive Lead": "Send NDA-first follow-up and offer anonymized RFQ diagnostic.",
  "Referral Needed": "Ask for introduction to the RFQ / operations decision owner.",
  "Warm Demo Follow-up": "Send ALYN Aerospace use-case page and ask for short walkthrough.",
  "Send Info / Keep Warm": "Send light follow-up and keep contact warm.",
  "Partner / Media / Network Contact": "Follow up around partnership, media, or intro opportunity.",
  "Post-Event Timing / Later Follow-up": "Follow up after ILA with use-case page and meeting request.",
  "Not ICP / Low Priority": "Send polite thank-you or no action."
};

function lookup<T extends Record<string, number>>(map: T, value?: string | null) {
  return value && value in map ? map[value as keyof T] : 0;
}

export function calculateLeadScore(input: ConversationInput) {
  const painCategory =
    input.pain_category === "Multiple / All"
      ? 10
      : input.pain_category && input.pain_category !== "Unknown"
        ? 8
        : 0;

  const total =
    lookup(scoreMap.company_relevance, input.company_relevance) +
    lookup(scoreMap.person_decision_proximity, input.person_decision_proximity) +
    lookup(scoreMap.pain_confirmed, input.pain_confirmed) +
    painCategory +
    lookup(scoreMap.pilot_possible, input.pilot_possible) +
    lookup(scoreMap.next_step, input.next_step) +
    lookup(scoreMap.previous_contact, input.previous_contact);

  return Math.min(total, 100);
}

export function classifyLeadStatus(score: number) {
  if (score >= 80) return "Hot Lead";
  if (score >= 60) return "Warm Lead";
  if (score >= 40) return "Nurture";
  return "Low Priority";
}

export function suggestAction(meetingOutcome?: string | null) {
  return meetingOutcome ? suggestedActions[meetingOutcome] ?? "Send light follow-up and keep contact warm." : "Send light follow-up and keep contact warm.";
}

function greeting(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed ? `Hi ${trimmed},` : "Hi,";
}

function companyPhrase(company?: string | null) {
  const trimmed = company?.trim();
  return trimmed ? ` at ${trimmed}` : "";
}

export function generateFollowUp(input: ConversationInput) {
  const hello = greeting(input.person_name);
  const company = companyPhrase(input.company_name);

  switch (input.meeting_outcome) {
    case "Hot Pilot Candidate":
      return `${hello}

Thank you for the conversation at ILA.

I really appreciated your perspective on how complex RFQ decisions move across operations, engineering, quality, production, and supply chain.

As discussed, ALYN Aerospace focuses on helping suppliers decide whether a complex RFQ is safe to quote before it becomes a delivery, margin, or compliance problem.

A useful next step could be a small diagnostic pilot using a few recent or anonymized RFQs.

Would you be open to a short follow-up call next week?`;
    case "Warm Demo Follow-up":
      return `${hello}

Thank you for the conversation at ILA.

I enjoyed hearing how your team approaches complex RFQ decisions.

As discussed, ALYN Aerospace turns supplier-side RFQ review into a structured decision brief: accept, reject, or accept with caution.

Here is the use-case page:
[LINK]

If it looks relevant, I would be happy to walk you through the short demo.`;
    case "NDA / Data-Sensitive Lead":
      return `${hello}

Thank you for the conversation at ILA.

I completely understand your point about data sensitivity.

For an initial diagnostic, we can work with anonymized RFQs or remove customer names, part numbers, pricing, and sensitive identifiers.

For any real data, we would only proceed under NDA.

If useful, we can schedule a short call to define what a safe first diagnostic could look like.`;
    case "Referral Needed":
      return `${hello}

Thank you for taking the time to speak at ILA.

Based on our conversation, it sounds like the person closest to this topic may be someone in operations, production planning, engineering, quality, or RFQ/estimating.

Would you be comfortable pointing me to the right person who handles complex RFQ acceptance or production feasibility decisions${company}?`;
    case "Not ICP / Low Priority":
      return `${hello}

Thank you for the conversation at ILA.

It was great to learn more about your work. ALYN Aerospace may not be directly aligned with your current area, but I appreciated the exchange.

Wishing you a successful event.`;
    case "Partner / Media / Network Contact":
      return `${hello}

Thank you for the conversation at ILA.

It was great to exchange thoughts around aerospace, AI, and operational decision-making.

I would be happy to stay connected and explore whether there is a useful collaboration, introduction, or content angle around ALYN and aerospace supplier decision intelligence.`;
    case "Post-Event Timing / Later Follow-up":
      return `${hello}

Thank you for the conversation at ILA.

As discussed, I will follow up after the event with a short overview of ALYN Aerospace and the RFQ decision-brief concept.

The focus is simple:
helping suppliers decide whether a complex RFQ is safe to quote before it creates delivery, margin, or compliance risk.

I will reconnect once ILA is over.`;
    case "Send Info / Keep Warm":
    default:
      return `${hello}

Thank you for the conversation at ILA.

As mentioned, ALYN Aerospace focuses on helping aerospace suppliers decide whether a complex RFQ is safe to quote by looking at capacity, engineering feasibility, supplier risk, quality/compliance, delivery, and margin exposure.

Here is a short overview:
[LINK]

Happy to reconnect if this becomes relevant for your team.`;
  }
}

export function enrichConversation(input: ConversationInput) {
  const lead_score = calculateLeadScore(input);
  return {
    ...input,
    lead_score,
    lead_status: classifyLeadStatus(lead_score),
    suggested_action: suggestAction(input.meeting_outcome),
    generated_follow_up: generateFollowUp(input)
  };
}

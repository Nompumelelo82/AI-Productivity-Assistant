import type { Job, Priority, ServiceCategory, Tone } from "./types";
import { addMinutes, zar } from "./format";

export const AI_DISCLAIMER =
  "AI-generated suggestions are provided as assistance and should be reviewed by the business owner before being sent to customers or used for pricing, scheduling or technical decisions.";

export const SAFETY_NOTE =
  "FixMate AI does not issue electrical, plumbing, safety or legal certification. Where risk is indicated, a qualified professional must inspect the work on site.";

/**
 * Structured prompt templates used by every AI workflow.
 * Role + business context + user input + task + output format + tone + safety constraints.
 * These are internal and are never shown to end users in normal flows.
 */
export const PROMPTS = {
  analyzeRequest: `ROLE: You are an experienced administrative assistant for a South African home-services business.
CONTEXT: Small plumbing, electrical, painting, handyman and general repair business operating in Port Elizabeth. Currency is South African Rand (R).
INPUT: A raw customer request received via WhatsApp, email, phone or the website.
TASK: Classify the request and extract everything needed to respond and schedule it.
OUTPUT FORMAT: service category, issue summary, urgency, likely equipment, information still required, recommended next action.
TONE: Clear, practical, professional.
SAFETY: Never provide certification or legal assurances. Flag when a qualified professional must inspect on site. All output must be reviewed by the business owner.`,
  customerReply: `ROLE: You are the customer-communication assistant for a South African service business.
CONTEXT: The owner is a busy tradesperson who needs polished replies quickly.
INPUT: The customer request and a requested tone.
TASK: Write a short reply that acknowledges the problem, states the next step, and asks for any missing detail.
OUTPUT FORMAT: Greeting, acknowledgement, next step with time window, one clarifying question, sign-off from FixMate.
TONE: As selected by the owner.
SAFETY: No guarantees about cost, cause or certification before inspection. Output is editable and must be approved before sending.`,
  jobPlan: `ROLE: You are a service-business operations planner.
CONTEXT: Jobs are attended by a small team of technicians travelling between suburbs.
INPUT: A customer request or job description.
TASK: Convert it into a structured job card.
OUTPUT FORMAT: job title, service category, priority, estimated duration, equipment, materials, recommended technician, notes.
TONE: Concise and operational.
SAFETY: Recommend on-site inspection by a qualified professional for risk work; no certification claims.`,
  dailyPlan: `ROLE: You are a scheduling assistant for a mobile trades team.
INPUT: Today's jobs with priority and duration, working hours, travel time, personal tasks.
TASK: Produce a realistic time-ordered schedule that front-loads urgent work and includes travel and breaks.
OUTPUT FORMAT: A time-blocked list from start of day to end of day.
TONE: Direct and practical.
SAFETY: Do not overbook past available hours; flag work that cannot fit.`,
  assistant: `ROLE: You are FixMate AI, an advisor for a small South African service business.
CONTEXT: You can see jobs, quotes, invoices, customers and today's schedule.
TASK: Answer the owner's business question with practical, concise steps.
OUTPUT FORMAT: Short answer, then up to 4 bullet actions.
TONE: Friendly expert, no fluff.
SAFETY: No technical certification, legal or safety sign-off. Recommend a qualified professional where relevant.`,
  followUp: `ROLE: You write post-job follow-up messages for a service business.
INPUT: Completed job, customer name, requested tone.
TASK: Thank the customer, confirm completion, invite feedback or a review.
OUTPUT FORMAT: 2-4 short sentences.
TONE: As selected.
SAFETY: No warranty or certification promises.`,
};

export function think<T>(value: T, ms = 900): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

let variant = 0;
export function nextVariant() {
  variant += 1;
  return variant;
}

const SERVICE_KEYWORDS: Array<{ service: ServiceCategory; words: string[] }> = [
  {
    service: "Plumbing",
    words: ["tap", "leak", "geyser", "drain", "toilet", "pipe", "water", "blocked", "basin"],
  },
  {
    service: "Electrical",
    words: ["light", "plug", "power", "electric", "breaker", "wiring", "socket", "db board", "burning smell"],
  },
  { service: "Painting", words: ["paint", "colour", "color", "wall", "coat", "varnish", "primer"] },
  { service: "Handyman", words: ["handle", "door", "shelf", "mount", "bracket", "cupboard", "hinge"] },
  { service: "General Repairs", words: ["roof", "tile", "gutter", "fence", "crack", "gate", "repair"] },
];

const URGENT_WORDS = ["urgent", "burst", "flood", "emergency", "burning", "sparks", "asap", "worse", "smell"];
const HIGH_WORDS = ["leak", "wet", "damage", "no power", "not working", "today"];

export type RequestAnalysis = {
  service: ServiceCategory;
  issue: string;
  urgency: Priority;
  equipment: string[];
  missingInfo: string[];
  nextAction: string;
  riskFlag?: string;
  estimateRange: string;
  durationMins: number;
};

export function analyzeRequest(text: string, v = 0): RequestAnalysis {
  const lower = text.toLowerCase();
  const matched =
    SERVICE_KEYWORDS.find((s) => s.words.some((w) => lower.includes(w)))?.service ??
    "General Repairs";

  const urgency: Priority = URGENT_WORDS.some((w) => lower.includes(w))
    ? "Urgent"
    : HIGH_WORDS.some((w) => lower.includes(w))
      ? "High"
      : lower.length > 140
        ? "Medium"
        : "Low";

  const equipmentMap: Record<ServiceCategory, string[]> = {
    Plumbing: ["Plumbing tool kit", "Replacement washers & seals", "Replacement tap or fitting", "Bucket & towels"],
    Electrical: ["Insulated tool set", "Multimeter", "Replacement socket / breaker", "Ladder"],
    Painting: ["Rollers, brushes & trays", "Drop sheets", "Crack filler & sandpaper", "Interior paint"],
    Handyman: ["Hand tool kit", "Cordless drill", "Fixings & fasteners"],
    "General Repairs": ["Ladder", "Sealant", "Replacement materials on site assessment"],
  };

  const issueSentence = text.trim().split(/[.!?\n]/).filter(Boolean)[0] ?? text.trim();
  const issueVariants = [
    `${matched} issue reported: ${issueSentence.slice(0, 110)}`,
    `Customer describes a ${matched.toLowerCase()} problem — ${issueSentence.slice(0, 100)}`,
  ];

  const missing = [
    "Photo or short video of the affected area",
    "Property address and access instructions",
    "Preferred appointment window",
  ];
  if (matched === "Plumbing") missing.push("Whether the water supply can be shut off");
  if (matched === "Electrical") missing.push("Whether the circuit breaker has tripped");
  if (matched === "Painting") missing.push("Room sizes and preferred colour");

  const risk =
    matched === "Electrical"
      ? "Possible electrical hazard — a qualified electrician must inspect before any work. FixMate AI cannot issue a certificate of compliance."
      : urgency === "Urgent"
        ? "Possible water damage risk — advise the customer to close the main valve and treat as an emergency callout."
        : undefined;

  const ranges: Record<ServiceCategory, string> = {
    Plumbing: "R450 – R950",
    Electrical: "R650 – R1,400",
    Painting: "R1,800 – R3,200",
    Handyman: "R320 – R650",
    "General Repairs": "R700 – R1,500",
  };

  const durations: Record<ServiceCategory, number> = {
    Plumbing: 60,
    Electrical: 90,
    Painting: 180,
    Handyman: 45,
    "General Repairs": 120,
  };

  return {
    service: matched,
    issue: pick(issueVariants, v),
    urgency,
    equipment: equipmentMap[matched],
    missingInfo: missing,
    nextAction:
      urgency === "Urgent"
        ? "Phone the customer immediately, confirm the emergency callout fee and book the earliest available slot today."
        : "Request a photo from the customer and schedule an inspection within the next 48 hours.",
    riskFlag: risk,
    estimateRange: ranges[matched],
    durationMins: durations[matched],
  };
}

const TONE_OPENERS: Record<Tone, string[]> = {
  Friendly: ["Hi there,", "Hello!"],
  Professional: ["Good day,", "Dear customer,"],
  Short: ["Hi,", "Hello,"],
  Apologetic: ["Hi, and apologies for the inconvenience,", "Hello, we're sorry you're dealing with this,"],
  Urgent: ["Hi — we're treating this as urgent,", "Hello, we've flagged this as an emergency,"],
  Persuasive: ["Hi there — great news,", "Hello, we can definitely sort this out,"],
};

export function generateReply(input: {
  request: string;
  tone: Tone;
  customerName?: string;
  analysis?: RequestAnalysis;
  v?: number;
}) {
  const v = input.v ?? 0;
  const a = input.analysis ?? analyzeRequest(input.request, v);
  const name = input.customerName?.split(" ")[0] ?? "there";
  const opener = pick(TONE_OPENERS[input.tone], v).replace("there,", `${name},`);

  if (input.tone === "Short") {
    return `${opener}

Thanks for the message about the ${a.service.toLowerCase()} issue. We can send a technician ${a.urgency === "Urgent" ? "today" : "within the next 48 hours"}. Could you send a quick photo and confirm your address?

FixMate Plumbing & Repairs`;
  }

  const bodyVariants = [
    `Thank you for contacting FixMate. We've logged your ${a.service.toLowerCase()} request and understand that ${a.issue.toLowerCase().replace(/^.*?:\s*/, "")}.`,
    `Thanks for letting us know. Based on your message this looks like a ${a.service.toLowerCase()} job, and we've added it to our list for attention.`,
  ];

  const nextStep =
    a.urgency === "Urgent"
      ? "Because of the risk of further damage we would like to attend today. Our technician can be with you within the next two hours."
      : "We can have a technician with you within the next 48 hours, and we'll confirm an exact time slot once you let us know what suits you.";

  const persuasive =
    input.tone === "Persuasive"
      ? ` We've completed over 200 similar jobs in ${"Humewood, Walmer and Summerstrand"}, and every job comes with a written quote before we start — no surprises.`
      : "";

  const apology =
    input.tone === "Apologetic"
      ? " We're sorry for the frustration this has caused and we'll make it a priority."
      : "";

  return `${opener}

${pick(bodyVariants, v)}${apology}${persuasive}

${nextStep}

To prepare properly, could you please send:
• ${a.missingInfo[0]}
• ${a.missingInfo[1]}
• ${a.missingInfo[2]}

An estimated range for work of this type is ${a.estimateRange}, and we'll confirm a firm written quote after inspection.

Kind regards,
FixMate Plumbing & Repairs
041 555 0142`;
}

export type JobPlan = {
  title: string;
  service: ServiceCategory;
  priority: Priority;
  durationMins: number;
  equipment: string[];
  materials: string[];
  technician: string;
  notes: string;
};

export function generateJobPlan(text: string, v = 0): JobPlan {
  const a = analyzeRequest(text, v);
  const techByService: Record<ServiceCategory, string> = {
    Plumbing: "Sipho Mabaso",
    Electrical: "Mike Daniels",
    Painting: "Thandi Williams",
    Handyman: "James Brown",
    "General Repairs": "James Brown",
  };
  const titleWords = a.issue.replace(/^.*?:\s*/, "").split(" ").slice(0, 6).join(" ");
  return {
    title: `${a.service}: ${titleWords.charAt(0).toUpperCase()}${titleWords.slice(1)}`,
    service: a.service,
    priority: a.urgency,
    durationMins: a.durationMins + (v % 2) * 15,
    equipment: a.equipment,
    materials:
      a.service === "Plumbing"
        ? ["Replacement washer set", "Thread tape", "Mixer tap (if required)"]
        : a.service === "Electrical"
          ? ["Replacement socket", "Cable & clips"]
          : a.service === "Painting"
            ? ["Interior paint (5L)", "Filler", "Masking tape"]
            : ["Fixings", "Sealant"],
    technician: techByService[a.service],
    notes: `${a.nextAction}${a.riskFlag ? ` ${a.riskFlag}` : ""}`,
  };
}

export type PlanBlock = { time: string; label: string; kind: "job" | "travel" | "break" | "admin" };

export function generateDailyPlan(input: {
  jobs: Job[];
  startTime: string;
  endTime: string;
  travelMins: number;
  personalTasks: string;
  v?: number;
}): { blocks: PlanBlock[]; overflow: string[]; summary: string } {
  const v = input.v ?? 0;
  const order: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
  const sorted = [...input.jobs].sort((a, b) => order[a.priority] - order[b.priority]);
  const blocks: PlanBlock[] = [];
  const overflow: string[] = [];

  let cursor = input.startTime;
  const limit = input.endTime;
  const toMins = (t: string) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);

  blocks.push({
    time: cursor,
    label: v % 2 === 0 ? "Prepare equipment & load van" : "Check van stock and confirm today's bookings",
    kind: "admin",
  });
  cursor = addMinutes(cursor, 45);

  let lunchDone = false;
  sorted.forEach((job, i) => {
    if (toMins(cursor) + job.durationMins > toMins(limit)) {
      overflow.push(`${job.title} (${job.priority})`);
      return;
    }
    if (!lunchDone && toMins(cursor) >= toMins("12:45")) {
      blocks.push({ time: cursor, label: "Lunch", kind: "break" });
      cursor = addMinutes(cursor, 30);
      lunchDone = true;
    }
    blocks.push({
      time: cursor,
      label: `${job.title} — ${job.location.split(",").slice(-1)[0].trim()} (${job.priority}, ${job.durationMins} min)`,
      kind: "job",
    });
    cursor = addMinutes(cursor, job.durationMins);
    if (i < sorted.length - 1) {
      blocks.push({ time: cursor, label: `Travel to next customer (${input.travelMins} min)`, kind: "travel" });
      cursor = addMinutes(cursor, input.travelMins);
    }
  });

  if (input.personalTasks.trim()) {
    input.personalTasks
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((task) => {
        if (toMins(cursor) + 30 <= toMins(limit)) {
          blocks.push({ time: cursor, label: task, kind: "admin" });
          cursor = addMinutes(cursor, 30);
        } else {
          overflow.push(task);
        }
      });
  }

  if (toMins(cursor) + 20 <= toMins(limit)) {
    blocks.push({ time: cursor, label: "Wrap up: send invoices and follow-ups", kind: "admin" });
  }

  return {
    blocks,
    overflow,
    summary: `${sorted.length - overflow.length} of ${sorted.length} jobs scheduled between ${input.startTime} and ${input.endTime}, urgent work placed first with ${input.travelMins} minutes travel between customers.`,
  };
}

export function generateFollowUp(input: { customerName: string; jobTitle: string; service: ServiceCategory; tone: Tone; v?: number }) {
  const v = input.v ?? 0;
  const first = input.customerName.split(" ")[0];
  if (input.tone === "Short") {
    return `Hi ${first}, your ${input.service.toLowerCase()} job (${input.jobTitle}) is complete. Everything working well? A quick Google review would mean a lot. — FixMate`;
  }
  const variants = [
    `Hi ${first}, thank you for choosing FixMate. Your ${input.service.toLowerCase()} work — ${input.jobTitle} — has been completed. We hope everything is working perfectly. If you were happy with our service, we'd really appreciate your feedback.`,
    `Hi ${first}, just checking in after our visit. The ${input.jobTitle.toLowerCase()} has been completed and signed off by our technician. Please let us know if anything needs a second look — and if you're happy, a short review helps our small business a lot.`,
  ];
  const closing =
    input.tone === "Professional"
      ? "\n\nKind regards,\nFixMate Plumbing & Repairs"
      : "\n\nThanks again!\nThe FixMate team";
  return pick(variants, v) + closing;
}

export type AssistantContext = {
  activeJobs: number;
  pendingQuotes: number;
  todayAppointments: number;
  completedJobs: number;
  revenue: number;
  topService: string;
  urgentJob?: string;
};

export function assistantAnswer(question: string, ctx: AssistantContext, v = 0): string {
  const q = question.toLowerCase();

  if (q.includes("priorit") || q.includes("plan my day") || q.includes("today")) {
    return `Start with anything that can cause further damage, then group the rest by suburb to cut travel.

• ${ctx.urgentJob ? `Handle **${ctx.urgentJob}** first — it's flagged urgent.` : "No urgent jobs flagged right now, so start with the earliest booking."}
• You have ${ctx.todayAppointments} appointments today and ${ctx.activeJobs} active jobs — keep a 30 minute buffer between suburbs.
• Use **AI Assistant → Daily Planner** to generate a time-blocked schedule automatically.
• Confirm each appointment by WhatsApp before 08:00 to reduce no-shows.

${SAFETY_NOTE}`;
  }

  if (q.includes("money") || q.includes("revenue") || q.includes("profit") || q.includes("earning")) {
    return `${ctx.topService} is your strongest earner this month, out of ${zar(ctx.revenue)} total revenue.

• Average job value sits around ${zar(Math.round(ctx.revenue / Math.max(ctx.completedJobs, 1)))} — quoting travel separately protects your margin.
• ${ctx.pendingQuotes} quotes are still open; following those up is the fastest revenue you can add this week.
• Push ${ctx.topService.toLowerCase()} work in your marketing — it converts best for you.
• Review Reports → Jobs by service for the full breakdown.`;
  }

  if (q.includes("cancel") || q.includes("no-show") || q.includes("reduce")) {
    return `Cancellations usually come from unclear expectations and long waits.

• Send a confirmation the evening before and a reminder 60 minutes ahead.
• Give a 2-hour arrival window instead of an exact time.
• Take a small callout deposit on emergency bookings.
• Reply to new requests within an hour — response speed is the biggest single factor.`;
  }

  if (q.includes("review") || q.includes("message") || q.includes("write")) {
    return `Here's a message you can send as-is:

"Hi, thank you for choosing FixMate. We hope your repair is working perfectly. If you were happy with the service, would you mind leaving us a short Google review? It really helps our small team."

• Send it 24 hours after completion, while the experience is fresh.
• Use **AI Assistant → Follow-Up Generator** to tailor the tone per customer.

${AI_DISCLAIMER}`;
  }

  if (q.includes("quote") || q.includes("price") || q.includes("charge")) {
    return `Before quoting, collect enough detail to avoid a second site visit.

• Photos or video of the problem area, plus the property address.
• Age and make of the fitting or appliance involved.
• Access details: parking, gate codes, pets, availability.
• Whether the customer wants a repair or a full replacement.

Then use the **Quote Generator** to split labour, materials and travel — customers accept itemised quotes far more often. ${SAFETY_NOTE}`;
  }

  if (q.includes("follow up") || q.includes("pending")) {
    return `You have ${ctx.pendingQuotes} quotes waiting on a decision.

• Follow up on day 2 and day 5 — after that conversion drops sharply.
• Reference the exact total and what is included.
• Offer a nearby alternative slot to create momentum.
• Mark declined quotes so your pipeline stays honest.`;
  }

  return `Here's how I'd approach that for ${"FixMate Plumbing & Repairs"}:

• You currently have ${ctx.activeJobs} active jobs, ${ctx.pendingQuotes} open quotes and ${zar(ctx.revenue)} revenue this month.
• Deal with urgent work and unanswered customer requests first — those cost you the most money.
• Use the AI tools (Request Analyzer → Reply → Job Plan → Quote) so admin stays in one flow.
• Ask me something specific like "which jobs make the most money" or "plan my day" for a sharper answer.

${AI_DISCLAIMER}`;
}

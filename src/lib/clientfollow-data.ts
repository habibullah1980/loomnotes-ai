/**
 * ClientFollow Mock Data Store
 * Provides realistic sample CRM data for the Stitch design implementation.
 * Kept strictly isolated from future database tables / Supabase schemas.
 */

export interface Client {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  avatarUrl: string;
  status: "active" | "lead" | "paused" | "completed";
  engagementType: "Monthly Retainer" | "Fixed Project" | "Discovery Sprint" | "Advisory";
  retainerAmount: number;
  monthlyValue: string;
  totalRevenue: string;
  cadenceDays: number;
  lastTouch: string;
  nextFollowUpDate: string;
  nextFollowUpType: "Check-in" | "Deliverable" | "Invoice" | "Proposal" | "Call";
  healthScore: number;
  tags: string[];
  notes: string;
}

export interface FollowUpItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAvatar: string;
  type: "Check-in" | "Invoice" | "Deliverable" | "Milestone" | "Pitch Deck" | "Feedback" | "Proposal" | "Call";
  title: string;
  context: string;
  dueDate: string;
  dueTime?: string;
  urgency: "overdue" | "due_today" | "upcoming" | "completed";
  dealValue?: string;
  recommendedChannel: "email" | "call" | "whatsapp" | "calendar";
  cadenceRule: string;
  completed: boolean;
}

export interface CalendarTouchpoint {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  clientName: string;
  company: string;
  title: string;
  type: "checkin" | "milestone" | "billing" | "lead";
  status: "scheduled" | "overdue" | "completed";
}

export const initialClients: Client[] = [
  {
    id: "c1",
    name: "Elena Rostova",
    company: "Aura BioTech",
    title: "Chief Creative Officer",
    email: "elena@aurabiotech.io",
    phone: "+1 (555) 234-8901",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "active",
    engagementType: "Monthly Retainer",
    retainerAmount: 6200,
    monthlyValue: "$6,200/mo",
    totalRevenue: "$42,500",
    cadenceDays: 7,
    lastTouch: "3 days ago",
    nextFollowUpDate: "2026-10-10",
    nextFollowUpType: "Deliverable",
    healthScore: 98,
    tags: ["High Priority", "Brand System", "Biotech"],
    notes: "Prefers morning email digests. Next quarter website redesign currently in scoping.",
  },
  {
    id: "c2",
    name: "Marcus Vance",
    company: "Vanguard Studio",
    title: "Head of Product",
    email: "marcus@vanguardstudio.co",
    phone: "+1 (555) 891-2345",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "active",
    engagementType: "Monthly Retainer",
    retainerAmount: 8500,
    monthlyValue: "$8,500/mo",
    totalRevenue: "$68,000",
    cadenceDays: 5,
    lastTouch: "Yesterday",
    nextFollowUpDate: "2026-10-10",
    nextFollowUpType: "Check-in",
    healthScore: 92,
    tags: ["Design System", "Enterprise"],
    notes: "Review Q4 design sprint roadmap and confirm retainer renewal next week.",
  },
  {
    id: "c3",
    name: "Julianne Thorne",
    company: "Solstice Health Inc.",
    title: "VP of Brand Marketing",
    email: "julianne@solsticehealth.com",
    phone: "+1 (555) 432-1098",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "active",
    engagementType: "Fixed Project",
    retainerAmount: 14500,
    monthlyValue: "$14,500 milestone",
    totalRevenue: "$29,000",
    cadenceDays: 3,
    lastTouch: "2 days ago",
    nextFollowUpDate: "2026-10-09",
    nextFollowUpType: "Invoice",
    healthScore: 84,
    tags: ["Rebrand", "Healthcare", "Invoice Pending"],
    notes: "Invoice milestone 2 ($7,250) sent. Waiting for AP clearance.",
  },
  {
    id: "c4",
    name: "David Chen",
    company: "Kinetics AI",
    title: "Founder & CEO",
    email: "david@kinetics.ai",
    phone: "+1 (555) 789-0123",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "lead",
    engagementType: "Discovery Sprint",
    retainerAmount: 4500,
    monthlyValue: "$4,500 sprint",
    totalRevenue: "$0",
    cadenceDays: 4,
    lastTouch: "5 days ago",
    nextFollowUpDate: "2026-10-08",
    nextFollowUpType: "Proposal",
    healthScore: 78,
    tags: ["Seed Stage", "AI Pitch Deck", "Overdue Touch"],
    notes: "Pitch deck concept sent. Needs gentle reminder before investor meeting next Monday.",
  },
  {
    id: "c5",
    name: "Sophia Martinez",
    company: "Lumina Retail Group",
    title: "Director of Digital Experience",
    email: "smartinez@luminagroup.com",
    phone: "+1 (555) 345-6789",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "active",
    engagementType: "Monthly Retainer",
    retainerAmount: 5000,
    monthlyValue: "$5,000/mo",
    totalRevenue: "$30,000",
    cadenceDays: 14,
    lastTouch: "10 days ago",
    nextFollowUpDate: "2026-10-14",
    nextFollowUpType: "Check-in",
    healthScore: 96,
    tags: ["E-commerce", "Retainer"],
    notes: "Bi-weekly cadence on track. Scheduled presentation on consumer micro-interactions.",
  },
  {
    id: "c6",
    name: "Arthur Pendelton",
    company: "Crestview Capital",
    title: "Managing Partner",
    email: "apendelton@crestviewcap.com",
    phone: "+1 (555) 901-2345",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    status: "active",
    engagementType: "Advisory",
    retainerAmount: 4000,
    monthlyValue: "$4,000/mo",
    totalRevenue: "$24,000",
    cadenceDays: 30,
    lastTouch: "2 weeks ago",
    nextFollowUpDate: "2026-10-22",
    nextFollowUpType: "Check-in",
    healthScore: 90,
    tags: ["Fintech", "Advisory Board"],
    notes: "Monthly board deck polish and brand advisory.",
  },
];

export const initialFollowUps: FollowUpItem[] = [
  {
    id: "fu1",
    clientId: "c4",
    clientName: "David Chen",
    clientCompany: "Kinetics AI",
    clientAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Pitch Deck",
    title: "Send Pitch Deck revision & follow up on investor timing",
    context: "David viewed proposal 3 days ago without reply. Key demo meeting is Monday.",
    dueDate: "2026-10-08",
    dueTime: "Overdue by 2 days",
    urgency: "overdue",
    dealValue: "$4,500 sprint",
    recommendedChannel: "email",
    cadenceRule: "Every 3 days until reply",
    completed: false,
  },
  {
    id: "fu2",
    clientId: "c3",
    clientName: "Julianne Thorne",
    clientCompany: "Solstice Health",
    clientAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    type: "Invoice",
    title: "Milestone 2 payment reminder ($7,250)",
    context: "Contract deliverables handed over on Friday. Follow up politely with AP department.",
    dueDate: "2026-10-09",
    dueTime: "Overdue by 1 day",
    urgency: "overdue",
    dealValue: "$7,250",
    recommendedChannel: "email",
    cadenceRule: "5-day payment grace period",
    completed: false,
  },
  {
    id: "fu3",
    clientId: "c2",
    clientName: "Marcus Vance",
    clientCompany: "Vanguard Studio",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    type: "Check-in",
    title: "Review Q4 design sprint roadmap & confirm sprint dates",
    context: "Marcus asked for a quick sync before team kickoff on Wednesday.",
    dueDate: "2026-10-10",
    dueTime: "Due Today · 3:30 PM",
    urgency: "due_today",
    dealValue: "$8,500/mo retainer",
    recommendedChannel: "call",
    cadenceRule: "Weekly sprint alignment",
    completed: false,
  },
  {
    id: "fu4",
    clientId: "c1",
    clientName: "Elena Rostova",
    clientCompany: "Aura BioTech",
    clientAvatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    type: "Deliverable",
    title: "Share Figma prototypes for Bio-Dashboard component library",
    context: "Elena requested preview links before board review on Thursday.",
    dueDate: "2026-10-10",
    dueTime: "Due Today · 5:00 PM",
    urgency: "due_today",
    dealValue: "$6,200/mo retainer",
    recommendedChannel: "email",
    cadenceRule: "Retainer sprint touchpoint",
    completed: false,
  },
  {
    id: "fu5",
    clientId: "c5",
    clientName: "Sophia Martinez",
    clientCompany: "Lumina Retail",
    clientAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "Feedback",
    title: "Request customer checkout conversion analytics recap",
    context: "Post-launch 30-day review touchpoint.",
    dueDate: "2026-10-14",
    dueTime: "In 4 days",
    urgency: "upcoming",
    dealValue: "$5,000/mo",
    recommendedChannel: "email",
    cadenceRule: "Bi-weekly cadence",
    completed: false,
  },
  {
    id: "fu6",
    clientId: "c6",
    clientName: "Arthur Pendelton",
    clientCompany: "Crestview Capital",
    clientAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    type: "Milestone",
    title: "Deliver October brand advisory memo and board polish",
    context: "End-of-month executive packet review.",
    dueDate: "2026-10-22",
    dueTime: "In 12 days",
    urgency: "upcoming",
    dealValue: "$4,000/mo",
    recommendedChannel: "email",
    cadenceRule: "Monthly cadence",
    completed: false,
  },
];

export const calendarTouchpoints: CalendarTouchpoint[] = [
  {
    id: "t1",
    date: "2026-10-08",
    time: "11:00 AM",
    clientName: "David Chen",
    company: "Kinetics AI",
    title: "Follow up on Seed Pitch Deck",
    type: "lead",
    status: "overdue",
  },
  {
    id: "t2",
    date: "2026-10-09",
    time: "2:00 PM",
    clientName: "Julianne Thorne",
    company: "Solstice Health",
    title: "Invoice Milestone 2 Follow-up",
    type: "billing",
    status: "overdue",
  },
  {
    id: "t3",
    date: "2026-10-10",
    time: "10:30 AM",
    clientName: "Elena Rostova",
    company: "Aura BioTech",
    title: "Bio-Dashboard Component Handoff",
    type: "milestone",
    status: "scheduled",
  },
  {
    id: "t4",
    date: "2026-10-10",
    time: "3:30 PM",
    clientName: "Marcus Vance",
    company: "Vanguard Studio",
    title: "Q4 Roadmap Strategy Call",
    type: "checkin",
    status: "scheduled",
  },
  {
    id: "t5",
    date: "2026-10-14",
    time: "11:00 AM",
    clientName: "Sophia Martinez",
    company: "Lumina Retail",
    title: "Bi-weekly Retainer Touchpoint",
    type: "checkin",
    status: "scheduled",
  },
  {
    id: "t6",
    date: "2026-10-16",
    time: "4:00 PM",
    clientName: "David Chen",
    company: "Kinetics AI",
    title: "Contract Close & Onboarding Kickoff",
    type: "lead",
    status: "scheduled",
  },
  {
    id: "t7",
    date: "2026-10-22",
    time: "9:00 AM",
    clientName: "Arthur Pendelton",
    company: "Crestview Capital",
    title: "Monthly Advisory Review",
    type: "checkin",
    status: "scheduled",
  },
];

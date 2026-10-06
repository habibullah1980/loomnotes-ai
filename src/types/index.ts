/**
 * Core Domain Types for LoomNotes AI
 * Matches Supabase Schema: profiles, meetings, action_items, key_takeaways
 */

export interface Profile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  userId: string;
  title: string;
  transcript: string | null;
  summary: string | null;
  loomUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  task: string;
  assignee: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export interface KeyTakeaway {
  id: string;
  meetingId: string;
  content: string;
  createdAt: string;
}

export interface KeyDecision {
  id: string;
  meetingId: string;
  content: string;
  createdAt: string;
}

export interface FollowUpQuestion {
  id: string;
  meetingId: string;
  content: string;
  createdAt: string;
}

export interface MeetingWithDetails extends Meeting {
  actionItems: ActionItem[];
  keyTakeaways: KeyTakeaway[];
  keyDecisions: KeyDecision[];
  followUpQuestions: FollowUpQuestion[];
}

/**
 * Service Integration Status & Metadata
 */
export interface ServiceStatus {
  isConfigured: boolean;
  provider: 'supabase' | 'gemini';
  name: string;
  description: string;
}

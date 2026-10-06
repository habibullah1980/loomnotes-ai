/**
 * Gemini AI Processing Types for LoomNotes AI
 */

import { ActionItem, KeyTakeaway } from "@/types";

export interface GenerateNotesRequest {
  videoId: string;
  videoTitle?: string;
  transcriptText?: string;
  videoUrl?: string;
  customInstructions?: string;
}

export interface GeneratedNotesResponse {
  overview: string;
  keyTakeaways: KeyTakeaway[];
  actionItems: ActionItem[];
  chapters: {
    title: string;
    startTime: number;
    summary: string;
  }[];
  tags: string[];
}

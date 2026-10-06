export { geminiConfig } from "./config";
export { getGeminiClient, testGeminiConnection, type GeminiTestResult } from "./client";
export { LOOM_NOTES_SYSTEM_PROMPT, buildNoteGenerationPrompt } from "./prompts";
export type { GenerateNotesRequest, GeneratedNotesResponse } from "./types";

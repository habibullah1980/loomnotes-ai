import "server-only";

/**
 * Google Gemini API Server Configuration
 * Strictly isolated to server runtime. Never exposed to browser bundles.
 */

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  get isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 0 &&
      this.apiKey !== "your-gemini-api-key-here"
    );
  },
};

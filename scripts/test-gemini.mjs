import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

async function verifyGemini() {
  console.log("🔍 Testing Google Gemini API connection for LoomNotes AI...\n");

  if (!apiKey || apiKey === "your-gemini-api-key-here" || apiKey.trim() === "") {
    console.error("❌ GEMINI_API_KEY is not set in .env.local.");
    console.error("   Please obtain an API key from Google AI Studio (https://aistudio.google.com/)");
    console.error("   and add it to your .env.local file: GEMINI_API_KEY=AIzaSy...\n");
    process.exitCode = 1;
    return;
  }

  console.log(`   Configured Model: ${configuredModel}`);
  console.log(`   API Key detected: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

  const ai = new GoogleGenAI({ apiKey });
  const prompt = "Hello Gemini! Confirm you are connected to LoomNotes AI in one short sentence.";
  const modelsToTry = [configuredModel, "gemini-3.8-flash", "gemini-3.5-flash"];

  for (const model of modelsToTry) {
    try {
      console.log(`\n📤 Sending test prompt to [${model}]: "${prompt}"...`);
      const startTime = Date.now();

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const elapsed = Date.now() - startTime;
      console.log(`\n📥 Received response in ${elapsed}ms:\n`);
      console.log(`   "${response.text?.trim()}"\n`);
      console.log(`✅ Gemini API connection verified successfully with [${model}]!`);
      return;
    } catch (error) {
      const message = error.message || String(error);
      if (message.includes("503") || message.includes("UNAVAILABLE")) {
        console.warn(`   ⚠️ High demand on [${model}]. Trying fallback model...`);
        continue;
      }
      console.error("\n❌ Error communicating with Gemini API:");
      console.error(message);
      process.exitCode = 1;
      return;
    }
  }

  console.error("\n❌ All models temporarily busy. Please retry in a few moments.");
  process.exitCode = 1;
}

verifyGemini();

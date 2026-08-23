import { GoogleGenAI } from "@google/genai";

// Initialize Gemini. Expects GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({}); 

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

export async function generateSummary(text: string, length: "short" | "medium" | "long"): Promise<SummaryResult> {
  const lengthInstructions = {
    short: "Provide a very brief summary, around 2-3 sentences. Focus strictly on the core conclusion.",
    medium: "Provide a comprehensive but concise summary, around 1-2 paragraphs. Include the main ideas and context.",
    long: "Provide a detailed summary, covering all major sections, findings, and nuances. Use multiple paragraphs if necessary."
  };

  const prompt = `You are a professional document analysis assistant. Read the following extracted text from a document and provide a summary and key points.

INSTRUCTIONS FOR SUMMARY:
${lengthInstructions[length]}

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks or extra text:
{
  "summary": "The generated summary text here...",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ]
}

Ensure the JSON is valid and properly escaped. Extract 3 to 5 key points.

DOCUMENT TEXT:
${text.substring(0, 50000)} // Truncating to avoid massive token limits if needed
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(responseText) as SummaryResult;
      
      if (!parsed.summary || !Array.isArray(parsed.keyPoints)) {
        throw new Error("Invalid schema returned");
      }
      
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", responseText);
      throw new Error("AI generated an invalid format. Please try again.");
    }

  } catch (error: any) {
    console.error("Summarization error:", error);
    throw new Error(error.message || "Failed to generate summary from the document.");
  }
}

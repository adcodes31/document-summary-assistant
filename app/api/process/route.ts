import { NextRequest, NextResponse } from "next/server";
import { extractPdfText, extractImageText } from "@/lib/extractor";
import { generateSummary } from "@/lib/summarizer";

// Increase max duration for Vercel deployment if necessary (Hobby tier is 10s default)
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: Missing API Key. Please configure GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const length = formData.get("length") as "short" | "medium" | "long" | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!length || !["short", "medium", "long"].includes(length)) {
      return NextResponse.json({ error: "Invalid summary length requested" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    
    let extractedText = "";

    if (mimeType === "application/pdf") {
      extractedText = await extractPdfText(buffer);
    } else if (mimeType.startsWith("image/")) {
      extractedText = await extractImageText(buffer, mimeType);
    } else {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract any text from the document." }, { status: 400 });
    }

    const result = await generateSummary(extractedText, length);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API Route Error:", error);
    
    // Provide user friendly errors instead of raw stack traces
    const message = error.message || "An unexpected error occurred while processing the document.";
    
    // If the error message comes from our controlled throws, it's safe to show
    const isSafeError = message.includes("API Key") || 
                        message.includes("Unable to extract") ||
                        message.includes("Unable to read") ||
                        message.includes("AI generated") ||
                        message.includes("Failed to generate");
                        
    return NextResponse.json(
      { error: isSafeError ? message : "Processing failed. Please try a different document." },
      { status: 500 }
    );
  }
}

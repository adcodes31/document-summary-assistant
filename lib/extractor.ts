import { GoogleGenAI } from "@google/genai";

/**
 * Extracts text from a PDF buffer.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1);
  
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("pdf2json error:", errData);
        reject(new Error("Failed to parse PDF document."));
      });
  
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent().trim();
        if (text.length < 50) {
          reject(new Error("INSUFFICIENT_TEXT"));
        } else {
          resolve(text);
        }
      });
  
      pdfParser.parseBuffer(buffer);
    } catch (error: any) {
      if (error.message === "INSUFFICIENT_TEXT") {
        reject(new Error("Unable to extract sufficient text from this PDF. It appears to be an image-based scan. Please upload a clear text PDF or use an image format."));
      } else {
        console.error("PDF extraction error:", error);
        reject(new Error("Failed to parse PDF document."));
      }
    }
  }).catch((error: any) => {
    if (error.message === "INSUFFICIENT_TEXT") {
      throw new Error("Unable to extract sufficient text from this PDF. It appears to be an image-based scan. Please upload a clear text PDF or use an image format.");
    }
    throw error;
  }) as Promise<string>;
}

/**
 * Extracts text from an image buffer using Gemini Native Vision OCR.
 * This completely bypasses the tesseract.js Vercel serverless limitations.
 */
export async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({}); 
    const prompt = "Extract all the readable text from this image exactly as it appears. Do not summarize it. If there is absolutely no text, reply exactly with 'NO_TEXT_FOUND'.";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: buffer.toString("base64"), mimeType } }
          ]
        }
      ]
    });
    
    const text = response.text?.trim() || "";
    
    if (text.includes("NO_TEXT_FOUND") || text.length < 10) {
      throw new Error("Unable to read text from this image. Please ensure the document is clearly visible.");
    }
    
    return text;
  } catch (error: any) {
    if (error.message.includes("Unable to read")) {
      throw error;
    }
    console.error("OCR extraction error:", error);
    throw new Error("OCR processing failed. Try a clearer image.");
  }
}

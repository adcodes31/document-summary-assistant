import Tesseract from "tesseract.js";

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
 * Extracts text from an image buffer using OCR.
 */
export async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Tesseract handles buffers well
    const result = await Tesseract.recognize(
      buffer,
      'eng',
      { 
        logger: m => {} // suppress logs
      }
    );
    
    const text = result.data.text.trim();
    
    if (!text || text.length < 20) {
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

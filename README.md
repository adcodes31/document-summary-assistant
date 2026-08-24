# Document Summary Assistant

🚀 **Live Demo:** [https://document-summary-assistant.vercel.app](https://document-summary-assistant.vercel.app)

## Overview
A web application designed to help users quickly extract text and generate structured summaries from document files (PDFs) and scanned images (JPG, PNG, WebP). The application allows for selectable summary lengths and highlights key points automatically.

## Features
- **PDF Upload:** Parses text from standard PDF documents.
- **Image Upload (OCR):** Uses Tesseract.js to extract text from images and scanned documents.
- **Drag-and-Drop:** Intuitive file upload area with drag-and-drop support and fallback file picker.
- **Adjustable Summaries:** Choose between Short, Medium, and Long summary lengths.
- **Key Points Extraction:** Automatically identifies and lists the most important points.
- **Responsive Design:** Clean, document-focused user interface that scales seamlessly to mobile devices.
- **Robust Error Handling:** Validates file types and sizes, gracefully handles unreadable documents, and manages API errors.

## How It Works
1. **Upload:** User drags or selects a document (PDF or Image).
2. **Validation:** Client-side validation checks file type and size limit (10MB).
3. **Extraction:** 
   - Backend uses `pdf-parse` for standard PDFs.
   - Backend uses `tesseract.js` for images (OCR).
4. **Summarization:** The extracted text is sent to the Google Gemini API with a specific prompt based on the selected length.
5. **Display:** The generated summary and key points are displayed in a clean format, with an option to copy to clipboard or regenerate.

## Tech Stack
- **Frontend:** Next.js (App Router), React, standard CSS Modules for styling.
- **Backend:** Next.js Route Handlers (Node.js runtime).
- **Text Extraction:** `pdf-parse` for PDFs, `tesseract.js` for Images.
- **AI / Summarization:** Google Gemini API (`@google/genai`).
- **Icons:** `lucide-react`.

## Project Structure
- `app/page.tsx` - Main frontend UI and state management.
- `app/api/process/route.ts` - Backend endpoint handling file uploads.
- `lib/extractor.ts` - Utilities for parsing text from PDFs and Images.
- `lib/summarizer.ts` - Utilities for interacting with the Gemini AI model.
- `app/page.module.css` - Component-specific scoped styling.
- `app/globals.css` - Global CSS variables and resets.

## Local Setup

1. **Clone or download the repository.**
2. **Navigate to the project directory:**
   ```bash
   cd document-summary-assistant
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Environment Variables:**
   - Copy the example `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your Google Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   *(You can get a free API key from Google AI Studio).*

## Running the Application

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is built with Next.js and can be easily deployed to platforms like Vercel.

**Steps for Vercel deployment:**
1. Push the repository to GitHub.
2. Import the project in the Vercel Dashboard.
3. Add the `GEMINI_API_KEY` to the Environment Variables section in Vercel settings.
4. Click Deploy.



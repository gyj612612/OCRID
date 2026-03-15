# OCRID

`OCRID` is a browser-based business card extraction tool built with React, TypeScript, and Gemini-powered OCR.

It is designed for fast batch processing of business card images and exports structured contact data to Excel.

## Features

- drag-and-drop batch upload
- AI-assisted extraction of contact fields from card images
- support for multiple cards detected in a single image
- structured review in the browser
- Excel export for processed contacts

## Tech Stack

- React
- TypeScript
- Vite
- `@google/genai`
- `xlsx`

## Run Locally

Prerequisite: Node.js

1. Install dependencies:

```bash
npm install
```

2. Set your API key in `.env.local`

Example:

```bash
API_KEY=your_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

## Notes

- The app uses Gemini-based extraction through `services/geminiService.ts`.
- Exported results are generated as `.xlsx` files in the browser.

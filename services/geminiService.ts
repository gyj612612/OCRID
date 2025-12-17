import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Upgrading to Pro model for better capability in distinguishing multiple dense objects
const MODEL_NAME = "gemini-3-pro-preview";

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts business card information using Gemini.
 * Returns an array of extracted data, as one image might contain multiple cards.
 */
export const extractBusinessCardInfo = async (file: File): Promise<ExtractedData[]> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: `You are an expert OCR and Data Extraction AI. 
            
            This image contains MULTIPLE business cards (possibly 8 or more). 
            Your task is to identifying EVERY SINGLE card visible in the image.
            
            Scan the image thoroughly (row by row, or grid by grid) to ensure no card is missed.
            For each card found, extract the contact information into the specified JSON object.
            
            Return a JSON List containing one object per card found.
            If a field is not visible on a specific card, use null.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING, description: "The full name of the person." },
              jobTitle: { type: Type.STRING, description: "The job title or position." },
              companyName: { type: Type.STRING, description: "The name of the company or organization." },
              email: { type: Type.STRING, description: "Email address." },
              phoneNumber: { type: Type.STRING, description: "Primary phone number." },
              address: { type: Type.STRING, description: "Physical office address." },
              website: { type: Type.STRING, description: "Website URL." },
            },
            required: ["fullName", "companyName"], 
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as ExtractedData[];

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
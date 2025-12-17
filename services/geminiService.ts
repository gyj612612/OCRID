import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

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
            text: "Analyze this image. It may contain ONE or MULTIPLE business cards. Extract the contact information for EACH distinct business card found into a JSON list. If a field is not visible, use null.",
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
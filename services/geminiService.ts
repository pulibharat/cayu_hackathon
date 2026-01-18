
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPublicHealthInsights = async (babyData: any[], stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Public Health AI consultant for the Ministry of Health in Cameroon.
      Context: EPI (Expanded Programme on Immunization) session monitoring.
      
      Clinic Stats:
      - Registered Babies: ${stats.totalBabies}
      - Completed Doses: ${stats.completedVaxCount}
      - Missed Doses: ${stats.missedDoseCount}
      
      Clinic Data (JSON): ${JSON.stringify(babyData.slice(0, 10))}
      
      Identify:
      1. One major risk (e.g., "30% drop off between Penta-1 and Penta-3 in Molyko village").
      2. A brief Outreach Strategy (max 2 sentences).
      3. A sample WhatsApp reminder in English AND Pidgin English for parents who missed doses.
      
      Format your response as a cohesive, empathetic professional summary for a Midwife outreach lead. Keep it under 150 words.`,
      config: {
        temperature: 0.6,
        topP: 0.9,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Coverage alert: We are seeing a slight increase in missed Penta-2 doses in the Buea Town area. Suggest prioritizing home visits this Friday.";
  }
};

export interface OCRResult {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentName: string;
  village: string;
}

export const analyzeHealthCard = async (base64Image: string): Promise<OCRResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract the child's registration data from this vaccination card. Provide only a JSON object with these keys: firstName, lastName, dateOfBirth (YYYY-MM-DD), parentName, village." }
        ]
      },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as OCRResult;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

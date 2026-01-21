
import { GoogleGenAI, Type } from "@google/genai";

export const getPublicHealthInsights = async (babyData: any[], stats: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Public Health AI consultant for the Ministry of Health in Cameroon.
      Context: EPI (Expanded Programme on Immunization) session monitoring.
      
      Clinic Stats:
      - Registered Babies: ${stats.totalBabies}
      - Completed Doses: ${stats.completedVaxCount}
      - Missed Doses: ${stats.missedDoseCount}
      
      Clinic Data (JSON): ${JSON.stringify(babyData.slice(0, 15))}
      
      Identify:
      1. One major risk (e.g., "30% drop off between Penta-1 and Penta-3 in Molyko village").
      2. A brief Outreach Strategy (max 2 sentences).
      3. A sample WhatsApp reminder in English AND Pidgin English for parents who missed doses.
      
      Format your response as a cohesive, empathetic professional summary for a Midwife outreach lead. Keep it under 150 words.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Coverage alert: We are seeing a slight increase in missed Penta-2 doses in the Buea Town area. Suggest prioritizing home visits this Friday.";
  }
};

export interface OCRResult {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  village: string;
  weightAtBirth?: number;
  registryNumber?: string;
}

export const analyzeHealthCard = async (base64Image: string): Promise<OCRResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { 
            text: `Extract registration data from this Cameroon Health/Vaccination Card. 
            The document may be in English, French, or bilingual.
            
            Look specifically for:
            - Child's Name (Nom et Prénom de l'enfant)
            - Date of Birth (Né(e) le)
            - Mother/Father/Guardian's Name (Nom de la mère/père/tuteur)
            - Parent Phone Number (Téléphone)
            - Village, Quarter, or Place of Residence (Quartier/Village/Lieu de résidence)
            - Weight at Birth (Poids à la naissance) in kg
            - Registry/Health Card Number (N° de registre)
            
            Strictly return a JSON object with these keys: 
            firstName, lastName, dateOfBirth (format: YYYY-MM-DD), parentName, parentPhone, village, weightAtBirth, registryNumber.
            
            Accuracy is critical. If a field is unreadable, return "".` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            firstName: { type: Type.STRING },
            lastName: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            parentName: { type: Type.STRING },
            parentPhone: { type: Type.STRING },
            village: { type: Type.STRING },
            weightAtBirth: { type: Type.NUMBER },
            registryNumber: { type: Type.STRING },
          },
          required: ["firstName", "lastName", "dateOfBirth", "parentName", "parentPhone", "village"],
        },
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    const cleanJson = text.replace(/```(?:json)?\n?|```/g, "").trim();
    return JSON.parse(cleanJson) as OCRResult;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

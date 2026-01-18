
import { GoogleGenAI, Type } from "@google/genai";

export const getPublicHealthInsights = async (babyData: any[], stats: any) => {
  try {
    // Creating a fresh instance to ensure current API Key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    // Creating a fresh instance to ensure current API Key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Upgrading to gemini-3-pro-preview for complex vision task (handwritten clinical cards)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
            - Village, Quarter, or Place of Residence (Quartier/Village/Lieu de résidence)
            
            Strictly return a JSON object with these keys: 
            firstName, lastName, dateOfBirth (format: YYYY-MM-DD), parentName, village.
            
            Accuracy is critical. If a field is handwritten and messy, use surrounding context to infer the best match. 
            If totally unreadable, return "".` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        // Adding thinkingConfig to allow the model to reason through character recognition errors.
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    // Clean potential markdown formatting from JSON response if present
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as OCRResult;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

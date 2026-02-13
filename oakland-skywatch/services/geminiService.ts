
import { GoogleGenAI } from "@google/genai";
import { AIRLINES, AIRCRAFT_LOOKUP } from "../constants";

export interface ScoopResult {
  text: string;
  sources: Array<{ web: { title: string; uri: string } }>;
  isError?: boolean;
  isFallback?: boolean;
  isStatic?: boolean;
}

/**
 * Fetches "insider" plane spotter info using Gemini 3 Flash.
 * Implements a "Static Intelligence" fallback to ensure the app never feels broken.
 */
export const getPlaneSpotterScoop = async (airline: string, aircraft: string, direction: 'Arrival' | 'Departure'): Promise<ScoopResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `Act as an expert aviation enthusiast and plane spotter. Provide 2-3 fascinating and highly specific fun facts or "inside scoops" about ${airline} and their ${aircraft} aircraft. 
  This flight is currently a ${direction} at Oakland (KOAK). 
  Mention things like their unique liveries, specific OAK operations for this airline, or technical quirks that spotters look for. 
  Keep it short, engaging, and professional.`;

  try {
    // Attempt high-quality search-grounded content
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt + " Use Google Search to find current interesting details.",
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "No specific trivia found for this aircraft today.";
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = rawSources
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        web: {
          title: chunk.web.title || "Reference",
          uri: chunk.web.uri
        }
      }));

    return { text, sources, isError: false, isFallback: false };
  } catch (error: any) {
    const isQuotaError = error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
    
    if (isQuotaError) {
      console.warn("Quota exceeded. Deploying local static intelligence...");
      // DO NOT make another API call here. If the model quota is hit, 
      // the fallback call to the same model will also likely fail.
      return {
        text: getStaticIntel(airline, aircraft),
        sources: [],
        isError: false,
        isFallback: true,
        isStatic: true
      };
    }

    return {
      text: "Intelligence feed temporarily throttled. Signal jamming detected. Please wait 60 seconds.",
      sources: [],
      isError: true,
      isFallback: false
    };
  }
};

/**
 * Generates local trivia based on the dictionaries provided in constants.
 */
function getStaticIntel(airline: string, aircraft: string): string {
  const baseTrivia = [
    `${airline} is a frequent visitor to the East Bay, often utilizing OAK's specialized maintenance facilities.`,
    `The ${aircraft} is known for its efficient performance on medium-haul routes, a staple for Oakland's growing network.`,
    `Spotters at the OAK "North Field" often get the best view of these aircraft during their final approach.`
  ];
  
  // Custom flavor based on common OAK operators
  if (airline.includes("Southwest")) {
    return "Southwest maintains a massive crew base at OAK. Spotters look for the unique 'California One' or other special liveries which often rotate through this hub.";
  }
  if (airline.includes("FedEx")) {
    return "FedEx runs a major West Coast hub at OAK. These heavy-duty aircraft often arrive in the early morning 'push' and depart in late-night waves.";
  }

  return baseTrivia[Math.floor(Math.random() * baseTrivia.length)];
}

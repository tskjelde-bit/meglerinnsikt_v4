
import { GoogleGenAI, Type } from "@google/genai";
import { Property } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async getPropertyAnalysis(property: Property): Promise<string> {
    const response = await this.getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a professional real estate investment analysis for this property:
      Title: ${property.title}
      Price: $${property.price.toLocaleString()}
      Details: ${property.bedrooms} beds, ${property.bathrooms} baths, ${property.sqft} sqft
      Description: ${property.description}
      Tags: ${property.tags.join(', ')}
      
      Structure your response with:
      1. Investment Potential (Short & Long term)
      2. Key Selling Points
      3. Potential Drawbacks or Considerations`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Analysis unavailable at this moment.";
  }

  async chatWithAgent(message: string, context: Property | null, history: { role: 'user' | 'model', text: string }[]): Promise<string> {
    const chat = this.getAI().chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are an expert real estate AI advisor for Lumina Estate. 
        You help users find their dream homes, explain market trends, and provide insights into specific properties.
        Current focused property: ${context ? context.title : 'None selected'}.
        Be professional, friendly, and helpful. Use grounding tools if you need current location data or market info.`,
        tools: [{ googleSearch: {} }]
      }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that request.";
  }
}

export const geminiService = new GeminiService();

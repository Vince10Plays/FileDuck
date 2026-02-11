import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, FileAttachment } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachments: FileAttachment[] = []
): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    
    // Prepare contents
    // We only send the last message with its attachments + history as context if needed.
    // For simplicity in this demo, we will construct a single prompt with the current context.
    // In a real app, you'd manage a proper chat history object or multi-turn chat.

    const parts: any[] = [];

    // Add attachments first
    attachments.forEach(att => {
        // Strip the data:image/png;base64, prefix if present for inlineData
        const base64Data = att.data.split(',')[1] || att.data;
        
        parts.push({
            inlineData: {
                mimeType: att.type,
                data: base64Data
            }
        });
    });

    // Add the text prompt
    parts.push({ text: newMessage });

    // If we have previous history, we might want to prepend it as text context or use chat.
    // For this 'FileDuck' simple interface, a single turn with context is often sufficient for Q&A on a file.
    // However, let's include a bit of previous context if it exists.
    let contextPrompt = "";
    if (history.length > 0) {
        contextPrompt = "Previous conversation:\n" + history.map(m => `${m.role}: ${m.text}`).join('\n') + "\n\n";
    }

    const fullPrompt = contextPrompt + newMessage;
    
    // Update the text part to include history context contextually
    const finalParts = parts.map(p => p.text ? { text: fullPrompt } : p);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts: finalParts },
      config: {
        systemInstruction: "You are FileDuck, a helpful and quirky AI assistant. You love helping users analyze their files. You often use duck emojis 🦆 and bird-related puns in a subtle, professional way.",
      }
    });

    return response.text || "Quack! I couldn't generate a response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Quack! Something went wrong with my feathers. Please check your API key or internet connection.";
  }
};
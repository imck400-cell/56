
import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

// 1. Audio Transcription
export async function transcribeAudio(base64Audio: string, mimeType: string = 'audio/wav'): Promise<string> {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    },
                    { text: "Transcribe this audio exactly as spoken in Arabic." }
                ]
            }
        });
        return response.text || "No transcription available.";
    } catch (error) {
        console.error("Transcription error:", error);
        throw error;
    }
}

// 2. Text to Speech
export async function generateSpeech(text: string): Promise<ArrayBuffer> {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");

        // Helper to decode Base64 to ArrayBuffer
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (error) {
        console.error("TTS error:", error);
        throw error;
    }
}

// 3. Chat Bot
export async function chatWithGemini(history: {role: string, parts: {text: string}[]}[], newMessage: string): Promise<string> {
    const ai = getClient();
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: history,
        });

        const response = await chat.sendMessage({ message: newMessage });
        return response.text || "";
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
}

// 4. Image Generation
export async function generateImage(prompt: string, size: '1K' | '2K' | '4K'): Promise<string> {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    imageSize: size,
                    aspectRatio: "1:1"
                }
            },
        });
        
        // Find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data found in response");
    } catch (error) {
        console.error("Image generation error:", error);
        throw error;
    }
}

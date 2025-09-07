import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImage = async (
    images: { base64: string, mimeType: string }[], 
    prompt: string
): Promise<Part[]> => {
    const model = 'gemini-2.5-flash-image-preview';

    const imageParts = images.map(image => ({
        inlineData: {
            data: image.base64,
            mimeType: image.mimeType,
        },
    }));

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    ...imageParts,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const contentParts = response.candidates?.[0]?.content?.parts;

        if (contentParts && contentParts.length > 0) {
            return contentParts;
        } else {
            const safetyFeedback = response.candidates?.[0]?.safetyRatings;
            if (safetyFeedback) {
                 const blockedCategories = safetyFeedback
                    .filter(rating => rating.blocked)
                    .map(rating => rating.category)
                    .join(', ');
                if (blockedCategories) {
                    throw new Error(`Request blocked due to safety settings for: ${blockedCategories}.`);
                }
            }
            throw new Error("No content parts received from the AI. The prompt might be too complex or unsafe.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};

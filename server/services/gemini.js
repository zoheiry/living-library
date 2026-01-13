const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake-key');

const generateExcerpt = async (bookTitle, bookAuthor) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Generate a short, inspiring, random excerpt (about 1-2 paragraphs) from the book "${bookTitle}" by ${bookAuthor}. Format it as plain text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Could not generate excerpt at this time.";
    }
};

const chatWithBook = async (title, author, userMessage, history = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Construct chat history for Gemini
        // History format from client: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [...] }]
        // We need to inject the system instruction implicitly since system instructions are supported differently or via prompt engineering in some versions.
        // For 2.0-flash or 1.5-flash, system instructions are supported. Let's try to use valid chat history.

        const systemInstruction = `You are the book "${title}" by ${author}. You must embody the persona of this book completely. Answer the user's questions as if you are the book itself speaking. Do not break character. Be inquisitive and engage the user in conversation about your themes, characters, and their thoughts on reading you. Format your responses using standard Markdown (bold, italics, lists, etc.) where appropriate to enhance readability.`;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System Instruction: ${systemInstruction}` }],
                },
                {
                    role: "model",
                    parts: [{ text: `Understood. I am now "${title}" by ${author}. matches exactly.` }],
                },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Chat API Error:", error);
        throw new Error("Failed to chat with book.");
    }
};

module.exports = { generateExcerpt, chatWithBook };

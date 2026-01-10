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

module.exports = { generateExcerpt };

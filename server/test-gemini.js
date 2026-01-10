const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Just try to list models if possible, but the SDK doesn't have a direct "listModels" on the client usually, 
        // it's often a separate call or we check if the basic instantiation works.
        // Actually, v1beta has a model listing endpoint, but the node SDK wraps it.
        // Let's try to just generate content with a very basic prompt and catch the specific error details or try a fallback.

        // Better idea: The error message says "Call ListModels". Let's try to do a raw fetch to listing.
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.log("No API Key found in env");
            return;
        }

        // Using fetch to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();

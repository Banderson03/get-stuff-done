import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

function Gemini() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResponse("");

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash", // This is hotswappable
                contents: input,
            });

            setResponse(result.text); 
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div>
            <h2>Gemini API Demo</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini something..."
                    required
                />
                <button type="submit" disabled={loading}>
                    Send
                </button>
            </form>

            {loading && <p>Loading...</p>} {/* Show loading state */}
            {response && <p>Response: {response}</p>} {/* Display response */}
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
        </div>
    );
}

export default Gemini;

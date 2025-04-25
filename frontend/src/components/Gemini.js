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
        <div className="gemini-container"> 
            <h2>Gemini API Demo</h2>
            <form onSubmit={handleSubmit} className="gemini-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini something..."
                    required
                    aria-label="Ask Gemini something"
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    {loading ? "Sending..." : "Send"}
                </button>
            </form>

            {loading && <p className="gemini-status">Loading...</p>}
            {error && <p className="gemini-error" style={{ color: "red" }}>Error: {error}</p>}
            {(!loading && (response || !error)) && (
                 <div className="gemini-output-container">
                    <label htmlFor="geminiOutputDisplay">Gemini Response:</label>
                    <textarea
                        id="geminiOutputDisplay"
                        className="gemini-output-box"
                        value={response}
                        readOnly
                        placeholder="Gemini response will appear here..."
                        rows={10}
                    />
                </div>
            )}
        </div>
    );
}

export default Gemini;

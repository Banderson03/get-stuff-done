import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

/**
 * Generate detailed strategy given past context and a new query
 */
export async function generateStrategy(context, query) {
    const prompt = `You are an assistant. Here are past tasks:\n${context}\nGive a detailed strategy for: ${query}`;
    const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    return res.text.trim();
}

/**
 * Summarize any text in one short phrase
 */
export async function summarizeText(text, label) {
    const prompt = `Summarize this ${label} in one phrase: ${text}`;
    const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    return res.text.trim();
}

function Gemini() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
        });
        return () => unsubscribe();
    }, []);


    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResponse("");

        try {
            const db = getDatabase();
            const tasksRef = ref(db, `users/${user.uid}/tasks`);

            // fetch past tasks with feedback & endDate
            const snap = await get(tasksRef);
            const history = snap.exists() ? snap.val() : {};
            const past = Object.values(history).filter(t => t.feedback && t.endDate);
            const context = past.map((t,i) => `Task ${i+1}: ${t.task} | Feedback: ${t.feedback}`).join("\n");

            // call Gemini helper
            const fullStrategy = await generateStrategy(context, input);
            const summedTask    = await summarizeText(input, 'task');
            const summedStrat   = await summarizeText(fullStrategy, 'strategy');

            // push new task record
            const newRef = push(tasksRef);
            await set(newRef, {
                task: summedTask,
                strategy: summedStrat,
                feedback: '',
                startDate: new Date().toISOString(),
                endDate: ''
            });

            setResponse(fullStrategy);
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

import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

/**
 * Generate detailed strategy given past context and a new query
 */
export async function generateStrategy(context, query) {
    const prompt = `You are a scheduling assistant trying to give a brief strategy for a task provided by the user, taking their past tasks/strategies/feedback into account. If a previous strategy ` +
    `is not effective, you should prefer a new strategy. If the old strategy is effective, feel free to use it. If there is not a lot of context, consider strategies such as ` +
    `"set a 30 minute timer and focus on the task, taking a 5 minute break between tasks" or "lock yourself in a coffee shop or other 3rd space and focus on the task." or ` +
    `"give your friend your phone and don't get it back until you finish the work". Feel free to be creative with other techniques. Your advice should be no more than 3 sentences and can be less.
    Here are past tasks:\n${context}\n
    Give a detailed strategy for: "${query}"`;
    const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    return res.text.trim();
}

/**
 * Summarize any text in one short phrase
 */
export async function summarizeText(text, label) {
    const prompt = `Summarize this ${label} in one phrase. Do not add any extra text or formatting like asterisks: ${text}`;
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
            const context = past.map((t,i) => `Task ${i+1}: ${t.task} | Strategy: ${t.strategy} | Feedback: ${t.feedback}`).join("\n");

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
        <div className="gemini-container"> 
            <h2>Get Stuff Done!!!</h2>
            <form onSubmit={handleSubmit} className="gemini-form" style={{ width: "700px", display: "flex", gap: "8px" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Give me a task you want help with"
                    required
                    aria-label="Give me a task you want help with"
                    style={{ flex: 1, padding: "2px 8px", fontSize: "14px" }}
                />
                <button
                    className="gemini-button"
                    type="submit"
                    disabled={loading || !input.trim()}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </form>


            {error && <p className="gemini-error" style={{ color: "red" }}>Error: {error}</p>}
                 <div className="gemini-output-container">
                    <label htmlFor="geminiOutputDisplay">Gemini Response:</label>
                    <textarea
                        id="geminiOutputDisplay"
                        className="gemini-output-box"
                        value={loading ? "Loading..." : response}
                        readOnly
                        placeholder="Gemini response will appear here..."
                        rows={10}
                    />
                </div>
        </div>
    );
}

export default Gemini;

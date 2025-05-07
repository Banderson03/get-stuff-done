import React, { useState, useEffect } from "react";
import { gapi } from "gapi-script"; 
import { GoogleGenAI, Type } from "@google/genai";
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useGoogleCalendar } from './useGoogleCalendar';


const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
const createEvent = {
    name: "createEvent",
    description: "Create a new Google Calendar event if there's no conflict",
    parameters: {
        type: "object",
        properties: {
        summary: { type: "string", description: "Event title" },
        description: { type: "string", description: "Event details" },
        start: {
            type: "object",
            properties: {
            dateTime: { type: "string", description: "ISO start timestamp" },
            timeZone: { type: "string", description: "IANA time zone" }
            },
            required: ["dateTime", "timeZone"]
        },
        end: {
            type: "object",
            properties: {
            dateTime: { type: "string", description: "ISO end timestamp" },
            timeZone: { type: "string", description: "IANA time zone" }
            },
            required: ["dateTime", "timeZone"]
        }
        },
        required: ["summary", "start", "end"]
    }
    };


/**
 * Generate detailed strategy given past context and a new query
 */
export async function generateStrategy(context, query, existingEvents) {

    // Format existing events for context
    const formattedEvents = existingEvents.map(event => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;
        return `- ${event.summary}: ${new Date(start).toLocaleString()} to ${new Date(end).toLocaleString()}`;
    }).join('\n');
    const prompt = `Today is ${new Date().toLocaleDateString()}. You are a scheduling assistant trying to give a brief strategy for a task provided by the user, taking their past tasks/strategies/feedback into account. If a previous strategy ` +
    `is not effective, you should prefer a new strategy. If the old strategy is effective, feel free to use it. If there is not a lot of context, consider strategies such as ` +
    `"set a 30 minute timer and focus on the task, taking a 5 minute break between tasks" or "lock yourself in a coffee shop or other 3rd space and focus on the task." or ` +
    `"give your friend your phone and don't get it back until you finish the work". Feel free to be creative with other techniques. Your advice should be no more than 3 sentences and can be less.
    Here are past tasks:\n${context}\n
    Give a detailed strategy for: "${query}"
    
    Additionally, I want you to use createEvent to schedule the event during a time in which the user is free. Here are the events:\n${formattedEvents}`;
    const res = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt, config: {
        tools: [{
          functionDeclarations: [createEvent]
        }],
      } });
    return res;
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
    const { fetchEvents, createEvent } = useGoogleCalendar();
    

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

            // Get existing events for the next 7 days
            const now = new Date();
            const sevenDaysLater = new Date(now);
            sevenDaysLater.setDate(now.getDate() + 7);
            const existingEvents = await fetchEvents(now, sevenDaysLater);

            // call Gemini helper
            const fullStrategy = await generateStrategy(context, input, existingEvents);
            const summedTask = await summarizeText(input, 'task');
            const summedStrat = await summarizeText(fullStrategy.text.trim(), 'strategy');
            if (fullStrategy.functionCalls && fullStrategy.functionCalls.length > 0) {
                createEvent(fullStrategy.functionCalls[0].args);
            }

            // push new task record
            const newRef = push(tasksRef);
            await set(newRef, {
                task: summedTask,
                strategy: summedStrat,
                feedback: '',
                startDate: new Date().toISOString(),
                endDate: ''
            });

            setResponse(fullStrategy.text.trim());
        } catch (err) {
            setError(err.message); 
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="gemini-container"> 
            <h2>Create a Task</h2>
            <form onSubmit={handleSubmit} className="gemini-form" style={{ width: "1100px", display: "flex", gap: "8px" }}>
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

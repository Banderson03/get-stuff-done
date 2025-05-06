import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import GemeniComponent from "../../components/Gemini";
import GoogleCalendarEmbed from "../../components/GoogleCalendarEmbed";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import TaskList from "../../components/TaskList";
import "./Home.css";



function Home() {
    const navigate = useNavigate();
    const [message, setMessage] = useState(""); // State to hold the message fetched from the backend


    // Sign out handler
    const handleSignOut = async () => {
        await signOut(auth);
        navigate("/");
    };
    
    return (
        <div className="page-layout">
            {/* Box 1: Task List */}
            <div className="task-list-box">
                <TaskList />
            </div>

            {/* Box 2: Main Content (Calendar, etc.) */}
            <div className="main-content-box">
                <div className="main-content-header">
                    <h1>Get Started With Get Stuff Done</h1>
                    <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
                </div>
                <GoogleCalendarEmbed
                    calendarId="2959515c3df1dd2d8dfb6ef572e6d73ce4edcafed0e7a65a61ba5e1bc5a2fce9@group.calendar.google.com@group.calendar.google.com"
                    timezone="America/Chicago"
                />
                <GemeniComponent />
            </div>

        </div>
    )
}

export default Home;



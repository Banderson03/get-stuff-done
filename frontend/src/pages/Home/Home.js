import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useGoogleCalendar } from '../../components/useGoogleCalendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import { format, parseISO } from 'date-fns';
import GemeniComponent from "../../components/Gemini";
import GoogleCalendarEmbed from "../../components/GoogleCalendarEmbed";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import TaskList from "../../components/TaskList";
import "./Home.css";



function Home() {
    const navigate = useNavigate();
    const { gapiReady, signedIn, signIn, signOut, fetchEvents } = useGoogleCalendar();
    const [events, setEvents] = useState([]); // State to hold the calendar
    const localizer = momentLocalizer(moment);



    // Sign out handler
    const handleSignOut = async () => {
        await signOut(auth);
        navigate("/");
    };

    useEffect(() => {
        if (gapiReady && signedIn) {
          fetchEvents().then(data => {
            const mapped = data.map(event => ({
              title: event.summary,
              start: new Date(event.start.dateTime || event.start.date),
              end: new Date(event.end.dateTime || event.end.date),
            }));
            setEvents(mapped);
          });
        }
      }, [gapiReady, signedIn]);
    
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
                <div>
                    {!signedIn && <button onClick={signIn}>Sign in to Google Calendar</button>}
                    {signedIn && <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600, margin: '50px' }}
                    />}
                </div>
                <GemeniComponent />
            </div>

        </div>
    )
}

export default Home;



import React, {useEffect, useState} from "react";
import { Tooltip } from 'react-tooltip';
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useGoogleCalendar } from '../../components/useGoogleCalendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-tooltip/dist/react-tooltip.css';
import moment from 'moment'
import { startOfMonth, endOfMonth } from 'date-fns';
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

    const handleNavigate = (date) => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        fetchEvents(start, end).then((data) => {
            const mapped = data.map(event => ({
            title: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            }));
            setEvents(mapped);
        });
      };

    useEffect(() => {
        if (gapiReady && signedIn) {
            const now = new Date();
            const start = startOfMonth(now);
            const end = endOfMonth(now);
          fetchEvents(start, end).then(data => {
            console.log("Fetched events:", data);
            const mapped = data.map(event => ({
                id: event.id,
                title: event.summary,
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date),
            }));
            setEvents(mapped);
          });
        }
      }, [gapiReady, signedIn, fetchEvents]);

      const EventComponent = ({ event }) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const formattedTime = `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
        const tooltipId = event.id + `tooltip-${event.title}-${event.start.getTime()}`;
        
        return (
          <>
            <div 
              data-tooltip-id={tooltipId}
              data-tooltip-content={event.title}
              style={{ cursor: 'pointer' }}
            >
              {event.title}
            </div>
            
            <Tooltip 
              id={tooltipId}
              place="top"
              render={() => (
                <div>
                  <strong>{event.title}</strong>
                  <br />
                  {formattedTime}
                  {event.description && (
                    <>
                      <br />
                      <em>{event.description}</em>
                    </>
                  )}
                </div>
              )}
            />
          </>
        );
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
                <div style={{ overflow: 'visible' }}>
                    {!signedIn && <button onClick={signIn}>Sign in to Google Calendar</button>}
                    {signedIn && <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        views={["month", "week", "day"]}
                        style={{ height: 600, margin: '50px' }}
                        onNavigate={handleNavigate}
                        components={{
                            event: EventComponent,
                          }}
                    />
                    }
                </div>
                <GemeniComponent />
            </div>

        </div>
    )
}

export default Home;



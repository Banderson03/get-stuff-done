import { useState, useEffect, useCallback } from 'react';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export function useGoogleCalendar() {
  const [gapiReady, setGapiReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', async () => {
        await window.gapi.client.init({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });
        setGapiReady(true);
        const auth = window.gapi.auth2.getAuthInstance();
        setSignedIn(auth.isSignedIn.get());
        auth.isSignedIn.listen(setSignedIn);
      });
    };
    document.body.appendChild(script);
  }, []);

  const signIn = () => window.gapi.auth2.getAuthInstance().signIn();
  const signOut = () => window.gapi.auth2.getAuthInstance().signOut();

  // Fetch events from all calendars
  const fetchEvents = useCallback(async (startDate = new Date(), endDate = null) => {
    try {
      const calendarListRes = await window.gapi.client.calendar.calendarList.list();
      const calendars = calendarListRes.result.items;
  
      const allEvents = [];
      for (const calendar of calendars) {
        const res = await window.gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: startDate.toISOString(),
          timeMax: endDate?.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
        });
        allEvents.push(...res.result.items);
        console.log("Events fetched:", res.result.items);
      }
  
      return allEvents;
    } catch (err) {
      console.error("Failed to fetch events:", err);
      return [];
    }
  }, []);

  return { gapiReady, signedIn, signIn, signOut, fetchEvents };
}
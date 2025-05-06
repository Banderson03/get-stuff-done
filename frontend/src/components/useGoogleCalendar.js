import { useState, useEffect } from 'react';

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

  const fetchEvents = async () => {
    const res = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.result.items;
  };

  return { gapiReady, signedIn, signIn, signOut, fetchEvents };
}
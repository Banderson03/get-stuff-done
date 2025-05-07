import { useState, useEffect, useCallback } from 'react';

// Update scope to include write access
const SCOPES = 'https://www.googleapis.com/auth/calendar';

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
      if (!gapiReady || !signedIn) {
        console.warn("GAPI not ready or user not signed in");
        return [];
      }
      
      const calendarListRes = await window.gapi.client.calendar.calendarList.list();
      const calendars = calendarListRes.result.items;
      
      const allEvents = [];
      for (const calendar of calendars) {
        const res = await window.gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: startDate.toISOString(),
          timeMax: endDate?.toISOString() || undefined,
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 100
        });
        
        if (res.result.items && res.result.items.length > 0) {
          allEvents.push(...res.result.items);
        }
      }
  
      return allEvents;
    } catch (err) {
      console.error("Failed to fetch events:", err);
      return [];
    }
  }, [gapiReady, signedIn]);

  // Create a new calendar event
  const createEvent = useCallback(async (eventData) => {
    try {
      if (!gapiReady || !signedIn) {
        throw new Error("GAPI not ready or user not signed in");
      }

      // Get primary calendar by default
      const calendarListRes = await window.gapi.client.calendar.calendarList.list();
      const primaryCalendar = calendarListRes.result.items.find(cal => cal.primary) || calendarListRes.result.items[0];
      
      // Check for potential overlaps
      const checkStart = new Date(eventData.start.dateTime);
      const checkEnd = new Date(eventData.end.dateTime);
      
      const existingEvents = await fetchEvents(
        new Date(checkStart.getTime() - 30 * 60000), // 30 minutes before
        new Date(checkEnd.getTime() + 30 * 60000)    // 30 minutes after
      );
      
      // Filter for actual overlaps with proposed time
      const overlaps = existingEvents.filter(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        
        // Check if event overlaps with proposed time
        return (
          (checkStart < eventEnd && checkEnd > eventStart) &&
          // Exclude all-day events from strict overlap checking
          (event.start.dateTime && event.end.dateTime)
        );
      });
      
      if (overlaps.length > 0) {
        // Format the overlapping events into a readable message
        const overlapDetails = overlaps.map(e => 
          `"${e.summary}" (${new Date(e.start.dateTime || e.start.date).toLocaleString()} - ${new Date(e.end.dateTime || e.end.date).toLocaleString()})`
        ).join(", ");
        
        throw new Error(`Scheduling conflict with: ${overlapDetails}`);
      }
      
      console.log("Creating event:", eventData);
      // Create the event if no conflicts
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: primaryCalendar.id,
        resource: eventData
      });
      
      return response.result;
    } catch (err) {
      console.error("Failed to create event:", err);
      throw err;
    }
  }, [gapiReady, signedIn, fetchEvents]);

  // Check if a time slot is available (not overlapping with existing events)
  const checkAvailability = useCallback(async (startDateTime, endDateTime) => {
    try {
      const events = await fetchEvents(
        new Date(startDateTime),
        new Date(endDateTime)
      );
      
      return events.length === 0;
    } catch (err) {
      console.error("Failed to check availability:", err);
      return false;
    }
  }, [fetchEvents]);

  return { 
    gapiReady, 
    signedIn, 
    signIn, 
    signOut, 
    fetchEvents, 
    createEvent,
    checkAvailability 
  };
}
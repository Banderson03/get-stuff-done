import React from 'react';

const GoogleCalendarEmbed = ({ calendarId, timezone = 'America/Chicago', width = '800', height = '600' }) => {
  const calendarUrl = `https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=${timezone}`;

  return (
    <div>
      <iframe
        src={calendarUrl}
        style={{ border: '0' }}
        width={width}
        height={height}
        title="Google Calendar"
      ></iframe>
    </div>
  );
};

export default GoogleCalendarEmbed;
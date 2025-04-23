import React from 'react';

const GoogleCalendarEmbed = () => {
  return (
    <div>
      <iframe
        src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FChicago&showPrint=0&title=Get-Stuff-Done-Test&src=Mjk1OTUxNWMzZGYxZGQyZDhkZmI2ZWY1NzJlNmQ3M2NlNGVkY2FmZWQwZTdhNjVhNjFiYTVlMWJjNWEyZmNlOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=MnE2Y2QzMXVjc3BqcG05cm4zbXZ2NDZkbnNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%238E24AA&color=%23009688&color=%23A79B8E"
        style={{ border: 'solid 1px #777' }}
        width="800"
        height="600"
        title="Google Calendar"
      ></iframe>
    </div>
  );
};

export default GoogleCalendarEmbed;

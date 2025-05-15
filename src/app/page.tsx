
'use client'; // Needed for useState and useEffect

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setCurrentTime(new Date().toLocaleTimeString());

    // Optional: update time every second
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, []); // Empty dependency array ensures this runs once on mount (and sets up interval)

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Market Insights Pro!</h1>
      <p>This is the homepage of your application.</p>
      {currentTime !== null ? (
        <p>Current time: {currentTime}</p>
      ) : (
        <p>Loading current time...</p>
      )}
      <p>If you see this, Next.js is working correctly.</p>
    </div>
  );
}

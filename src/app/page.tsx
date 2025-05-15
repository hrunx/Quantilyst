// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Root Page Test</h1>
      <p>If you see this, the Next.js App Router is correctly finding and rendering /src/app/page.tsx.</p>
      <p>The time is: <span id="time-placeholder">Loading time...</span></p>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              try {
                const timeElement = document.getElementById('time-placeholder');
                if (timeElement) {
                  timeElement.innerText = new Date().toLocaleTimeString();
                }
              } catch (e) {
                console.error('Error setting time:', e);
                if (timeElement) {
                  timeElement.innerText = 'Error loading time.';
                }
              }
            });
          `,
        }}
      />
    </div>
  );
}

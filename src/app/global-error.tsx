'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1f3a',
          color: '#ffffff',
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div>
          <p style={{ color: '#c9a227', letterSpacing: 6, textTransform: 'uppercase', fontSize: 12 }}>Something went wrong</p>
          <h1 style={{ fontSize: 32, fontWeight: 'normal', margin: '12px 0' }}>We’ll be right back</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial, sans-serif', fontSize: 15 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              background: '#c9a227',
              color: '#0b1f3a',
              border: 0,
              padding: '14px 28px',
              fontWeight: 'bold',
              letterSpacing: 1,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1f3a',
          border: '18px solid #c9a227',
          color: '#ffffff',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 10, color: '#c9a227', textTransform: 'uppercase' }}>The Fragrance Gallery</div>
        <div style={{ fontSize: 104, marginTop: 24, color: '#c9a227', display: 'flex' }}>
          {SITE_NAME}
          <span style={{ color: '#ffffff' }}>.</span>
        </div>
        <div style={{ width: 120, height: 4, background: '#c9a227', marginTop: 28 }} />
        <div style={{ fontSize: 38, marginTop: 28, color: '#ffffff' }}>{SITE_TAGLINE}</div>
      </div>
    ),
    size,
  );
}
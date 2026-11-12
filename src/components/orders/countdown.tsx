'use client';

import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

/** Live "23h 04m 12s" countdown to a deadline */
export function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null); // null until mounted (avoids SSR mismatch)

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) return <span className="tabular-nums">--h --m --s</span>;

  const remaining = new Date(deadline).getTime() - now;
  if (remaining <= 0) {
    return <span className="font-semibold text-error">Payment window has closed</span>;
  }

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <span className="font-semibold tabular-nums">
      {hours}h {pad(minutes)}m {pad(seconds)}s
    </span>
  );
}
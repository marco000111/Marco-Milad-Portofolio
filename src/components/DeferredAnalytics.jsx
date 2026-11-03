import { useEffect, useState } from 'react';

export default function DeferredAnalytics() {
  const [Analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) return undefined;

    let active = true;
    let idleId;
    let fallbackTimer;
    const loadAnalytics = () => {
      import('@vercel/analytics/react')
        .then((module) => {
          if (active) setAnalytics(() => module.Analytics);
        })
        .catch((error) => {
          console.error('[portfolio] Analytics failed to load.', error);
        });
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(loadAnalytics, { timeout: 4000 });
    } else {
      fallbackTimer = window.setTimeout(loadAnalytics, 1200);
    }
    return () => {
      active = false;
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return Analytics ? <Analytics /> : null;
}

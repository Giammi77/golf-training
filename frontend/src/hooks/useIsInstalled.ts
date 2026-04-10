import { useEffect, useState } from 'react';

export function useIsInstalled(): boolean {
  const [installed, setInstalled] = useState<boolean>(() => checkInstalled());

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = () => setInstalled(checkInstalled());
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  return installed;
}

function checkInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

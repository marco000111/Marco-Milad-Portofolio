import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function useSmoothScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis;

    const start = () => {
      if (lenis || motionPreference.matches) return;
      lenis = new Lenis({
        autoRaf: false,
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
        overscroll: false,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (document.hidden) lenis.stop();
    };

    const stop = () => {
      if (!lenis) return;
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = undefined;
    };

    function tick(time) {
      lenis?.raf(time * 1000);
    }

    const updateMotion = () => motionPreference.matches ? stop() : start();
    const updateVisibility = () => {
      if (document.hidden) lenis?.stop();
      else if (!motionPreference.matches) lenis?.start();
    };

    motionPreference.addEventListener?.('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    start();

    return () => {
      motionPreference.removeEventListener?.('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      stop();
    };
  }, []);
}

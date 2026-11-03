import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ThreeNameScene from './ThreeNameScene.jsx';

function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const forceReplay = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('intro') === 'force';
  if (forceReplay) return true;
  try {
    return sessionStorage.getItem('portfolio-welcome-seen') !== '1';
  } catch {
    return false;
  }
}

const particles = Array.from({ length: 14 }, (_, index) => index);
const EXIT_DURATION = 400;

export default function CinematicIntro({ language, copy }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(shouldShowIntro);
  const [exiting, setExiting] = useState(false);
  const finished = useRef(false);
  const exitTimer = useRef(0);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem('portfolio-welcome-seen', '1');
    } catch {
      // The intro remains usable when storage is unavailable.
    }
    document.body.classList.add('intro-transitioning');
    setExiting(true);
    exitTimer.current = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove('intro-transitioning');
    }, EXIT_DURATION);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    document.body.classList.add('intro-active');
    return () => document.body.classList.remove('intro-active');
  }, [visible]);

  useEffect(() => {
    if (!visible || reducedMotion) {
      if (reducedMotion) setVisible(false);
      return undefined;
    }
    // 2.3s scene choreography + 0.4s handoff; no simulated loading state.
    const timer = window.setTimeout(finish, 2300);
    const finishWhenHidden = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', finishWhenHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', finishWhenHidden);
    };
  }, [finish, reducedMotion, visible]);

  useEffect(() => {
    if (!visible || reducedMotion) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') finish(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [finish, reducedMotion, visible]);

  useEffect(() => () => {
    window.clearTimeout(exitTimer.current);
    document.body.classList.remove('intro-transitioning');
  }, []);

  if (!visible || reducedMotion) return null;

  return (
    <motion.aside
      className={`preloader cinematic-intro${exiting ? ' is-exiting' : ''}`}
      role="region"
      aria-label={copy.introLabel}
      aria-live="polite"
      initial={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0 0)' }}
      animate={exiting
        ? { opacity: 0.08, scale: 1.035, clipPath: 'inset(0 0 100% 0)' }
        : { opacity: 1, scale: 1, clipPath: 'inset(0 0 0 0)' }}
      transition={{ duration: EXIT_DURATION / 1000, ease: [0.76, 0, 0.24, 1] }}
    >
      <button type="button" className="preloader-skip" onClick={finish}>
        {copy.introSkip}
      </button>
      <div className="intro-particles" aria-hidden="true">
        {particles.map((particle) => (
          <i key={particle} style={{
            '--particle-index': particle,
            '--particle-x': `${4 + particle * 6.8}%`,
            '--particle-y': `${12 + ((particle * 7) % 75)}%`,
          }} />
        ))}
      </div>
      <div className="intro-light-beam" aria-hidden="true" />
      <svg className="intro-light-lines" viewBox="0 0 1200 520" fill="none" aria-hidden="true">
        <path d="M-40 360C150 300 264 180 428 232s248 146 402 62S1088 130 1240 58" />
        <path d="M-30 420C190 385 254 290 436 300s249 101 421 51 244-113 390-145" />
        <path d="M146 116c146 28 193 120 329 109s215-91 352-103 208 21 322 69" />
      </svg>
      <div className="intro-blue-source" aria-hidden="true" />
      <div className="preloader-center intro-stage">
        <motion.p
          className="preloader-kicker intro-kicker"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.08 }}
        >
          {language === 'ar' ? 'تطوير رقمي بإيقاع مختلف' : 'DIGITAL CRAFT, IN MOTION'}
        </motion.p>
        <h1 className="preloader-name intro-name" dir="ltr" aria-label="Marco Milad">
          <ThreeNameScene variant="intro" />
        </h1>
        <motion.div
          className="intro-portrait-window"
          initial={{ clipPath: 'inset(48% 0 48% 0)', opacity: 0.05, scale: 1.08 }}
          animate={{ clipPath: 'inset(0% 0 0% 0)', opacity: 0.82, scale: 1 }}
          transition={{ duration: 0.82, delay: 0.96, ease: [0.2, 0.8, 0.2, 1] }}
          aria-hidden="true"
        >
          <img src="/assets/images/marco-milad-portrait.png" alt="" width="1141" height="1378" />
          <i className="intro-portrait-sweep" />
        </motion.div>
        <motion.p
          className="intro-caption"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.42, duration: 0.42 }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {language === 'ar' ? 'ماركو ميلاد · مطور واجهات أمامية' : 'MARCO MILAD · FRONT-END DEVELOPER'}
        </motion.p>
      </div>
    </motion.aside>
  );
}

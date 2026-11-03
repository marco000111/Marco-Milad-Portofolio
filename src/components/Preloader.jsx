import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem('portfolio-welcome-seen') !== '1';
  } catch {
    return false;
  }
}

const particles = Array.from({ length: 9 }, (_, index) => index);

export default function Preloader({ language, copy }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(shouldShowIntro);
  const finished = useRef(false);

  const skip = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem('portfolio-welcome-seen', '1');
    } catch {
      // Storage is optional; the page remains usable either way.
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible || reducedMotion) {
      if (reducedMotion) setVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(skip, 2050);
    const finishWhenHidden = () => {
      if (document.hidden) skip();
    };
    document.addEventListener('visibilitychange', finishWhenHidden);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', finishWhenHidden);
    };
  }, [reducedMotion, skip, visible]);

  useEffect(() => {
    if (!visible || reducedMotion) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') skip();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [reducedMotion, skip, visible]);

  return (
    <AnimatePresence>
      {visible && !reducedMotion && (
        <motion.aside
          className="preloader cinematic-intro"
          role="region"
          aria-label={copy.introLabel}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
        >
          <button type="button" className="preloader-skip" onClick={skip}>
            {copy.introSkip}
          </button>
          <div className="intro-particles" aria-hidden="true">
            {particles.map((particle) => (
              <i key={particle} style={{ '--particle-index': particle, '--particle-x': `${8 + particle * 10.5}%`, '--particle-y': `${20 + (particle % 4) * 17}%` }} />
            ))}
          </div>
          <svg className="intro-light-lines" viewBox="0 0 1200 520" fill="none" aria-hidden="true">
            <path d="M-40 360C150 300 264 180 428 232s248 146 402 62S1088 130 1240 58" />
            <path d="M-30 420C190 385 254 290 436 300s249 101 421 51 244-113 390-145" />
            <path d="M146 116c146 28 193 120 329 109s215-91 352-103 208 21 322 69" />
          </svg>
          <div className="intro-blue-source" aria-hidden="true" />
          <motion.div
            className="preloader-center intro-stage"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
          >
            <motion.p
              className="preloader-kicker intro-kicker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.04 }}
            >
              {language === 'ar' ? 'تطوير رقمي بإيقاع مختلف' : 'DIGITAL CRAFT, IN MOTION'}
            </motion.p>
            <h1 className="preloader-name intro-name" dir="ltr" aria-label="Marco Milad">
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.58, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                aria-hidden="true"
              >MARCO</motion.span>
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.58, delay: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                aria-hidden="true"
              >MILAD</motion.span>
            </h1>
            <motion.div
              className="intro-portrait-window"
              initial={{ clipPath: 'inset(32% 8% 45% 8% round 50%)', opacity: 0.08, scale: 1.06, y: 22 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0% round 44% 44% 12% 12%)', opacity: 0.74, scale: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
              aria-hidden="true"
            >
              <img src="/assets/images/marco-milad-portrait.png" alt="" width="1141" height="1378" />
            </motion.div>
            <motion.p
              className="intro-caption"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.12, duration: 0.4 }}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {language === 'ar' ? 'ماركو ميلاد · مطور واجهات أمامية' : 'MARCO MILAD · FRONT-END DEVELOPER'}
            </motion.p>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

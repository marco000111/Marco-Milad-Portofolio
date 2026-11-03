import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

function shouldShowWelcome() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem('portfolio-welcome-seen') !== '1';
  } catch {
    return false;
  }
}

export default function Preloader({ onComplete, language, copy }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(shouldShowWelcome);
  const [progress, setProgress] = useState(0);
  const finished = useRef(false);

  const skip = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem('portfolio-welcome-seen', '1');
    } catch {
      // Skipping should not depend on storage permissions.
    }
    setVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!visible || reduceMotion) {
      onComplete();
      return undefined;
    }

    let completionTimer = 0;
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      try {
        sessionStorage.setItem('portfolio-welcome-seen', '1');
      } catch {
        // The introduction remains skippable when storage is disabled.
      }
      setProgress(100);
      if (document.hidden) {
        setVisible(false);
        onComplete();
        return;
      }
      completionTimer = window.setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 100);
    };

    const startedAt = performance.now();
    const updateProgress = () => {
      const next = Math.min(((performance.now() - startedAt) / 1350) * 100, 100);
      setProgress(next);
      if (next >= 100) finish();
    };
    const onVisibilityChange = () => {
      if (document.hidden) finish();
    };

    const interval = window.setInterval(updateProgress, 24);
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (document.hidden) finish();
    else updateProgress();
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(completionTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [onComplete, reduceMotion, visible]);

  useEffect(() => {
    if (!visible || reduceMotion) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') skip();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onComplete, reduceMotion, visible]);

  return (
    <AnimatePresence>
      {visible && !reduceMotion && (
        <motion.div
          className="preloader"
          role="region"
          aria-label={copy.introLabel}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-2vh' }}
          transition={{ duration: 0.28, ease: [0.76, 0, 0.24, 1] }}
        >
          <button type="button" className="preloader-skip" onClick={skip}>
            {copy.introSkip}
          </button>
          <motion.div
            className="preloader-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <p className="preloader-kicker">{copy.introLabel}</p>
            <h1 className="preloader-name" dir="ltr" aria-label="Marco Milad">
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              >
                MARCO
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
              >
                MILAD
              </motion.span>
            </h1>
            <div
              className="preloader-progress"
              role="progressbar"
              aria-label={language === 'ar' ? 'تقدم تحميل المقدمة' : 'Introduction progress'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.floor(progress)}
            >
              <motion.span
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.14, ease: 'linear' }}
              />
            </div>
            <div className="preloader-meter" aria-live="polite">
              <span>{language === 'ar' ? 'جارٍ التحضير' : 'CREATING AN EXPERIENCE'}</span>
              <span>{Math.floor(progress).toString().padStart(2, '0')}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

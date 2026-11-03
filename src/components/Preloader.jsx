import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Hexagon, Zap } from 'lucide-react';

function Starfield({ reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const pointer = { x: -1000, y: -1000 };
    const stars = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    const count = window.matchMedia('(max-width: 700px)').matches ? 24 : 56;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const createStars = () => {
      stars.length = 0;
      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.35,
          drift: Math.random() * 0.28 + 0.04,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.82 ? 275 : 190,
        });
      }
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        const dx = star.x - pointer.x;
        const dy = star.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110 && distance > 0) {
          const force = (110 - distance) / 110;
          star.x += (dx / distance) * force * 0.8;
          star.y += (dy / distance) * force * 0.8;
        }
        if (!reducedMotion) {
          star.y -= star.drift;
          star.x += Math.sin(time * 0.00025 + star.phase) * 0.12;
        }
        if (star.y < -4) star.y = height + 4;
        if (star.x < -4) star.x = width + 4;
        if (star.x > width + 4) star.x = -4;
        const pulse = reducedMotion ? 0.55 : 0.35 + (Math.sin(time * 0.001 + star.phase) + 1) * 0.27;
        context.beginPath();
        context.fillStyle = `hsla(${star.hue}, 95%, 78%, ${pulse})`;
        context.shadowBlur = star.radius > 1 ? 12 : 0;
        context.shadowColor = star.hue === 190 ? '#00f2fe' : '#a855f7';
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    const movePointer = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const resetPointer = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    resize();
    createStars();
    draw();
    if (!reducedMotion) {
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('resize', createStars, { passive: true });
      window.addEventListener('pointermove', movePointer, { passive: true });
      window.addEventListener('pointerleave', resetPointer, { passive: true });
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', createStars);
      window.removeEventListener('pointermove', movePointer);
      window.removeEventListener('pointerleave', resetPointer);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="preloader-canvas" aria-hidden="true" />;
}

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
  const skipButtonRef = useRef(null);

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
      }, 160);
    };

    const startedAt = performance.now();
    const updateProgress = () => {
      const next = Math.min(((performance.now() - startedAt) / 2500) * 100, 100);
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
    const background = [...document.querySelectorAll('.site-header, #main, .site-footer')];
    const previousState = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute('aria-hidden'),
    }));
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    skipButtonRef.current?.focus();
    const trapFocus = (event) => {
      if (event.key === 'Escape') {
        skip();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        skipButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      previousState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
    };
  }, [onComplete, reduceMotion, visible]);

  return (
    <AnimatePresence>
      {visible && !reduceMotion && (
        <motion.div
          className="preloader"
          role="dialog"
          aria-modal="true"
          aria-label={copy.introLabel}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, y: '-8vh' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <Starfield reducedMotion={reduceMotion} />
          <button ref={skipButtonRef} type="button" className="preloader-skip" onClick={skip}>
            {copy.introSkip}
          </button>
          <motion.div
            className="preloader-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <motion.div
              className="preloader-logo"
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              <Hexagon size={92} strokeWidth={0.85} />
              <Zap size={34} strokeWidth={1.5} />
            </motion.div>
            <p className="preloader-kicker">{copy.introLabel}</p>
            <h1 className="preloader-name" dir="ltr">
              <span>MARCO</span> <b>MILAD</b>
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

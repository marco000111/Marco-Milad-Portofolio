import { useEffect, useMemo, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import ThreeNameScene from './ThreeNameScene.jsx';

function MagneticLink({ href, children, className }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22 });
  const springY = useSpring(y, { stiffness: 280, damping: 22 });

  const onPointerMove = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.13);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.13);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

export default function Hero({ content, ui, language }) {
  const words = useMemo(() => ui.headline.split(/\s+/), [ui.headline]);
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const inView = useInView(heroRef, { amount: 0.08 });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const portraitX = useSpring(useTransform(pointerX, [-1, 1], [7, -7]), { stiffness: 90, damping: 24 });
  const portraitY = useSpring(useTransform(pointerY, [-1, 1], [5, -5]), { stiffness: 90, damping: 24 });
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-2.4, 2.4]), { stiffness: 85, damping: 24 });
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [1.8, -1.8]), { stiffness: 85, damping: 24 });

  const movePortrait = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)),
      y: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)),
    };
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      pointerX.set(pointer.current.x);
      pointerY.set(pointer.current.y);
      heroRef.current?.style.setProperty('--depth-shift-x', `${pointer.current.x * -22}px`);
      heroRef.current?.style.setProperty('--depth-shift-y', `${pointer.current.y * -15}px`);
    });
  };
  const resetPortrait = () => {
    if (frame.current) window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    pointer.current = { x: 0, y: 0 };
    heroRef.current?.style.setProperty('--depth-shift-x', '0px');
    heroRef.current?.style.setProperty('--depth-shift-y', '0px');
    pointerX.set(0);
    pointerY.set(0);
  };

  useEffect(() => () => {
    if (frame.current) window.cancelAnimationFrame(frame.current);
  }, []);

  return (
    <motion.section
      ref={heroRef}
      id="home"
      layout="position"
      className={`hero-section page-shell${inView ? ' is-in-view' : ''}`}
      aria-labelledby="hero-heading"
      onPointerMove={movePortrait}
      onPointerLeave={resetPortrait}
    >
      <div className="hero-particles" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <i key={index} style={{ '--particle-index': index, '--particle-x': `${8 + index * 12}%`, '--particle-y': `${19 + (index % 4) * 16}%` }} />
        ))}
      </div>
      <div className="hero-depth-world" aria-hidden="true">
        <div className="hero-depth-backplane" />
        <div className="hero-depth-orbit hero-depth-orbit-a" />
        <div className="hero-depth-orbit hero-depth-orbit-b" />
        <i className="hero-depth-object hero-depth-object-a" />
        <i className="hero-depth-object hero-depth-object-b" />
        <i className="hero-depth-object hero-depth-object-c" />
        <i className="hero-depth-object hero-depth-object-d" />
      </div>
      <div className="hero-copy">
        <motion.p
          className="hero-identity"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.7 }}
        >
          <small>{ui.heroRole}</small>
        </motion.p>
        <motion.div
          className="availability"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.65 }}
        >
          <span className="availability-pulse" aria-hidden="true" />
          {ui.status}
        </motion.div>
        <motion.h1
          id="hero-heading"
          className="hero-name"
          dir="ltr"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ delay: 0.34, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ThreeNameScene variant="hero" />
        </motion.h1>
        <h2 className="hero-heading" aria-label={ui.headline}>
          {words.map((word, index) => (
            <motion.span
              className="hero-word-mask"
              key={`${word}-${index}`}
              initial={{ y: '110%', opacity: 0.3 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.38 + index * 0.045,
                duration: 0.75,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              aria-hidden="true"
            >
              <span
                className={
                  index >= Math.max(0, words.length - (language === 'ar' ? 3 : 2))
                    ? 'hero-word-accent'
                    : undefined
                }
              >
                {word}
              </span>
            </motion.span>
          ))}
        </h2>
        <motion.p
          className="hero-subheadline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.74, duration: 0.75 }}
        >
          {ui.subheadline}
        </motion.p>
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.92, duration: 0.7 }}
        >
          <MagneticLink href="#projects" className="button button-primary magnetic-button">
            {ui.viewProjects}
            <MoveUpRight size={17} aria-hidden="true" />
          </MagneticLink>
          <a href="#contact" className="button button-secondary">
            {ui.contactMe}
            {language === 'ar' ? (
              <ArrowRight size={17} aria-hidden="true" />
            ) : (
              <ArrowUpRight size={17} aria-hidden="true" />
            )}
          </a>
        </motion.div>
        <motion.div
          className="hero-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.7 }}
        >
          <span className="proof-line" />
          <span>{content.trust[0]}</span>
          <span className="proof-dot" />
          <span>{content.trust[1]}</span>
        </motion.div>
      </div>
      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, clipPath: 'inset(5% 0 0 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        transition={{ delay: 0.18, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="hero-portrait-stage"
          style={{ x: portraitX, y: portraitY, rotateX, rotateY, transformPerspective: 1100 }}
        >
          <img
            className="hero-portrait-echo"
            src="/assets/images/marco-milad-portrait.png"
            alt=""
            aria-hidden="true"
            width="1141"
            height="1378"
            decoding="async"
          />
          <motion.img
            className="hero-portrait"
            src="/assets/images/marco-milad-portrait.png"
            alt={
              language === 'ar'
                ? 'صورة سينمائية واقعية لماركو ميلاد بشعره المجعد ونظارته السوداء'
                : 'Photorealistic studio portrait of Marco Milad with curly hair and distinctive black sunglasses'
            }
            width="1141"
            height="1378"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-foreground-points" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </motion.div>
      </motion.div>
      <a href="#about" className="hero-scroll" aria-label={ui.scroll}>
        <span>{ui.scroll}</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </motion.section>
  );
}

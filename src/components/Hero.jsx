import { useMemo } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';

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
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const portraitX = useSpring(pointerX, { stiffness: 90, damping: 24 });
  const portraitY = useSpring(pointerY, { stiffness: 90, damping: 24 });

  const movePortrait = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 9);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 7);
  };
  const resetPortrait = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.section id="home" layout="position" className="hero-section page-shell" aria-labelledby="hero-heading">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span>MARCO</span> <b>MILAD</b>
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
        onPointerMove={movePortrait}
        onPointerLeave={resetPortrait}
      >
        <div className="hero-portrait-stage">
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
            style={{ x: portraitX, y: portraitY }}
          />
        </div>
      </motion.div>
      <a href="#about" className="hero-scroll" aria-label={ui.scroll}>
        <span>{ui.scroll}</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </motion.section>
  );
}

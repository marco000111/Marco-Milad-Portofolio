import { useMemo } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import AvatarCard from './AvatarCard.jsx';

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

  return (
    <section id="home" className="hero-section page-shell" aria-labelledby="hero-heading">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-a" />
        <div className="hero-glow hero-glow-b" />
        <div className="hero-coordinate" dir="ltr">MM / 01—2026</div>
      </div>
      <div className="hero-copy">
        <motion.p
          className="hero-identity"
          dir="ltr"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.7 }}
        >
          <span>MARCO <b>MILAD</b></span>
          <i>·</i>
          <small>FRONT-END DEVELOPER</small>
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
        <h1 id="hero-heading" className="hero-heading" aria-label={ui.headline}>
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
        </h1>
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
        initial={{ opacity: 0, x: language === 'ar' ? -26 : 26, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.52, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        <AvatarCard language={language} status={ui.status} />
      </motion.div>
      <a href="#about" className="hero-scroll" aria-label={ui.scroll}>
        <span>{ui.scroll}</span>
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

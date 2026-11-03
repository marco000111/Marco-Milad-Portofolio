import { motion, useReducedMotion, useScroll } from 'framer-motion';

export default function ScrollProgress({ language }) {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`scroll-progress${reducedMotion ? ' is-reduced' : ''}`}
      style={{ scaleX: scrollYProgress, transformOrigin: language === 'ar' ? 'right center' : 'left center' }}
      aria-hidden="true"
    />
  );
}

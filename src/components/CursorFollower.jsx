import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export default function CursorFollower() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const point = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 540, damping: 38, mass: 0.28 });
  const springY = useSpring(y, { stiffness: 540, damping: 38, mass: 0.28 });

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return undefined;
    document.body.classList.add('has-cursor-follower');
    const move = (event) => {
      point.current = { x: event.clientX, y: event.clientY };
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        x.set(point.current.x);
        y.set(point.current.y);
        const target = document.elementFromPoint(point.current.x, point.current.y);
        setInteractive(Boolean(target?.closest('a, button, input, textarea, select, [role="button"]')));
        setVisible(true);
      });
    };
    const leave = () => { setVisible(false); setPressed(false); };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    return () => {
      document.body.classList.remove('has-cursor-follower');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [enabled, reducedMotion, x, y]);

  if (!enabled || reducedMotion) return null;
  return (
    <motion.span
      className={`cursor-follower${visible ? ' is-visible' : ''}${interactive ? ' is-interactive' : ''}${pressed ? ' is-pressed' : ''}`}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <i />
    </motion.span>
  );
}

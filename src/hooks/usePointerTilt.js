import { useCallback, useEffect, useRef } from 'react';

export default function usePointerTilt() {
  const frame = useRef(0);
  const target = useRef(null);
  const point = useRef({ x: 0, y: 0 });

  const reset = useCallback(() => {
    if (frame.current) window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (target.current) {
      target.current.style.setProperty('--pointer-tilt-x', '0deg');
      target.current.style.setProperty('--pointer-tilt-y', '0deg');
      target.current.style.setProperty('--pointer-light-x', '50%');
      target.current.style.setProperty('--pointer-light-y', '50%');
      target.current.classList.remove('is-tilting');
    }
    target.current = null;
  }, []);

  const onPointerMove = useCallback((event) => {
    if (event.pointerType !== 'mouse') return;
    target.current = event.currentTarget;
    point.current = { x: event.clientX, y: event.clientY };
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const element = target.current;
      if (!element?.isConnected) return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (point.current.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (point.current.y - bounds.top) / bounds.height));
      element.style.setProperty('--pointer-tilt-y', `${(x - 0.5) * 7}deg`);
      element.style.setProperty('--pointer-tilt-x', `${(0.5 - y) * 6}deg`);
      element.style.setProperty('--pointer-light-x', `${x * 100}%`);
      element.style.setProperty('--pointer-light-y', `${y * 100}%`);
      element.classList.add('is-tilting');
    });
  }, []);

  useEffect(() => reset, [reset]);
  return { onPointerMove, onPointerLeave: reset };
}

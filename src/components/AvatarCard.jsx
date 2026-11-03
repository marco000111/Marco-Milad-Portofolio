import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';

function PortraitIllustration() {
  return (
    <svg
      className="avatar-illustration"
      viewBox="0 0 360 410"
      role="img"
      aria-labelledby="avatar-title"
    >
      <title id="avatar-title">Stylized illustrated developer portrait</title>
      <defs>
        <linearGradient id="portrait-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d1733" />
          <stop offset="1" stopColor="#071016" />
        </linearGradient>
        <linearGradient id="portrait-jacket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25395d" />
          <stop offset="1" stopColor="#111828" />
        </linearGradient>
        <linearGradient id="portrait-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4cba3" />
          <stop offset="1" stopColor="#d99d78" />
        </linearGradient>
        <radialGradient id="portrait-light" cx="50%" cy="28%" r="70%">
          <stop offset="0" stopColor="#00f2fe" stopOpacity=".24" />
          <stop offset="1" stopColor="#00f2fe" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="410" rx="22" fill="url(#portrait-bg)" />
      <rect width="360" height="410" rx="22" fill="url(#portrait-light)" />
      <path d="M37 337a144 144 0 0 1 286 0v73H37z" fill="#101c31" stroke="#1b3658" />
      <path d="M73 366c12-70 54-102 107-102s95 32 107 102v44H73z" fill="url(#portrait-jacket)" />
      <path d="m151 267 29 38 29-38 20 17-28 72h-42l-28-72z" fill="#e2ecf6" />
      <path d="m180 305 16 22-16 60-16-60z" fill="#19bfd9" />
      <path d="M144 213v55c0 20 16 36 36 36s36-16 36-36v-55z" fill="url(#portrait-skin)" />
      <path d="M129 147c0-46 23-76 51-76s51 30 51 76v40c0 42-22 70-51 70s-51-28-51-70z" fill="url(#portrait-skin)" />
      <path d="M126 162c-9-53 2-103 52-103 45 0 61 34 56 94-13-3-26-16-34-37-22 17-44 24-74 24z" fill="#172135" />
      <path d="M134 165c-9 10-13 25-8 43-12-5-21-19-19-34 2-13 11-22 23-23z" fill="#dcaa8c" />
      <path d="M226 165c9 10 13 25 8 43 12-5 21-19 19-34-2-13-11-22-23-23z" fill="#d89f7f" />
      <path d="M151 166c6-5 15-6 22-2" fill="none" stroke="#5b3e39" strokeWidth="4" strokeLinecap="round" />
      <path d="M188 164c7-4 16-3 21 2" fill="none" stroke="#5b3e39" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="164" cy="177" rx="4" ry="3" fill="#1c2430" />
      <ellipse cx="197" cy="177" rx="4" ry="3" fill="#1c2430" />
      <path d="M180 179c-1 11-6 20-10 24 6 4 14 4 20 0" fill="none" stroke="#bd8065" strokeWidth="3" strokeLinecap="round" />
      <path d="M162 219c11 9 25 9 36 0" fill="none" stroke="#873f46" strokeWidth="4" strokeLinecap="round" />
      <path d="M130 202c5 32 24 49 50 49s46-17 50-49c-2 40-19 75-50 75s-48-35-50-75z" fill="#292631" />
      <circle cx="35" cy="59" r="2" fill="#00f2fe" />
      <circle cx="323" cy="104" r="2" fill="#a855f7" />
      <path d="M35 85h48M277 320h48" stroke="#6b8ebd" strokeOpacity=".35" />
    </svg>
  );
}

export default function AvatarCard({ language, status }) {
  const reduceMotion = useReducedMotion();
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches);
  const [shineActive, setShineActive] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { amount: 0.1 });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.55 });
  const springY = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.55 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setTiltEnabled(media.matches && !reduceMotion);
    const updateCompact = () => setIsMobile(compact.matches);
    update();
    updateCompact();
    media.addEventListener?.('change', update);
    compact.addEventListener?.('change', updateCompact);
    return () => {
      media.removeEventListener?.('change', update);
      compact.removeEventListener?.('change', updateCompact);
    };
  }, [reduceMotion]);

  const onPointerMove = (event) => {
    if (!tiltEnabled) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };
  const shouldFloat = !reduceMotion && isInView;
  const useMobileFloat = isMobile && shouldFloat;

  return (
    <div className="id-scene" aria-label={language === 'ar' ? 'بطاقة تعريف رقمية' : 'Digital developer ID card'}>
      <div className="lanyard-loop" aria-hidden="true" />
      <div className="lanyard-strap" aria-hidden="true">
        <span>MM · DIGITAL CRAFT</span>
      </div>
      <div className={`id-card-float${useMobileFloat ? ' is-mobile-float' : ''}`}>
        <motion.article
          ref={cardRef}
          className="id-card"
          style={tiltEnabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
          animate={{ y: !isMobile && shouldFloat ? [-8, 8] : 0 }}
          transition={{
            y: !isMobile && shouldFloat
              ? { duration: 4.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
              : { duration: 0.24, ease: 'easeOut' },
          }}
          onPointerMove={onPointerMove}
          onPointerLeave={resetPointer}
          onHoverStart={() => setShineActive(true)}
          onHoverEnd={() => setShineActive(false)}
          whileHover={tiltEnabled ? { scale: 1.012 } : undefined}
        >
          <div className="id-card-top">
            <span className="id-card-label" dir="ltr">PERSONAL DIGITAL ID</span>
            <span className="id-card-signal" aria-hidden="true"><i /> ONLINE</span>
          </div>
          <div className="portrait-frame">
            <PortraitIllustration />
            <motion.span
              className="portrait-shine"
              aria-hidden="true"
              initial={{ x: '-140%' }}
              animate={{ x: shineActive ? '140%' : '-140%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <span className="portrait-index" dir="ltr">FIG. 001 / MM</span>
          </div>
          <div className="id-card-info">
            <div>
              <span className="id-card-eyebrow">{language === 'ar' ? 'المصمم والمطور' : 'DESIGNER & DEVELOPER'}</span>
              <h2 dir="ltr">MARCO <b>MILAD</b></h2>
              <p>{status}</p>
            </div>
            <span className="id-verified" aria-label={language === 'ar' ? 'معلومات شخصية' : 'Personal portfolio'}>
              <BadgeCheck size={19} />
            </span>
          </div>
          <a className="id-card-link" href="#about" aria-label={language === 'ar' ? 'اعرف المزيد عن ماركو' : 'Learn more about Marco'}>
            <span>01 — 05</span><ArrowUpRight size={17} />
          </a>
        </motion.article>
      </div>
      <div className="id-orbit orbit-one" aria-hidden="true" />
      <div className="id-orbit orbit-two" aria-hidden="true" />
      <span className="id-coordinate coordinate-top" dir="ltr">30°02′N / 31°14′E</span>
      <span className="id-coordinate coordinate-bottom" dir="ltr">CREATIVE SYSTEMS · MM—01</span>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';

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
            <img
              className="avatar-illustration"
              src="/assets/images/marco-cyberpunk-avatar.jpeg"
              alt={language === 'ar' ? 'صورة ماركو الرمزية بأسلوب سايبربانك' : 'Marco’s 3D cyberpunk avatar with curly hair and neon-lit sunglasses'}
              width="768"
              height="1024"
              fetchPriority="high"
              decoding="async"
            />
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
              <span className="id-card-eyebrow">{language === 'ar' ? 'مطور ومصمم رقمي' : 'FRONT-END DEVELOPER & GRAPHIC DESIGNER'}</span>
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

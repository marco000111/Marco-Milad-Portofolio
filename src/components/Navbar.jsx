import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2, FileText, House, Menu, PanelsTopLeft, Send, UserRound, X } from 'lucide-react';

const sectionIds = ['home', 'about', 'resume', 'skills', 'projects', 'contact'];
const sectionIcons = [House, UserRound, FileText, Code2, PanelsTopLeft, Send];
const visualOrder = [0, 1, 4, 3, 2, 5];

export default function Navbar({ copy, language, onLanguageChange }) {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!('IntersectionObserver' in window) || sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.45, 0.7] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main">
        {language === 'ar' ? 'تخطّ إلى المحتوى' : 'Skip to content'}
      </a>
      <header className="site-header">
        <a className="brand-lockup" href="#home" aria-label="Marco Milad home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            M<span>.</span>
          </span>
          <span className="brand-name" dir="ltr">
            MARCO <b>MILAD</b>
          </span>
        </a>
        <nav className="desktop-nav" aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
          {visualOrder.map((sourceIndex, index) => {
            const label = copy.nav[sourceIndex];
            const id = sectionIds[sourceIndex];
            const Icon = sectionIcons[sourceIndex];
            return (
              <a
                href={`#${id}`}
                key={id}
                className={active === id ? 'nav-link is-active' : 'nav-link'}
                aria-current={active === id ? 'location' : undefined}
                aria-label={label}
                title={label}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span className="nav-tooltip" aria-hidden="true">{label}</span>
                {active === id && (
                  <motion.span
                    className="nav-indicator"
                    layoutId="active-nav"
                    transition={{ type: 'spring', stiffness: 440, damping: 36 }}
                  />
                )}
              </a>
            );
          })}
        </nav>
        <div className="nav-actions">
          <div
            className="language-switcher"
            role="group"
            aria-label={language === 'ar' ? 'اختيار اللغة' : 'Choose language'}
            dir="ltr"
          >
            <button type="button" aria-pressed={language === 'en'} onClick={() => onLanguageChange('en')}>EN</button>
            <span aria-hidden="true">|</span>
            <button type="button" aria-pressed={language === 'ar'} onClick={() => onLanguageChange('ar')}>عربي</button>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? copy.close : language === 'ar' ? 'فتح القائمة' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.48, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-nav-links">
              {visualOrder.map((sourceIndex, index) => {
                const label = copy.nav[sourceIndex];
                const Icon = sectionIcons[sourceIndex];
                return (
                  <motion.a
                    href={`#${sectionIds[sourceIndex]}`}
                    key={sectionIds[sourceIndex]}
                    onClick={closeMenu}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.055 }}
                  >
                    <Icon size={20} aria-hidden="true" />
                    <span className="mobile-nav-number">0{index + 1}</span>
                    {label}
                  </motion.a>
                );
              })}
            </div>
            <span className="mobile-nav-caption" dir="ltr">
              MARCO MILAD · FRONT-END DEVELOPER & GRAPHIC DESIGNER
            </span>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

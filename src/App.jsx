import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import CursorFollower from './components/CursorFollower.jsx';
import CinematicIntro from './components/CinematicIntro.jsx';
import DeferredAnalytics from './components/DeferredAnalytics.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import ManifestoScene from './components/ManifestoScene.jsx';
import Navbar from './components/Navbar.jsx';
import Projects from './components/Projects.jsx';
import Resume from './components/Resume.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import ScrollDirector from './components/ScrollDirector.jsx';
import Skills from './components/Skills.jsx';
import { getPortfolio } from './data/portfolio.js';
import useSmoothScroll from './hooks/useSmoothScroll.js';

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem('portfolio-language');
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // The document's language still provides a reliable fallback.
  }
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const portfolio = useMemo(() => getPortfolio(language), [language]);
  const { content, ui, projects, skills, skillCategories } = portfolio;

  useSmoothScroll();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = content.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', content.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', content.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', content.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', content.description);
    try {
      localStorage.setItem('portfolio-language', language);
    } catch {
      // The selected language remains active for the current page view.
    }
    window.dispatchEvent(new Event('portfolio:languagechange'));
  }, [content.description, content.title, language]);

  const selectLanguage = useCallback((nextLanguage) => {
    if (nextLanguage === 'en' || nextLanguage === 'ar') setLanguage(nextLanguage);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
    <LayoutGroup id="portfolio-layout">
    <div className="app-shell min-h-screen bg-space text-ink">
      <Navbar copy={ui} language={language} onLanguageChange={selectLanguage} />
      <ScrollProgress language={language} />
      <motion.main
        id="main"
        layout="position"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
      >
        <Hero content={content} ui={ui} language={language} />
        <Projects projects={projects} ui={ui} language={language} />
        <About content={content} ui={ui} language={language} />
        <ManifestoScene language={language} />
        <Skills skills={skills} categories={skillCategories} ui={ui} language={language} />
        <Resume language={language} />
        <Contact ui={ui} language={language} />
      </motion.main>
      <Footer copy={content} ui={ui} language={language} />
      <ScrollDirector />
      <CursorFollower />
      <CinematicIntro language={language} copy={ui} />
      <DeferredAnalytics />
    </div>
    </LayoutGroup>
    </MotionConfig>
  );
}

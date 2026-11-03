import { ArrowUp, ArrowUpRight, Heart } from 'lucide-react';

export default function Footer({ copy, ui, language }) {
  return (
    <footer className="site-footer page-shell">
      <a className="footer-brand" href="#home" aria-label="Marco Milad home">
        <span className="brand-mark" aria-hidden="true">M<span>.</span></span>
        <span dir="ltr">MARCO <b>MILAD</b></span>
      </a>
      <p className="footer-note">
        {ui.footer}
        <Heart size={13} aria-hidden="true" />
      </p>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Marco Milad</span>
        <a href="#projects">{ui.nav[4]} <ArrowUpRight size={13} /></a>
        <a className="back-top" href="#home" aria-label={ui.backToTop}>
          <ArrowUp size={16} />
        </a>
      </div>
      <span className="footer-watermark" aria-hidden="true" dir="ltr">MM</span>
    </footer>
  );
}

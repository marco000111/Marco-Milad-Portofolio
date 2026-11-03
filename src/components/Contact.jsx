import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Github, Instagram, Mail, MessageCircle, Send, Sparkles } from 'lucide-react';

const socialLinks = [
  { key: 'github', href: 'https://github.com/marco000111', value: 'github.com/marco000111', Icon: Github },
  { key: 'instagram', href: 'https://instagram.com/designsby_marco_', value: '@designsby_marco_', Icon: Instagram },
  { key: 'email', href: 'mailto:marcomilad707@gmail.com', value: 'marcomilad707@gmail.com', Icon: Mail },
  { key: 'whatsapp', href: 'https://wa.me/201020599210', value: '+20 102 059 9210', Icon: MessageCircle },
];

export default function Contact({ ui, language }) {
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef(0);

  const showToast = (message) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 5000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    if (!name || !email || !message) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(ui.invalidEmail);
      form.elements.email.focus();
      return;
    }

    setSubmitting(true);
    const body = language === 'ar'
      ? `الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\n${message}`
      : `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const destination = `https://wa.me/201020599210?text=${encodeURIComponent(body)}`;
    const newWindow = window.open(destination, '_blank');
    if (newWindow) {
      newWindow.opener = null;
      showToast(ui.success);
    } else {
      const emailUrl = `mailto:marcomilad707@gmail.com?subject=${encodeURIComponent(`Portfolio enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
      window.location.assign(emailUrl);
      showToast(ui.popupFallback);
    }
    form.reset();
    window.setTimeout(() => setSubmitting(false), 350);
  };

  return (
    <section id="contact" className="contact-section page-shell section-block gsap-reveal">
      <div className="contact-heading">
        <p className="section-kicker"><span>04</span> / {ui.contactKicker}</p>
        <h2>{language === 'ar' ? <>لديك فكرة؟ <em>لنصنعها معًا.</em></> : <>Have an idea? <em>Let’s make it real.</em></>}</h2>
        <p>{ui.contactIntro}</p>
        <div className="contact-response">
          <span className="availability-pulse" aria-hidden="true" />
          {language === 'ar' ? 'متاح للرد على استفسارات المشروعات' : 'Open to thoughtful project enquiries'}
        </div>
        <div className="social-grid">
          {socialLinks.map(({ key, href, value, Icon }, index) => (
            <motion.a
              className="social-card glass-panel"
              href={href}
              key={key}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <span className="social-icon"><Icon size={18} aria-hidden="true" /></span>
              <span className="social-copy">
                <span>{ui.socials[index]}</span>
                <b dir="ltr">{value}</b>
              </span>
              <ArrowUpRight size={15} className="social-arrow" aria-hidden="true" />
            </motion.a>
          ))}
        </div>
      </div>
      <div className="contact-form-wrap glass-panel">
        <div className="form-topline">
          <div className="form-mark"><Sparkles size={16} aria-hidden="true" /></div>
          <span>{language === 'ar' ? 'نموذج تواصل مباشر' : 'DIRECT PROJECT ENQUIRY'}</span>
          <span className="form-availability"><i /> {language === 'ar' ? 'متصل' : 'ONLINE'}</span>
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <label className="floating-field">
            <span>{ui.name}</span>
            <input name="name" autoComplete="name" placeholder=" " minLength={2} maxLength={100} required />
            <i aria-hidden="true" />
          </label>
          <label className="floating-field">
            <span>{ui.email}</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder=" "
              maxLength={254}
              required
              onInvalid={(event) => {
                if (event.currentTarget.validity.typeMismatch) {
                  event.currentTarget.setCustomValidity(ui.invalidEmail);
                }
              }}
              onInput={(event) => event.currentTarget.setCustomValidity('')}
            />
            <i aria-hidden="true" />
          </label>
          <label className="floating-field floating-textarea">
            <span>{ui.message}</span>
            <textarea name="message" rows="4" placeholder=" " minLength={10} maxLength={2000} required />
            <i aria-hidden="true" />
          </label>
          <div className="form-actions">
            <button type="submit" className="button button-primary submit-button" disabled={submitting}>
              <Send size={16} aria-hidden="true" />
              {submitting ? ui.sending : ui.send}
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
            <span className="form-note"><Check size={13} aria-hidden="true" />{ui.formNote}</span>
          </div>
        </form>
        <AnimatePresence>
          {toast && (
            <motion.div
              className="contact-toast"
              role="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 7 }}
            >
              <Check size={17} />{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

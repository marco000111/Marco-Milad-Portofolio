import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { resumeFacts } from '../data/portfolio.js';

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export async function createResumePdf() {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Marco Milad - Front-end Developer');
  pdf.setAuthor('Marco Milad');
  pdf.setSubject('Front-end development portfolio and contact information');
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const accent = rgb(0, 0.72, 0.83);
  const ink = rgb(0.08, 0.1, 0.15);
  const muted = rgb(0.33, 0.39, 0.48);
  const margin = 52;
  const width = page.getWidth() - margin * 2;
  let y = page.getHeight() - 64;

  const write = (text, { font = regular, size = 10, color = ink, gap = 16 } = {}) => {
    page.drawText(text, { x: margin, y, font, size, color, maxWidth: width });
    y -= gap;
  };

  const paragraph = (text, { size = 10, color = muted, lineHeight = 15 } = {}) => {
    wrapText(text, regular, size, width).forEach((line) => {
      page.drawText(line, { x: margin, y, font: regular, size, color });
      y -= lineHeight;
    });
    y -= 3;
  };

  const section = (title) => {
    y -= 7;
    page.drawText(title.toUpperCase(), { x: margin, y, font: bold, size: 9, color: accent });
    y -= 20;
  };

  page.drawText(resumeFacts.name.toUpperCase(), {
    x: margin,
    y,
    font: bold,
    size: 28,
    color: ink,
  });
  y -= 24;
  write(resumeFacts.role, { font: bold, size: 12, color: muted, gap: 23 });
  paragraph(
    `${resumeFacts.location}  |  ${resumeFacts.email}  |  ${resumeFacts.phone}`,
    { size: 9 },
  );
  paragraph(`${resumeFacts.github}  |  ${resumeFacts.instagram}`, { size: 9 });

  section('Profile');
  paragraph(resumeFacts.summary);

  section('Skills');
  paragraph(resumeFacts.skills.join('  |  '));

  section('Selected website concepts');
  paragraph(resumeFacts.websites.join('  |  '));
  paragraph(
    'Bilingual business websites featuring restaurant reservations, clinic appointment requests, and a searchable retail catalog.',
  );

  section('Live web applications');
  paragraph(resumeFacts.applications.join('  |  '));
  paragraph(
    'Live links and interface previews are available at marcomiladportofolio.vercel.app.',
  );

  section('Services');
  paragraph(
    'Responsive business websites, landing pages, storefront interfaces, Figma-to-code implementation, and front-end improvements.',
  );
  page.drawLine({
    start: { x: margin, y: 42 },
    end: { x: page.getWidth() - margin, y: 42 },
    thickness: 0.75,
    color: rgb(0.83, 0.87, 0.91),
  });
  page.drawText('Marco Milad  |  Front-end development  |  Egypt', {
    x: margin,
    y: 28,
    font: regular,
    size: 8,
    color: muted,
  });

  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

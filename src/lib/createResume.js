import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { resumeFacts } from '../data/portfolio.js';

const colors = {
  background: rgb(0.025, 0.035, 0.065),
  surface: rgb(0.055, 0.075, 0.12),
  white: rgb(0.94, 0.96, 0.99),
  text: rgb(0.72, 0.78, 0.87),
  muted: rgb(0.43, 0.51, 0.63),
  cyan: rgb(0, 0.85, 0.94),
  blue: rgb(0.31, 0.63, 0.98),
  line: rgb(0.16, 0.22, 0.32),
};

function wrapText(text, font, size, maxWidth) {
  const lines = [];
  let line = '';

  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function createResumePdf() {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Marco Milad - Front-end Developer & Graphic Designer');
  pdf.setAuthor(resumeFacts.name);
  pdf.setSubject('Project-led front-end development and graphic design resume');
  const page = pdf.addPage([612, 792]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const left = 44;
  const right = page.getWidth() - left;
  const contentWidth = right - left;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: colors.background,
  });
  page.drawRectangle({
    x: 0,
    y: 585,
    width: page.getWidth(),
    height: 207,
    color: colors.surface,
  });
  page.drawRectangle({
    x: 0,
    y: 583,
    width: page.getWidth(),
    height: 2,
    color: colors.cyan,
  });

  page.drawText(resumeFacts.name.toUpperCase(), {
    x: left,
    y: 716,
    font: bold,
    size: 29,
    color: colors.white,
  });
  page.drawText(resumeFacts.role.toUpperCase(), {
    x: left,
    y: 688,
    font: bold,
    size: 10,
    color: colors.cyan,
    characterSpacing: 0.7,
  });
  page.drawText(`${resumeFacts.location}  |  ${resumeFacts.email}  |  ${resumeFacts.phone}`, {
    x: left,
    y: 658,
    font: regular,
    size: 9,
    color: colors.text,
  });
  page.drawText(`${resumeFacts.github}  |  ${resumeFacts.instagram}`, {
    x: left,
    y: 641,
    font: regular,
    size: 9,
    color: colors.muted,
  });
  page.drawText('PROJECT-LED EXPERIENCE', {
    x: right - bold.widthOfTextAtSize('PROJECT-LED EXPERIENCE', 8),
    y: 735,
    font: bold,
    size: 8,
    color: colors.blue,
    characterSpacing: 0.7,
  });
  page.drawText('MM  /  01', {
    x: right - bold.widthOfTextAtSize('MM  /  01', 8),
    y: 718,
    font: bold,
    size: 8,
    color: colors.muted,
  });

  const section = (label, y) => {
    page.drawText(label, {
      x: left,
      y,
      font: bold,
      size: 8,
      color: colors.cyan,
      characterSpacing: 1.1,
    });
    page.drawLine({
      start: { x: left + 140, y: y + 3 },
      end: { x: right, y: y + 3 },
      thickness: 0.6,
      color: colors.line,
    });
  };

  const paragraph = (text, x, y, maxWidth, size = 9, lineHeight = 13) => {
    const lines = wrapText(text, regular, size, maxWidth);
    lines.forEach((line, index) => {
      page.drawText(line, {
        x,
        y: y - index * lineHeight,
        font: regular,
        size,
        color: colors.text,
      });
    });
    return y - lines.length * lineHeight;
  };

  section('PROFILE', 559);
  let cursor = paragraph(resumeFacts.summary, left, 540, contentWidth, 9.2, 13) - 8;

  section('SELECTED PROJECTS', cursor);
  cursor -= 19;

  const milestones = [
    {
      title: 'Business website concepts',
      description: 'Responsive, bilingual experiences for restaurant hospitality, dental care, and retail.',
      highlights: resumeFacts.websites,
    },
    {
      title: 'Live web applications',
      description: 'Browser-based products focused on daily routines, task planning, and workspace organization.',
      highlights: resumeFacts.applications,
    },
    {
      title: 'Front-end development & graphic design',
      description: 'Practical UI work using modern web technologies, thoughtful visual systems, and clean implementation.',
      highlights: resumeFacts.skills.slice(0, 6),
    },
  ];

  milestones.forEach((milestone, index) => {
    const nodeY = cursor - 2;
    if (index < milestones.length - 1) {
      page.drawLine({
        start: { x: left + 4, y: nodeY - 5 },
        end: { x: left + 4, y: nodeY - 62 },
        thickness: 1,
        color: colors.line,
      });
    }
    page.drawCircle({
      x: left + 4,
      y: nodeY,
      size: 3.2,
      color: index === 1 ? colors.blue : colors.cyan,
    });
    page.drawText(`0${index + 1}  /  ${milestone.title}`, {
      x: left + 18,
      y: cursor,
      font: bold,
      size: 10,
      color: colors.white,
    });
    const endDescription = paragraph(milestone.description, left + 18, cursor - 15, contentWidth - 18, 8.6, 12);
    const highlightText = milestone.highlights.join('   ·   ');
    const endHighlights = paragraph(highlightText, left + 18, endDescription - 2, contentWidth - 18, 7.8, 11);
    cursor = endHighlights - 17;
  });

  section('TECHNOLOGY TOOLKIT', cursor);
  cursor = paragraph(resumeFacts.skills.join('  ·  '), left, cursor - 18, contentWidth, 8.5, 12) - 10;

  page.drawLine({
    start: { x: left, y: 43 },
    end: { x: right, y: 43 },
    thickness: 0.7,
    color: colors.line,
  });
  page.drawText('MARCO MILAD  ·  FRONT-END DEVELOPMENT  ·  EGYPT', {
    x: left,
    y: 28,
    font: bold,
    size: 7,
    color: colors.muted,
    characterSpacing: 0.5,
  });
  page.drawText('01 / 01', {
    x: right - bold.widthOfTextAtSize('01 / 01', 7),
    y: 28,
    font: bold,
    size: 7,
    color: colors.cyan,
  });

  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

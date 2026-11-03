import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { resumeFacts } from '../data/portfolio.js';

function wrapText(text, font, size, maxWidth) {
  const lines = [];
  let line = '';

  text.split(/\s+/).forEach((word) => {
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
  pdf.setTitle('Marco Milad - Front-end Developer & Graphic Designer');
  pdf.setAuthor(resumeFacts.name);
  pdf.setSubject('Selected front-end projects, skills, and contact information');

  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const palette = {
    background: rgb(0.025, 0.035, 0.06),
    sidebar: rgb(0.045, 0.065, 0.105),
    surface: rgb(0.065, 0.09, 0.14),
    surfaceBorder: rgb(0.14, 0.2, 0.29),
    white: rgb(0.94, 0.97, 1),
    muted: rgb(0.61, 0.68, 0.78),
    dim: rgb(0.38, 0.47, 0.6),
    cyan: rgb(0, 0.84, 0.93),
    blue: rgb(0.25, 0.55, 0.98),
  };
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const sidebarWidth = 178;
  const mainX = 210;
  const mainWidth = pageWidth - mainX - 28;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: palette.background,
  });
  page.drawRectangle({
    x: 0,
    y: 0,
    width: sidebarWidth,
    height: pageHeight,
    color: palette.sidebar,
  });
  page.drawRectangle({
    x: 0,
    y: pageHeight - 5,
    width: pageWidth,
    height: 5,
    color: palette.cyan,
  });
  page.drawRectangle({
    x: sidebarWidth - 1,
    y: 0,
    width: 1,
    height: pageHeight - 5,
    color: palette.surfaceBorder,
  });

  const drawText = (text, x, y, { font = regular, size = 9, color = palette.white } = {}) => {
    page.drawText(text, { x, y, font, size, color });
  };

  const drawWrapped = (text, x, y, maxWidth, { font = regular, size = 9, color = palette.muted, lineHeight = 13 } = {}) => {
    const lines = wrapText(text, font, size, maxWidth);
    lines.forEach((line, index) => drawText(line, x, y - index * lineHeight, { font, size, color }));
    return y - lines.length * lineHeight;
  };

  const drawSectionTitle = (text, y) => {
    drawText(text.toUpperCase(), mainX, y, { font: bold, size: 9, color: palette.cyan });
    page.drawRectangle({
      x: mainX,
      y: y - 8,
      width: 35,
      height: 1,
      color: palette.blue,
    });
    return y - 24;
  };

  drawText('MARCO', 25, 780, { font: bold, size: 24, color: palette.white });
  drawText('MILAD', 25, 752, { font: bold, size: 24, color: palette.cyan });
  drawWrapped(resumeFacts.role, 26, 731, sidebarWidth - 50, {
    font: bold,
    size: 8.5,
    color: palette.muted,
    lineHeight: 12,
  });

  let sidebarY = 665;
  drawText('CONTACT', 26, sidebarY, { font: bold, size: 8, color: palette.cyan });
  sidebarY -= 21;
  [
    resumeFacts.location,
    resumeFacts.email,
    resumeFacts.phone,
    resumeFacts.github,
    resumeFacts.instagram,
  ].forEach((item) => {
    sidebarY = drawWrapped(item, 26, sidebarY, sidebarWidth - 50, {
      size: 7.5,
      color: palette.muted,
      lineHeight: 11,
    }) - 7;
  });

  sidebarY -= 14;
  drawText('SKILLS', 26, sidebarY, { font: bold, size: 8, color: palette.cyan });
  sidebarY -= 20;
  resumeFacts.skills.forEach((skill) => {
    page.drawEllipse({
      x: 29,
      y: sidebarY + 2,
      xScale: 2,
      yScale: 2,
      color: palette.cyan,
    });
    drawText(skill, 38, sidebarY, { size: 8, color: palette.white });
    sidebarY -= 16;
  });

  page.drawRectangle({
    x: 25,
    y: 54,
    width: sidebarWidth - 50,
    height: 1,
    color: palette.surfaceBorder,
  });
  drawText('BASED IN', 26, 39, { font: bold, size: 7, color: palette.dim });
  drawText(resumeFacts.location.toUpperCase(), 26, 27, {
    font: bold,
    size: 8,
    color: palette.muted,
  });

  drawText('FRONT-END DEVELOPER', mainX, 778, {
    font: bold,
    size: 8,
    color: palette.muted,
  });
  drawText('Selected work & capabilities', mainX, 750, {
    font: bold,
    size: 19,
    color: palette.white,
  });
  let y = drawSectionTitle('Profile', 706);
  y = drawWrapped(resumeFacts.summary, mainX, y, mainWidth, {
    size: 9,
    color: palette.muted,
    lineHeight: 14,
  }) - 15;

  y = drawSectionTitle('Selected project journey', y);
  const projects = [
    {
      title: 'Business website concepts',
      description: resumeFacts.websites.join('  |  '),
    },
    {
      title: 'Live web applications',
      description: resumeFacts.applications.join('  |  '),
    },
    {
      title: 'Interface & deployment toolkit',
      description: 'React  |  JavaScript  |  HTML5  |  CSS3  |  Tailwind CSS  |  Git  |  Figma  |  Vercel',
    },
  ];

  projects.forEach((item, index) => {
    const cardHeight = 66;
    const cardY = y - cardHeight + 4;
    page.drawRectangle({
      x: mainX + 14,
      y: cardY,
      width: mainWidth - 14,
      height: cardHeight,
      color: palette.surface,
      borderColor: palette.surfaceBorder,
      borderWidth: 0.6,
    });
    if (index < projects.length - 1) {
      page.drawLine({
        start: { x: mainX + 5, y: cardY + 3 },
        end: { x: mainX + 5, y: cardY + cardHeight - 4 },
        thickness: 1,
        color: palette.surfaceBorder,
      });
    }
    page.drawEllipse({
      x: mainX + 5,
      y: cardY + cardHeight - 13,
      xScale: 4,
      yScale: 4,
      color: palette.cyan,
      borderColor: palette.background,
      borderWidth: 1,
    });
    drawText(item.title, mainX + 27, cardY + cardHeight - 20, {
      font: bold,
      size: 9,
      color: palette.white,
    });
    drawWrapped(item.description, mainX + 27, cardY + cardHeight - 39, mainWidth - 43, {
      size: 7.8,
      color: palette.muted,
      lineHeight: 11,
    });
    y = cardY - 12;
  });

  y = drawSectionTitle('Focus', y - 1);
  drawWrapped(
    'Responsive interfaces, bilingual business websites, web applications, and thoughtful front-end implementation.',
    mainX,
    y,
    mainWidth,
    { size: 8.5, color: palette.muted, lineHeight: 13 },
  );
  page.drawLine({
    start: { x: mainX, y: 43 },
    end: { x: pageWidth - 28, y: 43 },
    thickness: 0.6,
    color: palette.surfaceBorder,
  });
  drawText('Marco Milad  |  Front-end development  |  Egypt', mainX, 28, {
    size: 7,
    color: palette.dim,
  });

  return new Blob([await pdf.save()], { type: 'application/pdf' });
}

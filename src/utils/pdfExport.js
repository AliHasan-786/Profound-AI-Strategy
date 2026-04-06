import jsPDF from 'jspdf';

/**
 * Generates a one-page AI Visibility Audit PDF.
 * Client-side via jsPDF — no server-side rendering needed.
 */
export async function generateAuditPDF(data) {
  const {
    brandName, category, date,
    overallMentionRate, gptMentionRate, claudeMentionRate,
    competitiveShareOfVoice, sentimentByBrand,
    topCompetitor, shareOfVoiceGap, recommendations,
  } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  const MARGIN = 20;
  const CONTENT_W = W - MARGIN * 2;

  // Colors
  const DARK = [15, 23, 42];        // #0F172A
  const CARD = [30, 41, 59];        // #1E293B
  const BLUE = [59, 130, 246];      // #3B82F6
  const GREEN = [34, 197, 94];      // #22C55E
  const AMBER = [245, 158, 11];     // #F59E0B
  const MUTED = [148, 163, 184];    // #94A3B8
  const WHITE = [241, 245, 249];    // #F1F5F9

  // Dark background
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, 'F');

  let y = MARGIN;

  // Header bar
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 14, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('AEO STUDIO — AI VISIBILITY AUDIT', MARGIN, 9);
  doc.text(date || '', W - MARGIN, 9, { align: 'right' });

  y = 22;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text(`${brandName}`, MARGIN, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`AI Visibility Audit — ${category}`, MARGIN, y);
  y += 14;

  // Divider
  doc.setDrawColor(...CARD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 10;

  // Metric cards row
  const cardW = (CONTENT_W - 8) / 3;
  const cards = [
    { label: 'Overall Mention Rate', value: `${overallMentionRate}%`, color: BLUE },
    { label: 'GPT-4o Rate', value: `${gptMentionRate}%`, color: GREEN },
    { label: 'Claude Rate', value: `${claudeMentionRate}%`, color: [139, 92, 246] },
  ];

  cards.forEach((card, i) => {
    const x = MARGIN + i * (cardW + 4);
    doc.setFillColor(...CARD);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');
    doc.setFillColor(...card.color);
    doc.rect(x, y, cardW, 2, 'F');
    doc.setFontSize(18);
    doc.setTextColor(...card.color);
    doc.text(card.value, x + cardW / 2, y + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(card.label, x + cardW / 2, y + 19, { align: 'center' });
  });

  y += 30;

  // Share of Voice section
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('Competitive Share of Voice', MARGIN, y);
  y += 7;

  const maxPct = Math.max(...(competitiveShareOfVoice?.map((b) => b.pct) || [100]));
  (competitiveShareOfVoice || []).forEach((brand) => {
    const barW = (brand.pct / maxPct) * (CONTENT_W - 40);
    const isPrimary = brand.brand === brandName;

    doc.setFontSize(9);
    doc.setTextColor(isPrimary ? WHITE[0] : MUTED[0], isPrimary ? WHITE[1] : MUTED[1], isPrimary ? WHITE[2] : MUTED[2]);
    doc.text(brand.brand, MARGIN, y + 4);

    const barColor = isPrimary ? BLUE : [107, 114, 128];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(MARGIN + 35, y, barW, 6, 1, 1, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${brand.pct}%`, MARGIN + 35 + barW + 3, y + 5);

    y += 10;
  });

  y += 6;

  // Sentiment section
  if (sentimentByBrand?.length) {
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text('Sentiment Distribution (when brand is mentioned)', MARGIN, y);
    y += 7;

    const sentColors = { positive: GREEN, neutral: MUTED, negative: [239, 68, 68] };
    let barX = MARGIN;
    const sentBarH = 8;
    const totalW = CONTENT_W;

    sentimentByBrand.forEach((s) => {
      const w = (s.pct / 100) * totalW;
      doc.setFillColor(...(sentColors[s.sentiment] || MUTED));
      doc.rect(barX, y, w - 1, sentBarH, 'F');
      barX += w;
    });

    y += 12;

    // Legend
    let legendX = MARGIN;
    sentimentByBrand.forEach((s) => {
      doc.setFillColor(...(sentColors[s.sentiment] || MUTED));
      doc.rect(legendX, y - 1, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      const label = `${s.sentiment}: ${s.pct}%`;
      doc.text(label, legendX + 5, y + 2);
      legendX += doc.getTextWidth(label) + 14;
    });

    y += 10;
  }

  // Divider
  doc.setDrawColor(...CARD);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 10;

  // Recommendations
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text('Top Recommendations', MARGIN, y);
  y += 8;

  (recommendations || []).slice(0, 3).forEach((rec, i) => {
    doc.setFillColor(...AMBER);
    doc.circle(MARGIN + 2, y + 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(rec, CONTENT_W - 10);
    lines.forEach((line) => {
      doc.text(line, MARGIN + 8, y + 3);
      y += 5;
    });
    y += 3;
  });

  y += 4;

  // Competitive gap callout
  if (shareOfVoiceGap > 0 && topCompetitor) {
    doc.setFillColor(239, 68, 68, 0.1);
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text(`${shareOfVoiceGap}pt share-of-voice gap vs ${topCompetitor}`, MARGIN + 4, y + 6);
    doc.setTextColor(...MUTED);
    doc.text('Close this gap to match competitor AI citation frequency', MARGIN + 4, y + 11);
    y += 20;
  }

  // Footer
  doc.setFillColor(...CARD);
  doc.rect(0, 280, W, 17, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Generated by AEO Studio — aeo-studio.vercel.app  |  Built by Ali Hasan', MARGIN, 289);

  // Save
  const filename = `${(brandName || 'Brand').replace(/\s+/g, '_')}_AI_Visibility_Audit_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

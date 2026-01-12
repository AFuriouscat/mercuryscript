exportPdfBtn.addEventListener('click', () => {
  if (!tokenTable.querySelector('tr')) {
    alert("No tokens to export. Run lexer first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const rowHeight = 25;
  const colWidth = (pageWidth - 2 * margin) / 2;

  let y = margin;

  // Title
  doc.setFontSize(26);
  doc.text("MercuryScript", pageWidth / 2, y, { align: 'center' });
  y += 40;

  // Table headers
  doc.setFontSize(18);
  doc.text("Lexeme", margin + colWidth / 2, y, { align: 'center' });
  doc.text("Token", margin + colWidth + colWidth / 2, y, { align: 'center' });
  y += rowHeight;

  const rows = Array.from(tokenTable.querySelectorAll('tr')).map(tr => {
    const cols = tr.querySelectorAll('td');
    return [cols[0].innerText, cols[1].innerText];
  });

  doc.setFontSize(14);

  for (let i = 0; i < rows.length; i++) {
    const [lex, tok] = rows[i];

    // Check page break
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Draw cells
    doc.rect(margin, y - 18, colWidth, rowHeight);
    doc.rect(margin + colWidth, y - 18, colWidth, rowHeight);

    // Fit text in cell
    const fittedLex = fitTextToWidth(doc, lex, colWidth - 10);
    const fittedTok = fitTextToWidth(doc, tok, colWidth - 10);

    doc.text(fittedLex, margin + 5, y);
    doc.text(fittedTok, margin + colWidth + 5, y);

    y += rowHeight;
  }

  doc.save('tokens.pdf');
});

// Fit text to width (similar to Java's fitTextToWidth)
function fitTextToWidth(doc, text, maxWidth) {
  let fitted = text;
  const ellipsis = '...';
  while (doc.getTextWidth(fitted) > maxWidth && fitted.length > 0) {
    fitted = fitted.slice(0, -1);
  }
  if (fitted.length < text.length) fitted = fitted.slice(0, -3) + ellipsis;
  return fitted;
}

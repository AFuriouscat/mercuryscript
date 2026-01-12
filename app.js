exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit: 'pt', format: 'a4'});
  
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rowHeight = 20;
  const colWidth = (pageWidth - 2 * margin) / 2;
  let y = margin;

  // Title
  doc.setFontSize(26);
  doc.text('MercuryScript', pageWidth / 2, y, { align: 'center' });
  y += 40;

  // Table headers
  doc.setFontSize(16);
  doc.text('Lexeme', margin + colWidth/2, y, { align: 'center' });
  doc.text('Token', margin + colWidth + colWidth/2, y, { align: 'center' });
  y += rowHeight;

  // Draw table rows
  const rows = Array.from(tokenTable.querySelectorAll('tr')).map(tr => {
    const cols = tr.querySelectorAll('td');
    return [cols[0].innerText, cols[1].innerText];
  });

  rows.forEach(([lex, tok], index) => {
    // page break
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }

    // fit text to width (truncate + ellipsis)
    const fitText = (text, width) => {
      let str = text;
      while (doc.getTextWidth(str) > width && str.length > 0) {
        str = str.slice(0, -1);
      }
      if (str.length < text.length) str = str.slice(0, -3) + '...';
      return str;
    }

    doc.setFontSize(14);
    doc.text(fitText(lex, colWidth - 10), margin + 5, y);
    doc.text(fitText(tok, colWidth - 10), margin + colWidth + 5, y);
    y += rowHeight;
  });

  doc.save('MercuryScriptTokens.pdf');
});

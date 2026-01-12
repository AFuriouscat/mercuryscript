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

function runLexer() {
  const source = codeArea.value;
  const tokens = tokenize(source);

  // clear table
  tokenTable.innerHTML = '';
  
  // add rows
  tokens.forEach(t => {
    const row = document.createElement('tr');
    const lexCell = document.createElement('td');
    lexCell.innerText = t.lexeme;
    const tokCell = document.createElement('td');
    tokCell.innerText = t.token;
    row.appendChild(lexCell);
    row.appendChild(tokCell);
    tokenTable.appendChild(row);
  });
}

// Simple JS lexer based on your Java Lexer
function tokenize(input) {
  const KEYWORDS = {
    global: 'gb', constant: 'const', if: 'if', then: 'then', elif: 'elif',
    else: 'else', for: 'for', while: 'while', in: 'in', do: 'do',
    continue: 'cont', break: 'br', switch: 'switch', case: 'case',
    default: 'def', return: 'ret', function: 'func', end: 'end',
    var: 'var', integer: 'int', int: 'int', float: 'flt', double: 'db',
    character: 'ch', char: 'ch', string: 'str', str: 'str',
    boolean: 'bool', bool: 'bool', void: 'void',
    not: 'not', or: 'or', and: 'and', xor: 'xor'
  };

  const tokens = [];
  let pos = 0;

  function peek() { return input[pos]; }
  function advance() { pos++; }
  function peekNext() { return input[pos+1] || '\0'; }

  while (pos < input.length) {
    let c = peek();

    if (/\s/.test(c)) { advance(); continue; }

    // strings
    if (c === '"') {
      let str = '';
      advance();
      while (pos < input.length && peek() !== '"') { str += peek(); advance(); }
      if (peek() === '"') advance();
      tokens.push({ lexeme: str, token: 'str_lit' });
      continue;
    }

    // numbers
    if (/\d/.test(c) || (c === '-' && /\d/.test(peekNext()))) {
      let start = pos;
      if (c === '-') advance();
      while (/\d/.test(peek())) advance();
      if (peek() === '.') { advance(); while (/\d/.test(peek())) advance(); }
      tokens.push({ lexeme: input.slice(start, pos), token: 'num' });
      continue;
    }

    // identifiers & keywords
    if (/[A-Za-z]/.test(c)) {
      let start = pos;
      advance();
      while (/[A-Za-z0-9]/.test(peek())) advance();
      const lex = input.slice(start, pos);
      tokens.push({ lexeme: lex, token: KEYWORDS[lex] || 'id' });
      continue;
    }

    // multi-char operators
    const two = input.slice(pos, pos+2);
    const multiCharOps = ['==','!=','>=','<=','+=','-=','*=','/=','%=','++','--','||','&&'];
    if (multiCharOps.includes(two)) {
      let tok = two;
      if (two === '||') tok = 'or';
      if (two === '&&') tok = 'and';
      tokens.push({ lexeme: two, token: tok });
      pos += 2;
      continue;
    }

    // single-char tokens
    const singleTokens = '=+-*/%^!<>(){}[],;.:\'';
    if (singleTokens.includes(c)) {
      tokens.push({ lexeme: c, token: c });
      advance();
      continue;
    }

    // unknown
    tokens.push({ lexeme: c, token: 'unknown' });
    advance();
  }

  return tokens;
}

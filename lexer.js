const KEYWORDS = new Map([
  ["global","gb"], ["constant","const"], ["if","if"], ["then","then"],
  ["elif","elif"], ["else","else"], ["for","for"], ["while","while"],
  ["in","in"], ["do","do"], ["continue","cont"], ["break","br"],
  ["switch","switch"], ["case","case"], ["default","def"],
  ["return","ret"], ["function","func"], ["end","end"],

  ["var","var"], ["integer","int"], ["int","int"],
  ["float","flt"], ["double","db"], ["character","ch"],
  ["char","ch"], ["string","str"], ["str","str"],
  ["boolean","bool"], ["bool","bool"], ["void","void"],

  ["not","not"], ["or","or"], ["and","and"], ["xor","xor"]
]);

[
  "self","delta","position","globalPosition","rotation",
  "globalRotation","scale","visible","enabled",
  "anchorX","anchorY","nil",
  "scan","print","move","moveAndSlide",
  "rotates","scales","anchors","vector2",
  "direction","free"
].forEach(k => KEYWORDS.set(k, "id"));

export function tokenize(input) {
  const tokens = [];
  let pos = 0;

  const peek = () => input[pos];
  const peekNext = () => input[pos + 1];
  const advance = () => pos++;

  while (pos < input.length) {
    let c = peek();

    if (/\s/.test(c)) { advance(); continue; }

    // comments
    if (c === '/' && peekNext() === '/') {
      while (pos < input.length && peek() !== '\n') advance();
      continue;
    }

    if (c === '/' && peekNext() === '*') {
      advance(); advance();
      while (pos < input.length && !(peek() === '*' && peekNext() === '/')) advance();
      advance(); advance();
      continue;
    }

    // string
    if (c === '"') {
      advance();
      let s = "";
      while (pos < input.length && peek() !== '"') {
        s += peek();
        advance();
      }
      advance();
      tokens.push({ lexeme: s, token: "str_lit" });
      continue;
    }

    // number
    if (/\d/.test(c) || (c === '-' && /\d/.test(peekNext()))) {
      let start = pos;
      if (c === '-') advance();
      while (/\d/.test(peek())) advance();
      if (peek() === '.') {
        advance();
        while (/\d/.test(peek())) advance();
      }
      tokens.push({ lexeme: input.slice(start, pos), token: "num" });
      continue;
    }

    // identifier
    if (/[A-Za-z]/.test(c)) {
      let start = pos;
      while (/[A-Za-z0-9]/.test(peek())) advance();
      const lex = input.slice(start, pos);
      tokens.push({ lexeme: lex, token: KEYWORDS.get(lex) || "id" });
      continue;
    }

    // operators
    const two = input.substr(pos, 2);
    const ops = ["==","!=","<=",">=","+=","-=","*=","/=","%=","++","--","||","&&"];
    if (ops.includes(two)) {
      tokens.push({ lexeme: two, token: two });
      pos += 2;
      continue;
    }

    tokens.push({ lexeme: c, token: c });
    advance();
  }

  return tokens;
}

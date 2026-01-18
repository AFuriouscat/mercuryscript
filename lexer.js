class Token {
  constructor(lexeme, token) {
    this.lexeme = lexeme;
    this.token = token;
  }
}

class Lexer {
  constructor(input) {
    this.input = input || '';
    this.pos = 0;
    this.length = this.input.length;

    this.KEYWORDS = {
      "global": "gb", 
      "constant": "const", 
      "if": "if", 
      "then": "then", 
      "elif": "elif",
      "else": "else", 
      "for": "for", 
      "while": "while", 
      "in": "in", 
      "do": "do",
      "continue": "cont", 
      "break": "br", 
      "switch": "switch", 
      "case": "case",
      "default": "def", 
      "return": "ret", 
      "function": "func", 
      "end": "end",
      "var": "var", 
      "integer": "int", 
      "int": "int", 
      "float": "flt", 
      "double": "db",
      "character": "ch", 
      "char": "ch", 
      "string": "str", 
      "str": "str",
      "boolean": "bool", "bool": "bool", "void": "void",
      "self":"id","delta":"id","position":"id","globalPosition":"id","rotation":"id",
      "globalRotation":"id","scale":"id","visible":"id","enabled":"id","anchorX":"id",
      "anchorY":"id","nil":"id",
      "scan":"id","print":"id","move":"id","moveAndSlide":"id","rotates":"id",
      "scales":"id","anchors":"id","vector2":"id","direction":"id","free":"id",
      "not":"not","or":"or","and":"and","xor":"xor"
    };
  }

  peek() { return this.input[this.pos]; }
  peekNext() { return this.pos + 1 < this.length ? this.input[this.pos + 1] : '\0'; }
  advance() { this.pos++; }

  tokenize() {
    let out = [];

    while (this.pos < this.length) {
      let c = this.peek();

      // whitespace
      if (/\s/.test(c)) { this.advance(); continue; }

      // comments
      if (c === '/' && this.peekNext() === '/') {
        while (this.pos < this.length && this.peek() !== '\n') this.advance();
        continue;
      }
      if (c === '/' && this.peekNext() === '*') {
        this.advance(); this.advance();
        while (this.pos < this.length && !(this.peek() === '*' && this.peekNext() === '/')) this.advance();
        if (this.pos < this.length) { this.advance(); this.advance(); }
        continue;
      }

      // strings
      if (c === '"') {
        this.advance();
        let sb = '';
        while (this.pos < this.length && this.peek() !== '"') {
          sb += this.peek();
          this.advance();
        }
        if (this.pos < this.length && this.peek() === '"') this.advance();
        out.push(new Token(sb, 'str_lit'));
        continue;
      }

      // numbers
      if (/\d/.test(c) || (c === '-' && /\d/.test(this.peekNext()))) {
        let start = this.pos;
        if (c === '-') this.advance();
        while (/\d/.test(this.peek())) this.advance();
        if (this.peek() === '.') { this.advance(); while (/\d/.test(this.peek())) this.advance(); }
        out.push(new Token(this.input.slice(start, this.pos), 'num'));
        continue;
      }

      // identifiers / keywords
      if (/[A-Za-z]/.test(c)) {
        let start = this.pos;
        this.advance();
        while (/[A-Za-z0-9]/.test(this.peek())) this.advance();
        let lex = this.input.slice(start, this.pos);
        let tok = this.KEYWORDS[lex] || 'id';
        out.push(new Token(lex, tok));
        continue;
      }

      // multi-char operators
      let two = this.pos+1 < this.length ? this.input.slice(this.pos, this.pos+2) : null;
      if (two) {
        const map = {"==":"==","!=":"!=","<=":"<=",">=":">=","+=":"+=","-=":"-=","*=":"*=","/=":"/=","%=":"%=","++":"++","--":"--","||":"or","&&":"and"};
        if (map[two]) { out.push(new Token(two,map[two])); this.pos+=2; continue; }
      }

      // single-char
      const single = "=-+*/%^!<>()[].,:;'{}";
      if (single.includes(c)) { out.push(new Token(c,c)); this.advance(); continue; }

      // unknown
      out.push(new Token(c,'unknown')); this.advance();
    }

    return out;
  }
}

import { Token, TokenType, KEYWORDS } from './token';
import { RTJError } from './diagnostics';

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      // Skip whitespace (not newlines)
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.advance();
        continue;
      }

      // Newlines
      if (ch === '\n') {
        this.advance();
        this.line++;
        this.col = 1;
        continue;
      }

      // Line comments
      if (ch === '/' && this.peek(1) === '/') {
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          this.advance();
        }
        continue;
      }

      // Block comments
      if (ch === '/' && this.peek(1) === '*') {
        this.advance();
        this.advance();
        while (this.pos < this.source.length) {
          if (this.source[this.pos] === '*' && this.peek(1) === '/') {
            this.advance();
            this.advance();
            break;
          }
          if (this.source[this.pos] === '\n') {
            this.line++;
            this.col = 0;
          }
          this.advance();
        }
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'") {
        tokens.push(this.readString(ch));
        continue;
      }

      // Numbers
      if (this.isDigit(ch)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Identifiers / keywords
      if (this.isAlpha(ch)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Pipe operator |>
      if (ch === '|' && this.peek(1) === '>') {
        tokens.push(this.makeToken(TokenType.PIPE, '|>', 2));
        continue;
      }

      // Two-char operators
      if (ch === '=' && this.peek(1) === '=') { tokens.push(this.makeToken(TokenType.EQ_EQ, '==', 2)); continue; }
      if (ch === '!' && this.peek(1) === '=') { tokens.push(this.makeToken(TokenType.BANG_EQ, '!=', 2)); continue; }
      if (ch === '>' && this.peek(1) === '=') { tokens.push(this.makeToken(TokenType.GT_EQ, '>=', 2)); continue; }
      if (ch === '<' && this.peek(1) === '=') { tokens.push(this.makeToken(TokenType.LT_EQ, '<=', 2)); continue; }
      if (ch === '&' && this.peek(1) === '&') { tokens.push(this.makeToken(TokenType.AND_AND, '&&', 2)); continue; }
      if (ch === '|' && this.peek(1) === '|') { tokens.push(this.makeToken(TokenType.OR_OR, '||', 2)); continue; }

      // Single-char tokens
      const singles: Record<string, TokenType> = {
        '+': TokenType.PLUS,
        '-': TokenType.MINUS,
        '*': TokenType.STAR,
        '/': TokenType.SLASH,
        '%': TokenType.PERCENT,
        '>': TokenType.GT,
        '<': TokenType.LT,
        '!': TokenType.BANG,
        '=': TokenType.ASSIGN,
        '{': TokenType.LBRACE,
        '}': TokenType.RBRACE,
        '(': TokenType.LPAREN,
        ')': TokenType.RPAREN,
        '[': TokenType.LBRACKET,
        ']': TokenType.RBRACKET,
        ',': TokenType.COMMA,
        ':': TokenType.COLON,
        '.': TokenType.DOT,
        ';': TokenType.SEMICOLON,
      };

      if (singles[ch]) {
        tokens.push(this.makeToken(singles[ch], ch, 1));
        continue;
      }

      throw new RTJError('SyntaxError', `unexpected character '${ch}'`, this.line, this.col);
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.col });
    return tokens;
  }

  private advance(): void {
    this.pos++;
    this.col++;
  }

  private peek(offset: number): string | undefined {
    return this.source[this.pos + offset];
  }

  private makeToken(type: TokenType, value: string, length: number): Token {
    const token: Token = { type, value, line: this.line, column: this.col };
    for (let i = 0; i < length; i++) this.advance();
    return token;
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isAlpha(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  private isAlphaNumeric(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch);
  }

  private readString(quote: string): Token {
    const startCol = this.col;
    this.advance(); // skip opening quote
    let value = '';
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\\') {
        this.advance();
        const esc = this.source[this.pos];
        if (esc === 'n') value += '\n';
        else if (esc === 't') value += '\t';
        else if (esc === '\\') value += '\\';
        else if (esc === quote) value += quote;
        else value += '\\' + esc;
      } else {
        value += this.source[this.pos];
      }
      this.advance();
    }
    if (this.pos >= this.source.length) {
      throw new RTJError('SyntaxError', 'unterminated string', this.line, startCol);
    }
    this.advance(); // skip closing quote
    return { type: TokenType.STRING, value, line: this.line, column: startCol };
  }

  private readNumber(): Token {
    const startCol = this.col;
    let value = '';
    while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
      value += this.source[this.pos];
      this.advance();
    }
    if (this.pos < this.source.length && this.source[this.pos] === '.' && this.peek(1) && this.isDigit(this.peek(1)!)) {
      value += '.';
      this.advance();
      while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
        value += this.source[this.pos];
        this.advance();
      }
    }
    return { type: TokenType.NUMBER, value, line: this.line, column: startCol };
  }

  private readIdentifier(): Token {
    const startCol = this.col;
    let value = '';
    while (this.pos < this.source.length && this.isAlphaNumeric(this.source[this.pos])) {
      value += this.source[this.pos];
      this.advance();
    }
    const type = KEYWORDS[value] || TokenType.IDENTIFIER;
    return { type, value, line: this.line, column: startCol };
  }
}

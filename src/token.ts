export enum TokenType {
  // Keywords
  JEWEL = 'JEWEL',
  VERSE = 'VERSE',
  SEND = 'SEND',
  TALK = 'TALK',
  IFWILD = 'IFWILD',
  ELSEWILD = 'ELSEWILD',
  RUN = 'RUN',
  IN = 'IN',
  FEATURE = 'FEATURE',
  FROM = 'FROM',
  YANK = 'YANK',
  DUO = 'DUO',
  MIKE = 'MIKE',
  EL = 'EL',

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',

  // Operators
  PIPE = 'PIPE',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  EQ_EQ = 'EQ_EQ',
  BANG_EQ = 'BANG_EQ',
  GT = 'GT',
  LT = 'LT',
  GT_EQ = 'GT_EQ',
  LT_EQ = 'LT_EQ',
  AND_AND = 'AND_AND',
  OR_OR = 'OR_OR',
  BANG = 'BANG',
  ASSIGN = 'ASSIGN',

  // Punctuation
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  COLON = 'COLON',
  DOT = 'DOT',
  SEMICOLON = 'SEMICOLON',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const KEYWORDS: Record<string, TokenType> = {
  jewel: TokenType.JEWEL,
  verse: TokenType.VERSE,
  send: TokenType.SEND,
  talk: TokenType.TALK,
  ifwild: TokenType.IFWILD,
  elsewild: TokenType.ELSEWILD,
  run: TokenType.RUN,
  in: TokenType.IN,
  feature: TokenType.FEATURE,
  from: TokenType.FROM,
  yank: TokenType.YANK,
  duo: TokenType.DUO,
  mike: TokenType.MIKE,
  el: TokenType.EL,
  true: TokenType.BOOLEAN,
  false: TokenType.BOOLEAN,
  null: TokenType.NULL,
};

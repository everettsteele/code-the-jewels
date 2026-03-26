import { Token, TokenType } from './token';
import { RTJError } from './diagnostics';
import {
  Program, Statement, Expression, BlockStmt, VarDecl, FunctionDecl,
  ReturnStmt, TalkStmt, IfStmt, LoopStmt, ImportStmt, ThrowStmt,
  ExpressionStmt, Identifier, StringLiteral, NumberLiteral,
  BooleanLiteral, NullLiteral, ArrayLiteral, ObjectLiteral,
  BinaryExpr, UnaryExpr, CallExpr, MemberExpr, PipeExpr, DuoExpr,
} from './ast';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Program {
    const body: Statement[] = [];
    while (!this.isAtEnd()) {
      this.skipSemicolons();
      if (!this.isAtEnd()) {
        body.push(this.parseStatement());
      }
    }
    return { type: 'Program', body };
  }

  private parseStatement(): Statement {
    const tok = this.current();

    switch (tok.type) {
      case TokenType.JEWEL: return this.parseVarDecl();
      case TokenType.VERSE: return this.parseFunctionDecl();
      case TokenType.SEND: return this.parseReturnStmt();
      case TokenType.TALK: return this.parseTalkStmt();
      case TokenType.IFWILD: return this.parseIfStmt();
      case TokenType.RUN: return this.parseLoopStmt();
      case TokenType.FEATURE: return this.parseImportStmt();
      case TokenType.YANK: return this.parseThrowStmt();
      case TokenType.LBRACE: return this.parseBlock();
      default: return this.parseExpressionStmt();
    }
  }

  private parseVarDecl(): VarDecl {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.JEWEL);
    const name = this.expectIdentifierOrKeyword().value;
    this.expect(TokenType.ASSIGN);
    const init = this.parseExpression();
    this.skipSemicolons();
    return { type: 'VarDecl', name, init, loc };
  }

  private parseFunctionDecl(): FunctionDecl {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.VERSE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LPAREN);
    const params: string[] = [];
    if (this.current().type !== TokenType.RPAREN) {
      params.push(this.expect(TokenType.IDENTIFIER).value);
      while (this.current().type === TokenType.COMMA) {
        this.advance();
        params.push(this.expect(TokenType.IDENTIFIER).value);
      }
    }
    this.expect(TokenType.RPAREN);
    const body = this.parseBlock();
    return { type: 'FunctionDecl', name, params, body, loc };
  }

  private parseReturnStmt(): ReturnStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.SEND);
    let value: Expression | undefined;
    if (!this.isAtEnd() && this.current().type !== TokenType.RBRACE && this.current().type !== TokenType.SEMICOLON) {
      value = this.parseExpression();
    }
    this.skipSemicolons();
    return { type: 'ReturnStmt', value, loc };
  }

  private parseTalkStmt(): TalkStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.TALK);
    const value = this.parseExpression();
    this.skipSemicolons();
    return { type: 'TalkStmt', value, loc };
  }

  private parseIfStmt(): IfStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.IFWILD);
    const condition = this.parseExpression();
    const consequent = this.parseBlock();
    let alternate: BlockStmt | undefined;
    if (this.current().type === TokenType.ELSEWILD) {
      this.advance();
      alternate = this.parseBlock();
    }
    return { type: 'IfStmt', condition, consequent, alternate, loc };
  }

  private parseLoopStmt(): LoopStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.RUN);
    const variable = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.IN);
    const iterable = this.parseExpression();
    const body = this.parseBlock();
    return { type: 'LoopStmt', variable, iterable, body, loc };
  }

  private parseImportStmt(): ImportStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.FEATURE);
    const names: string[] = [];
    names.push(this.expect(TokenType.IDENTIFIER).value);
    while (this.current().type === TokenType.COMMA) {
      this.advance();
      names.push(this.expect(TokenType.IDENTIFIER).value);
    }
    this.expect(TokenType.FROM);
    const source = this.expect(TokenType.STRING).value;
    this.skipSemicolons();
    return { type: 'ImportStmt', names, source, loc };
  }

  private parseThrowStmt(): ThrowStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.YANK);
    const value = this.parseExpression();
    this.skipSemicolons();
    return { type: 'ThrowStmt', value, loc };
  }

  private parseBlock(): BlockStmt {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.LBRACE);
    const body: Statement[] = [];
    while (this.current().type !== TokenType.RBRACE && !this.isAtEnd()) {
      this.skipSemicolons();
      if (this.current().type !== TokenType.RBRACE) {
        body.push(this.parseStatement());
      }
    }
    this.expect(TokenType.RBRACE);
    return { type: 'BlockStmt', body, loc };
  }

  private parseExpressionStmt(): ExpressionStmt {
    const loc = { line: this.current().line, column: this.current().column };
    const expr = this.parseExpression();
    this.skipSemicolons();
    return { type: 'ExpressionStmt', expr, loc };
  }

  private parseExpression(): Expression {
    return this.parsePipeExpr();
  }

  private parsePipeExpr(): Expression {
    let left = this.parseOr();
    if (this.current().type === TokenType.PIPE) {
      const loc = { line: this.current().line, column: this.current().column };
      const steps: Expression[] = [left];
      while (this.current().type === TokenType.PIPE) {
        this.advance();
        steps.push(this.parseOr());
      }
      return { type: 'PipeExpr', steps, loc } as PipeExpr;
    }
    return left;
  }

  private parseOr(): Expression {
    let left = this.parseAnd();
    while (this.current().type === TokenType.OR_OR) {
      const op = this.advance().value;
      const right = this.parseAnd();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseAnd(): Expression {
    let left = this.parseEquality();
    while (this.current().type === TokenType.AND_AND) {
      const op = this.advance().value;
      const right = this.parseEquality();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseEquality(): Expression {
    let left = this.parseComparison();
    while (this.current().type === TokenType.EQ_EQ || this.current().type === TokenType.BANG_EQ) {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseComparison(): Expression {
    let left = this.parseAddition();
    while (
      this.current().type === TokenType.GT ||
      this.current().type === TokenType.LT ||
      this.current().type === TokenType.GT_EQ ||
      this.current().type === TokenType.LT_EQ
    ) {
      const op = this.advance().value;
      const right = this.parseAddition();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseAddition(): Expression {
    let left = this.parseMultiplication();
    while (this.current().type === TokenType.PLUS || this.current().type === TokenType.MINUS) {
      const op = this.advance().value;
      const right = this.parseMultiplication();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseMultiplication(): Expression {
    let left = this.parseUnary();
    while (
      this.current().type === TokenType.STAR ||
      this.current().type === TokenType.SLASH ||
      this.current().type === TokenType.PERCENT
    ) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { type: 'BinaryExpr', op, left, right, loc: (left as any).loc } as BinaryExpr;
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.current().type === TokenType.BANG || this.current().type === TokenType.MINUS) {
      const loc = { line: this.current().line, column: this.current().column };
      const op = this.advance().value;
      const operand = this.parseUnary();
      return { type: 'UnaryExpr', op, operand, loc } as UnaryExpr;
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.current().type === TokenType.LPAREN) {
        this.advance();
        const args: Expression[] = [];
        if (this.current().type !== TokenType.RPAREN) {
          args.push(this.parseExpression());
          while (this.current().type === TokenType.COMMA) {
            this.advance();
            args.push(this.parseExpression());
          }
        }
        this.expect(TokenType.RPAREN);
        expr = { type: 'CallExpr', callee: expr, args, loc: (expr as any).loc } as CallExpr;
      } else if (this.current().type === TokenType.DOT) {
        this.advance();
        const prop = this.expect(TokenType.IDENTIFIER);
        expr = {
          type: 'MemberExpr',
          object: expr,
          property: { type: 'Identifier', name: prop.value, loc: { line: prop.line, column: prop.column } } as Identifier,
          computed: false,
          loc: (expr as any).loc,
        } as MemberExpr;
      } else if (this.current().type === TokenType.LBRACKET) {
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenType.RBRACKET);
        expr = {
          type: 'MemberExpr',
          object: expr,
          property: index,
          computed: true,
          loc: (expr as any).loc,
        } as MemberExpr;
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): Expression {
    const tok = this.current();

    // duo expression
    if (tok.type === TokenType.DUO) {
      return this.parseDuoExpr();
    }

    // Grouped expression
    if (tok.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    // Array literal
    if (tok.type === TokenType.LBRACKET) {
      return this.parseArrayLiteral();
    }

    // Object literal (only when not ambiguous with block)
    // Objects are parsed in specific contexts (e.g., after =)

    // String
    if (tok.type === TokenType.STRING) {
      this.advance();
      return { type: 'StringLiteral', value: tok.value, loc: { line: tok.line, column: tok.column } } as StringLiteral;
    }

    // Number
    if (tok.type === TokenType.NUMBER) {
      this.advance();
      return { type: 'NumberLiteral', value: Number(tok.value), loc: { line: tok.line, column: tok.column } } as NumberLiteral;
    }

    // Boolean
    if (tok.type === TokenType.BOOLEAN) {
      this.advance();
      return { type: 'BooleanLiteral', value: tok.value === 'true', loc: { line: tok.line, column: tok.column } } as BooleanLiteral;
    }

    // Null
    if (tok.type === TokenType.NULL) {
      this.advance();
      return { type: 'NullLiteral', loc: { line: tok.line, column: tok.column } } as NullLiteral;
    }

    // Identifier (including keywords used as variable names in expression context)
    if (tok.type === TokenType.IDENTIFIER || this.isKeywordUsableAsIdentifier(tok.type)) {
      this.advance();
      return { type: 'Identifier', name: tok.value, loc: { line: tok.line, column: tok.column } } as Identifier;
    }

    throw new RTJError('SyntaxError', `unexpected token '${tok.value}'`, tok.line, tok.column);
  }

  private parseDuoExpr(): DuoExpr {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.DUO);
    this.expect(TokenType.LPAREN);
    const input = this.parseExpression();
    this.expect(TokenType.RPAREN);
    this.expect(TokenType.LBRACE);

    this.expect(TokenType.MIKE);
    this.expect(TokenType.COLON);
    const mikePipeline = this.parsePipelineList();

    this.expect(TokenType.EL);
    this.expect(TokenType.COLON);
    const elPipeline = this.parsePipelineList();

    this.expect(TokenType.RBRACE);

    return { type: 'DuoExpr', input, mikePipeline, elPipeline, loc };
  }

  private parsePipelineList(): Expression[] {
    const steps: Expression[] = [];
    steps.push(this.parsePostfix());
    while (this.current().type === TokenType.PIPE) {
      this.advance();
      steps.push(this.parsePostfix());
    }
    return steps;
  }

  private parseArrayLiteral(): ArrayLiteral {
    const loc = { line: this.current().line, column: this.current().column };
    this.expect(TokenType.LBRACKET);
    const elements: Expression[] = [];
    if (this.current().type !== TokenType.RBRACKET) {
      elements.push(this.parseExpression());
      while (this.current().type === TokenType.COMMA) {
        this.advance();
        elements.push(this.parseExpression());
      }
    }
    this.expect(TokenType.RBRACKET);
    return { type: 'ArrayLiteral', elements, loc };
  }

  private current(): Token {
    return this.tokens[this.pos] || { type: TokenType.EOF, value: '', line: 0, column: 0 };
  }

  private advance(): Token {
    const tok = this.current();
    this.pos++;
    return tok;
  }

  private expect(type: TokenType): Token {
    const tok = this.current();
    if (tok.type !== type) {
      throw new RTJError(
        'SyntaxError',
        `beat slipped near line ${tok.line}, expected '${type}' but got '${tok.type}'`,
        tok.line,
        tok.column
      );
    }
    return this.advance();
  }

  private isKeywordUsableAsIdentifier(type: TokenType): boolean {
    // Keywords that can appear as variable names in expression contexts
    return type === TokenType.VERSE || type === TokenType.JEWEL ||
           type === TokenType.SEND || type === TokenType.TALK ||
           type === TokenType.RUN || type === TokenType.IN ||
           type === TokenType.FEATURE || type === TokenType.FROM ||
           type === TokenType.YANK || type === TokenType.MIKE ||
           type === TokenType.EL;
  }

  private expectIdentifierOrKeyword(): Token {
    const tok = this.current();
    if (tok.type === TokenType.IDENTIFIER || this.isKeywordUsableAsIdentifier(tok.type)) {
      return this.advance();
    }
    throw new RTJError(
      'SyntaxError',
      `beat slipped near line ${tok.line}, expected identifier but got '${tok.type}'`,
      tok.line,
      tok.column
    );
  }

  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }

  private skipSemicolons(): void {
    while (this.current().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }
}

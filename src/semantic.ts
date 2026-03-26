import { Program, Statement, Expression } from './ast';
import { RTJError } from './diagnostics';

const VALID_MODULES = ['bk:text', 'bk:parse', 'atl:data', 'atl:flow'];

export class Semantic {
  private scopes: Set<string>[] = [];

  analyze(program: Program): void {
    this.pushScope();
    for (const stmt of program.body) {
      this.analyzeStatement(stmt);
    }
    this.popScope();
  }

  private pushScope(): void {
    this.scopes.push(new Set());
  }

  private popScope(): void {
    this.scopes.pop();
  }

  private declare(name: string, line?: number): void {
    const top = this.scopes[this.scopes.length - 1];
    if (top.has(name)) {
      throw new RTJError('NameError', `duplicate jewel '${name}'`, line);
    }
    top.add(name);
  }

  private lookup(name: string): boolean {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) return true;
    }
    return false;
  }

  private analyzeStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'VarDecl':
        this.analyzeExpression(stmt.init);
        this.declare(stmt.name, stmt.loc.line);
        break;
      case 'FunctionDecl':
        this.declare(stmt.name, stmt.loc.line);
        this.pushScope();
        for (const p of stmt.params) {
          this.declare(p, stmt.loc.line);
        }
        for (const s of stmt.body.body) {
          this.analyzeStatement(s);
        }
        this.popScope();
        break;
      case 'ReturnStmt':
        if (stmt.value) this.analyzeExpression(stmt.value);
        break;
      case 'TalkStmt':
        this.analyzeExpression(stmt.value);
        break;
      case 'IfStmt':
        this.analyzeExpression(stmt.condition);
        this.pushScope();
        for (const s of stmt.consequent.body) this.analyzeStatement(s);
        this.popScope();
        if (stmt.alternate) {
          this.pushScope();
          for (const s of stmt.alternate.body) this.analyzeStatement(s);
          this.popScope();
        }
        break;
      case 'LoopStmt':
        this.analyzeExpression(stmt.iterable);
        this.pushScope();
        this.declare(stmt.variable, stmt.loc.line);
        for (const s of stmt.body.body) this.analyzeStatement(s);
        this.popScope();
        break;
      case 'ImportStmt':
        if (!VALID_MODULES.includes(stmt.source)) {
          throw new RTJError('ImportError', `unknown feature source '${stmt.source}'`, stmt.loc.line);
        }
        for (const name of stmt.names) {
          this.declare(name, stmt.loc.line);
        }
        break;
      case 'ThrowStmt':
        this.analyzeExpression(stmt.value);
        break;
      case 'ExpressionStmt':
        this.analyzeExpression(stmt.expr);
        break;
      case 'BlockStmt':
        this.pushScope();
        for (const s of stmt.body) this.analyzeStatement(s);
        this.popScope();
        break;
    }
  }

  private analyzeExpression(expr: Expression): void {
    switch (expr.type) {
      case 'Identifier':
        // Warn but don't error in v0.1 (runtime may provide)
        break;
      case 'StringLiteral':
      case 'NumberLiteral':
      case 'BooleanLiteral':
      case 'NullLiteral':
        break;
      case 'ArrayLiteral':
        for (const el of expr.elements) this.analyzeExpression(el);
        break;
      case 'ObjectLiteral':
        for (const pair of expr.pairs) this.analyzeExpression(pair.value);
        break;
      case 'BinaryExpr':
        this.analyzeExpression(expr.left);
        this.analyzeExpression(expr.right);
        break;
      case 'UnaryExpr':
        this.analyzeExpression(expr.operand);
        break;
      case 'CallExpr':
        this.analyzeExpression(expr.callee);
        for (const arg of expr.args) this.analyzeExpression(arg);
        break;
      case 'MemberExpr':
        this.analyzeExpression(expr.object);
        if (expr.computed) this.analyzeExpression(expr.property);
        break;
      case 'PipeExpr':
        for (const step of expr.steps) this.analyzeExpression(step);
        break;
      case 'DuoExpr':
        this.analyzeExpression(expr.input);
        for (const step of expr.mikePipeline) this.analyzeExpression(step);
        for (const step of expr.elPipeline) this.analyzeExpression(step);
        break;
    }
  }
}

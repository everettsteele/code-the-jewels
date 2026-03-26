import { Program, Statement, Expression } from './ast';

export class Generator {
  private indent: number = 0;

  generate(program: Program): string {
    const lines: string[] = [
      '"use strict";',
      'const __rtj = require("./runtime/rtj-core");',
      'const __modules = __rtj.modules;',
      '',
    ];

    for (const stmt of program.body) {
      lines.push(this.genStatement(stmt));
    }

    return lines.join('\n') + '\n';
  }

  private pad(): string {
    return '  '.repeat(this.indent);
  }

  private genStatement(stmt: Statement): string {
    switch (stmt.type) {
      case 'VarDecl':
        return `${this.pad()}const ${stmt.name} = ${this.genExpression(stmt.init)};`;
      case 'FunctionDecl': {
        const params = stmt.params.join(', ');
        const body = this.genBlock(stmt.body);
        return `${this.pad()}function ${stmt.name}(${params}) ${body}`;
      }
      case 'ReturnStmt':
        return stmt.value
          ? `${this.pad()}return ${this.genExpression(stmt.value)};`
          : `${this.pad()}return;`;
      case 'TalkStmt':
        return `${this.pad()}__rtj.talk(${this.genExpression(stmt.value)});`;
      case 'IfStmt': {
        let result = `${this.pad()}if (${this.genExpression(stmt.condition)}) ${this.genBlock(stmt.consequent)}`;
        if (stmt.alternate) {
          result += ` else ${this.genBlock(stmt.alternate)}`;
        }
        return result;
      }
      case 'LoopStmt':
        return `${this.pad()}for (const ${stmt.variable} of ${this.genExpression(stmt.iterable)}) ${this.genBlock(stmt.body)}`;
      case 'ImportStmt': {
        const names = stmt.names.join(', ');
        return `${this.pad()}const { ${names} } = __modules["${stmt.source}"];`;
      }
      case 'ThrowStmt':
        return `${this.pad()}throw new Error(${this.genExpression(stmt.value)});`;
      case 'ExpressionStmt':
        return `${this.pad()}${this.genExpression(stmt.expr)};`;
      case 'BlockStmt':
        return this.genBlock(stmt);
    }
  }

  private genBlock(block: { body: Statement[] }): string {
    const lines: string[] = ['{'];
    this.indent++;
    for (const stmt of block.body) {
      lines.push(this.genStatement(stmt));
    }
    this.indent--;
    lines.push(`${this.pad()}}`);
    return lines.join('\n');
  }

  private genExpression(expr: Expression): string {
    switch (expr.type) {
      case 'Identifier':
        return expr.name;
      case 'StringLiteral':
        return JSON.stringify(expr.value);
      case 'NumberLiteral':
        return String(expr.value);
      case 'BooleanLiteral':
        return String(expr.value);
      case 'NullLiteral':
        return 'null';
      case 'ArrayLiteral':
        return `[${expr.elements.map(e => this.genExpression(e)).join(', ')}]`;
      case 'ObjectLiteral': {
        const pairs = expr.pairs.map(p => `${JSON.stringify(p.key)}: ${this.genExpression(p.value)}`);
        return `{ ${pairs.join(', ')} }`;
      }
      case 'BinaryExpr':
        return `(${this.genExpression(expr.left)} ${expr.op} ${this.genExpression(expr.right)})`;
      case 'UnaryExpr':
        return `(${expr.op}${this.genExpression(expr.operand)})`;
      case 'CallExpr': {
        const callee = this.genExpression(expr.callee);
        const args = expr.args.map(a => this.genExpression(a)).join(', ');
        return `${callee}(${args})`;
      }
      case 'MemberExpr':
        if (expr.computed) {
          return `${this.genExpression(expr.object)}[${this.genExpression(expr.property)}]`;
        }
        return `${this.genExpression(expr.object)}.${this.genExpression(expr.property)}`;
      case 'PipeExpr':
        return this.flattenPipe(expr.steps);
      case 'DuoExpr': {
        const allSteps = [...expr.mikePipeline, ...expr.elPipeline];
        const initial = this.genExpression(expr.input);
        return this.flattenPipeFromStrings(initial, allSteps);
      }
    }
  }

  private flattenPipe(steps: Expression[]): string {
    if (steps.length === 0) return '';
    if (steps.length === 1) return this.genExpression(steps[0]);
    const initial = this.genExpression(steps[0]);
    return this.flattenPipeFromStrings(initial, steps.slice(1));
  }

  private flattenPipeFromStrings(initial: string, fns: Expression[]): string {
    let result = initial;
    for (const fn of fns) {
      result = `${this.genExpression(fn)}(${result})`;
    }
    return result;
  }
}

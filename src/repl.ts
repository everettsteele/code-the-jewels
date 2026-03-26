import * as readline from 'readline';
import * as path from 'path';
import * as vm from 'vm';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Semantic } from './semantic';
import { Generator } from './generator';
import { RTJError } from './diagnostics';

export function startRepl(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'rtj> ',
  });

  // Load the runtime once
  const runtimePath = path.join(__dirname, 'runtime', 'rtj-core');
  const rtjCore = require(runtimePath);

  // Persistent context for the REPL
  const context = vm.createContext({
    __rtj: rtjCore,
    __modules: rtjCore.modules,
    console: console,
    require: require,
  });

  const history: string[] = [];

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();
    if (input === '.exit') {
      process.exit(0);
    }
    if (input === '') {
      rl.prompt();
      return;
    }

    try {
      const lexer = new Lexer(input);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const semantic = new Semantic();
      semantic.analyze(ast);
      const gen = new Generator();
      let js = gen.generate(ast);

      // Strip the prelude since we already have the runtime in context
      js = js.replace('"use strict";\n', '');
      js = js.replace('const __rtj = require("./runtime/rtj-core");\n', '');
      js = js.replace('const __modules = __rtj.modules;\n', '');

      history.push(js);
      const result = vm.runInContext(js, context);
      if (result !== undefined) {
        console.log(result);
      }
    } catch (err) {
      if (err instanceof RTJError) {
        console.error(err.format());
      } else if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }

    rl.prompt();
  });

  rl.on('close', () => process.exit(0));
}

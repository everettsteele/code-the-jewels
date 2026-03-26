#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Lexer } from './lexer';
import { Parser } from './parser';
import { Semantic } from './semantic';
import { Generator } from './generator';
import { RTJError } from './diagnostics';
import { startRepl } from './repl';

function compile(source: string): string {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const semantic = new Semantic();
  semantic.analyze(ast);
  const gen = new Generator();
  return gen.generate(ast);
}

function resolveRuntimePath(): string {
  // When running from dist/, runtime is at dist/runtime/rtj-core.js
  // When running via ts-node, runtime is at src/runtime/rtj-core.ts
  const distRuntime = path.join(__dirname, 'runtime', 'rtj-core');
  return distRuntime;
}

function run(filePath: string): void {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }
  const source = fs.readFileSync(absPath, 'utf-8');
  let js = compile(source);

  // Replace the generic runtime require with the actual path
  const runtimePath = resolveRuntimePath().replace(/\\/g, '/');
  js = js.replace(
    'const __rtj = require("./runtime/rtj-core");',
    `const __rtj = require("${runtimePath}");`
  );

  // Write to temp file and execute
  const tmpFile = path.join(os.tmpdir(), `rtj_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
  fs.writeFileSync(tmpFile, js, 'utf-8');
  try {
    require(tmpFile);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function compileToFile(filePath: string): void {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }
  const source = fs.readFileSync(absPath, 'utf-8');
  const js = compile(source);
  const outPath = absPath.replace(/\.rtj$/, '.js');
  fs.writeFileSync(outPath, js, 'utf-8');
}

function check(filePath: string): void {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }
  const source = fs.readFileSync(absPath, 'utf-8');
  compile(source); // throws on error
}

const [,, command, ...args] = process.argv;

try {
  switch (command) {
    case 'run': {
      if (!args[0]) {
        console.error('Usage: rtj run <file.rtj>');
        process.exit(1);
      }
      run(args[0]);
      break;
    }
    case 'compile': {
      if (!args[0]) {
        console.error('Usage: rtj compile <file.rtj>');
        process.exit(1);
      }
      compileToFile(args[0]);
      break;
    }
    case 'check': {
      if (!args[0]) {
        console.error('Usage: rtj check <file.rtj>');
        process.exit(1);
      }
      check(args[0]);
      break;
    }
    case 'repl': {
      startRepl();
      break;
    }
    default: {
      console.log('Usage: rtj <run|compile|check|repl> [file]');
    }
  }
} catch (err) {
  if (err instanceof RTJError) {
    console.error(err.format());
    process.exit(1);
  }
  throw err;
}

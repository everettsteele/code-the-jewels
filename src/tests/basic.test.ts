import { Lexer } from '../lexer';
import { Parser } from '../parser';
import { Semantic } from '../semantic';
import { Generator } from '../generator';

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

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

test('lexer tokenizes hello world', () => {
  const lexer = new Lexer('talk "hello"');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'TALK', 'first token is TALK');
  assert(tokens[1].type === 'STRING', 'second token is STRING');
  assert(tokens[1].value === 'hello', 'string value is hello');
});

test('parser creates TalkStmt', () => {
  const lexer = new Lexer('talk "hello"');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.body.length === 1, 'one statement');
  assert(ast.body[0].type === 'TalkStmt', 'is TalkStmt');
});

test('generator outputs talk call', () => {
  const js = compile('talk "hello"');
  assert(js.includes('__rtj.talk("hello")'), 'contains talk call');
});

test('pipe expression compiles to nested calls', () => {
  const js = compile('feature trim, upper from "bk:text"\njewel x = "hi" |> trim |> upper');
  assert(js.includes('upper(trim("hi"))'), 'pipe flattened correctly');
});

test('duo expression compiles', () => {
  const js = compile('feature trim from "bk:text"\nfeature words from "bk:parse"\nfeature count from "atl:data"\njewel x = duo("hi") {\n  mike: trim |> words\n  el: count\n}');
  assert(js.includes('count(words(trim("hi")))'), 'duo flattened correctly');
});

test('semantic rejects invalid import source', () => {
  let threw = false;
  try {
    compile('feature foo from "bk:audio"');
  } catch (err) {
    threw = true;
  }
  assert(threw, 'should throw on invalid import');
});

console.log('All tests complete.');

export interface Location {
  line: number;
  column: number;
}

export type Statement =
  | VarDecl
  | FunctionDecl
  | ReturnStmt
  | TalkStmt
  | IfStmt
  | LoopStmt
  | ImportStmt
  | ThrowStmt
  | ExpressionStmt
  | BlockStmt;

export type Expression =
  | Identifier
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | ArrayLiteral
  | ObjectLiteral
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | MemberExpr
  | PipeExpr
  | DuoExpr;

export interface Program {
  type: 'Program';
  body: Statement[];
}

export interface VarDecl {
  type: 'VarDecl';
  name: string;
  init: Expression;
  loc: Location;
}

export interface FunctionDecl {
  type: 'FunctionDecl';
  name: string;
  params: string[];
  body: BlockStmt;
  loc: Location;
}

export interface ReturnStmt {
  type: 'ReturnStmt';
  value?: Expression;
  loc: Location;
}

export interface TalkStmt {
  type: 'TalkStmt';
  value: Expression;
  loc: Location;
}

export interface IfStmt {
  type: 'IfStmt';
  condition: Expression;
  consequent: BlockStmt;
  alternate?: BlockStmt;
  loc: Location;
}

export interface LoopStmt {
  type: 'LoopStmt';
  variable: string;
  iterable: Expression;
  body: BlockStmt;
  loc: Location;
}

export interface ImportStmt {
  type: 'ImportStmt';
  names: string[];
  source: string;
  loc: Location;
}

export interface ThrowStmt {
  type: 'ThrowStmt';
  value: Expression;
  loc: Location;
}

export interface ExpressionStmt {
  type: 'ExpressionStmt';
  expr: Expression;
  loc: Location;
}

export interface BlockStmt {
  type: 'BlockStmt';
  body: Statement[];
  loc: Location;
}

export interface Identifier {
  type: 'Identifier';
  name: string;
  loc: Location;
}

export interface StringLiteral {
  type: 'StringLiteral';
  value: string;
  loc: Location;
}

export interface NumberLiteral {
  type: 'NumberLiteral';
  value: number;
  loc: Location;
}

export interface BooleanLiteral {
  type: 'BooleanLiteral';
  value: boolean;
  loc: Location;
}

export interface NullLiteral {
  type: 'NullLiteral';
  loc: Location;
}

export interface ArrayLiteral {
  type: 'ArrayLiteral';
  elements: Expression[];
  loc: Location;
}

export interface ObjectLiteral {
  type: 'ObjectLiteral';
  pairs: { key: string; value: Expression }[];
  loc: Location;
}

export interface BinaryExpr {
  type: 'BinaryExpr';
  op: string;
  left: Expression;
  right: Expression;
  loc: Location;
}

export interface UnaryExpr {
  type: 'UnaryExpr';
  op: string;
  operand: Expression;
  loc: Location;
}

export interface CallExpr {
  type: 'CallExpr';
  callee: Expression;
  args: Expression[];
  loc: Location;
}

export interface MemberExpr {
  type: 'MemberExpr';
  object: Expression;
  property: Expression;
  computed: boolean;
  loc: Location;
}

export interface PipeExpr {
  type: 'PipeExpr';
  steps: Expression[];
  loc: Location;
}

export interface DuoExpr {
  type: 'DuoExpr';
  input: Expression;
  mikePipeline: Expression[];
  elPipeline: Expression[];
  loc: Location;
}

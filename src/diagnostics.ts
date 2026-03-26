export class RTJError extends Error {
  constructor(
    public kind: 'SyntaxError' | 'NameError' | 'ImportError' | 'DuoError' | 'RuntimeError',
    message: string,
    public line?: number,
    public column?: number
  ) {
    super(message);
  }

  format(): string {
    const loc = this.line ? ` near line ${this.line}` : '';
    return `${this.kind}: ${this.message}${loc}`;
  }
}

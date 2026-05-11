import type { SourceSpan } from "./ast.js";

export class SpecParseError extends Error {
  readonly line: number;
  readonly column: number;
  readonly path: string | null;
  readonly span: SourceSpan;

  constructor(message: string, line: number, column: number, path?: string) {
    const location = `${path ? `${path}:` : ""}${line}:${column}`;
    super(`${location}: ${message}`);
    this.name = "SpecParseError";
    this.line = line;
    this.column = column;
    this.path = path ?? null;
    this.span = {
      start: { line, column },
      end: { line, column: column + 1 }
    };
  }
}

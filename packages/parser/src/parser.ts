import type {
  BlockNode,
  BlockShape,
  ClauseKeyword,
  ClauseNode,
  ClausePhase,
  ParseSpecOptions,
  SourcePosition,
  SourceSpan,
  SpecAst
} from "./ast.js";
import { SPEC_AST_VERSION, SPEC_GRAMMAR_NAME, SPEC_GRAMMAR_VERSION } from "./constants.js";
import { SpecParseError } from "./errors.js";

type SourceLine = {
  number: number;
  text: string;
};

type ParsedClauseLine = {
  keyword: ClauseKeyword;
  phase: ClausePhase;
  text: string;
  span: SourceSpan;
};

const CLAUSE_LINE_PATTERN = /^(Given|When|Then|And)([ \t]+)(.*)$/u;
const TITLE_LINE_PATTERN = /^Scenario:([ \t]+)(.*)$/u;

export function parseSpec(source: string, options: ParseSpecOptions = {}): SpecAst {
  const parser = new Parser(source, options.path);
  return parser.parse();
}

class Parser {
  private readonly lines: SourceLine[];
  private readonly sourcePath?: string;
  private index = 0;
  private nextBlockId = 1;

  constructor(source: string, sourcePath?: string) {
    this.lines = splitLines(source);
    this.sourcePath = sourcePath;
  }

  parse(): SpecAst {
    if (this.lines.length === 0) {
      this.failAt(1, 1, "Expected a spec block.");
    }

    const blocks: BlockNode[] = [];

    while (!this.isAtEnd()) {
      if (this.currentIsBlank()) {
        this.failCurrent("Expected a spec block.");
      }

      blocks.push(this.parseBlock());

      if (this.isAtEnd()) {
        break;
      }

      if (!this.currentIsBlank()) {
        this.failCurrent("Expected a blank line between spec blocks.");
      }

      while (!this.isAtEnd() && this.currentIsBlank()) {
        this.index += 1;
      }
    }

    return {
      kind: "spec-ast",
      version: SPEC_AST_VERSION,
      grammar: {
        name: SPEC_GRAMMAR_NAME,
        version: SPEC_GRAMMAR_VERSION
      },
      source: {
        path: this.sourcePath ?? null
      },
      blocks
    };
  }

  private parseBlock(): BlockNode {
    const blockStart = this.currentPosition();
    const comments: string[] = [];

    while (!this.isAtEnd() && isCommentLine(this.current().text)) {
      comments.push(this.current().text);
      this.index += 1;
    }

    let title: string | null = null;
    if (!this.isAtEnd() && this.current().text.startsWith("Scenario:")) {
      title = this.parseTitleLine();
      if (!this.isAtEnd() && this.currentIsBlank()) {
        this.index += 1;
      }
    }

    if (this.isAtEnd() || this.currentIsBlank()) {
      this.failAtPosition(blockStart, "Expected a spec block body.");
    }

    const firstKeyword = this.peekClauseKeyword();

    if (firstKeyword === "Given") {
      const given = this.parseGivenSection();

      if (this.peekClauseKeyword() === "When") {
        const when = this.parseWhenSection();
        const then = this.parseThenSection();
        return this.buildBlock(blockStart, "given-when-then", title, comments, given, when, then);
      }

      if (this.peekClauseKeyword() === "Then") {
        const then = this.parseThenSection();
        return this.buildBlock(blockStart, "given-then", title, comments, given, [], then);
      }

      this.failCurrentOrEnd("Expected a When or Then section after Given section.");
    }

    if (firstKeyword === "When") {
      const when = this.parseWhenSection();
      const then = this.parseThenSection();
      return this.buildBlock(blockStart, "when-then", title, comments, [], when, then);
    }

    if (firstKeyword === "Then") {
      this.failCurrent("Expected Given or When before Then.");
    }

    if (firstKeyword === "And") {
      this.failCurrent("Expected Given, When, or Then before And.");
    }

    this.failCurrent("Expected Given or When clause.");
  }

  private parseTitleLine(): string {
    const line = this.current();
    const match = TITLE_LINE_PATTERN.exec(line.text);
    if (!match) {
      this.failCurrent("Expected Scenario title in the form `Scenario: <title>`.");
    }

    const title = match[2] ?? "";
    if (title.length === 0) {
      this.failAt(line.number, line.text.length + 1, "Expected scenario title text.");
    }

    this.index += 1;
    return trimTrailingHorizontalWhitespace(title);
  }

  private parseGivenSection(): ClauseNode[] {
    return this.parseSection("Given", "given");
  }

  private parseWhenSection(): ClauseNode[] {
    return this.parseSection("When", "when");
  }

  private parseThenSection(): ClauseNode[] {
    if (this.peekClauseKeyword() !== "Then") {
      this.failCurrentOrEnd("Expected a Then section.");
    }

    return this.parseSection("Then", "then");
  }

  private parseSection(firstKeyword: "Given" | "When" | "Then", phase: ClausePhase): ClauseNode[] {
    if (this.peekClauseKeyword() !== firstKeyword) {
      this.failCurrentOrEnd(`Expected ${firstKeyword} clause.`);
    }

    const clauses = [this.parseClauseLine(phase)];

    while (!this.isAtEnd() && this.peekClauseKeyword() === "And") {
      clauses.push(this.parseClauseLine(phase));
    }

    return clauses;
  }

  private parseClauseLine(phase: ClausePhase): ClauseNode {
    const line = this.current();
    const parsed = parseClauseLine(line, phase);
    if (!parsed) {
      this.failCurrent("Expected clause in the form `<keyword> <text>`.");
    }

    if (parsed.text.length === 0) {
      this.failAt(line.number, line.text.length + 1, "Expected clause text.");
    }

    this.index += 1;
    return parsed;
  }

  private buildBlock(
    start: SourcePosition,
    shape: BlockShape,
    title: string | null,
    comments: string[],
    given: ClauseNode[],
    when: ClauseNode[],
    then: ClauseNode[]
  ): BlockNode {
    if (!this.isAtEnd() && !this.currentIsBlank()) {
      this.failCurrent("Expected a blank line after spec block.");
    }

    const lastClause = then[then.length - 1];
    if (!lastClause) {
      this.failAtPosition(start, "Expected a Then section.");
    }

    return {
      id: `block-${this.nextBlockId++}`,
      title,
      comments,
      shape,
      kind: shape === "given-then" ? "invariant" : "transition",
      given,
      when,
      then,
      span: {
        start,
        end: lastClause.span.end
      }
    };
  }

  private peekClauseKeyword(): ClauseKeyword | null {
    if (this.isAtEnd() || this.currentIsBlank()) {
      return null;
    }

    const text = this.current().text;
    if (text.startsWith("Given")) return "Given";
    if (text.startsWith("When")) return "When";
    if (text.startsWith("Then")) return "Then";
    if (text.startsWith("And")) return "And";
    return null;
  }

  private current(): SourceLine {
    const line = this.lines[this.index];
    if (!line) {
      this.failAt(this.lastLineNumber(), this.lastColumn(), "Unexpected end of file.");
    }
    return line;
  }

  private currentIsBlank(): boolean {
    return isBlankLine(this.current().text);
  }

  private currentPosition(): SourcePosition {
    return {
      line: this.current().number,
      column: 1
    };
  }

  private isAtEnd(): boolean {
    return this.index >= this.lines.length;
  }

  private lastLineNumber(): number {
    const last = this.lines[this.lines.length - 1];
    return last ? last.number : 1;
  }

  private lastColumn(): number {
    const last = this.lines[this.lines.length - 1];
    return last ? last.text.length + 1 : 1;
  }

  private failCurrent(message: string): never {
    const line = this.current();
    this.failAt(line.number, firstNonWhitespaceColumn(line.text), message);
  }

  private failCurrentOrEnd(message: string): never {
    if (this.isAtEnd()) {
      this.failAt(this.lastLineNumber(), this.lastColumn(), message);
    }

    this.failCurrent(message);
  }

  private failAtPosition(position: SourcePosition, message: string): never {
    this.failAt(position.line, position.column, message);
  }

  private failAt(line: number, column: number, message: string): never {
    throw new SpecParseError(message, line, column, this.sourcePath);
  }
}

function splitLines(source: string): SourceLine[] {
  if (source.length === 0) {
    return [];
  }

  const lines: SourceLine[] = [];
  const pattern = /([^\r\n]*)(\r\n|\n|\r|$)/gu;
  let lineNumber = 1;

  for (const match of source.matchAll(pattern)) {
    const text = match[1] ?? "";
    const lineEnding = match[2] ?? "";
    if (lineEnding === "" && text === "") {
      break;
    }

    lines.push({ number: lineNumber, text });
    lineNumber += 1;
  }

  return lines;
}

function parseClauseLine(line: SourceLine, phase: ClausePhase): ParsedClauseLine | null {
  const match = CLAUSE_LINE_PATTERN.exec(line.text);
  if (!match) {
    return null;
  }

  const keyword = match[1] as ClauseKeyword;
  const separator = match[2] ?? "";
  const rawText = match[3] ?? "";
  const text = trimTrailingHorizontalWhitespace(rawText);

  return {
    keyword,
    phase,
    text,
    span: {
      start: {
        line: line.number,
        column: 1
      },
      end: {
        line: line.number,
        column: keyword.length + separator.length + text.length + 1
      }
    }
  };
}

function isBlankLine(text: string): boolean {
  return /^[ \t]*$/u.test(text);
}

function isCommentLine(text: string): boolean {
  return /^[ \t]*#/u.test(text);
}

function trimTrailingHorizontalWhitespace(text: string): string {
  return text.replace(/[ \t]+$/u, "");
}

function firstNonWhitespaceColumn(text: string): number {
  const match = /[^ \t]/u.exec(text);
  return match ? match.index + 1 : 1;
}

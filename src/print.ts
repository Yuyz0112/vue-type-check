import { Range } from "vscode-languageserver";
import chalk from "chalk";

interface Lines {
  start: number;
  end: number;
  total: number;
}

interface RawLine {
  number: number;
  code: string;
  isError?: boolean;
  isCursor?: boolean;
}

const THRESHOLD = 2;

export function getLines({ start, end, total }: Lines) {
  const min = Math.max(start - THRESHOLD, 0);
  const max = Math.min(end + THRESHOLD, total);
  const lines = [];
  for (let i = min; i <= max; i++) {
    lines.push(i);
  }
  return lines;
}

export function formatLine({ number, code, isError, isCursor }: RawLine) {
  const length = String(number).length;
  return [
    isError ? chalk.red(">") : " ",
    isCursor ? " ".repeat(length) : number,
    "|",
    code
  ].join(" ");
}

export function formatCursor(range: Range) {
  const isSameLine = range.end.line === range.start.line;
  const length = isSameLine ? range.end.character - range.start.character : 1;

  return formatLine({
    number: range.start.line,
    isCursor: true,
    isError: false,
    code: " ".repeat(range.start.character) + chalk.red("^").repeat(length)
  });
}

export function printError(msg: string) {
  return console.log(chalk.red(msg));
}

export function printMessage(msg: string) {
  return console.log(chalk.gray(msg));
}

export function printLog(msg: string) {
  return console.log(msg);
}

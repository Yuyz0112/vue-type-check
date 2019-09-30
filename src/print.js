const THRESHOLD = 2;

function getLines({ start, end, total }) {
  const min = Math.max(start - THRESHOLD, 0);
  const max = Math.min(end + THRESHOLD, total);
  const lines = [];
  for (let i = min; i <= max; i++) {
    lines.push(i);
  }
  return lines;
}

function formatLine({ number, code, isError, isCursor }) {
  const length = String(number).length;
  return [
    isError ? ">" : " ",
    isCursor ? " ".repeat(length) : number,
    "|",
    code
  ].join(" ");
}

function formatCursor(range) {
  const isSameLine = range.end.line === range.start.line;
  const length = isSameLine ? range.end.character - range.start.character : 1;

  return formatLine({
    number: range.start.line,
    isCursor: true,
    isError: false,
    code: " ".repeat(range.start.character) + "^".repeat(length)
  });
}

module.exports = {
  getLines,
  formatLine,
  formatCursor
};

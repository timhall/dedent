interface LikeTemplateStringsArray {
  raw: readonly string[];
}

export default function dedent(
  strings: string | string[] | LikeTemplateStringsArray | TemplateStringsArray,
  ...values: string[]
): string {
  const raw =
    typeof strings === 'string'
      ? [strings]
      : isTemplateStringsArray(strings)
      ? strings.raw
      : strings;

  // Handle template string formatting (backticks, \ line endings)
  const formatted = raw.map((part) => pipeline(part, unescapeBackticks, joinSuppressedNewline));

  // Find minimum indentation of template strings
  const groupedLines = formatted.map((part) => part.split(/\r?\n/));
  const minimumIndentation = Math.min(
    ...flat(groupedLines).map((line, index) => {
      const leadingSpaces = line.match(/^(\s+)\S+/);
      return leadingSpaces ? leadingSpaces[1].length : Infinity;
    })
  );
  const shouldDedent = minimumIndentation > 0 && minimumIndentation < Infinity;

  const combined = groupedLines.reduce((memo, lines, groupIndex) => {
    const unindented = lines
      .map((line, lineIndex) => {
        // First line may be unindented, still may unindent remaining
        const isFirstLine = groupIndex === 0 && lineIndex === 0;
        const hasLeadingSpaces = !!line.match(/^(\s+)\S+/);
        const isUnindented = isFirstLine && !hasLeadingSpaces;

        return shouldDedent && !isUnindented ? line.slice(minimumIndentation) : line;
      })
      .join('\n');

    memo += unindented;
    if (groupIndex < values.length) memo += values[groupIndex];

    return memo;
  }, '');

  return pipeline(combined, trim, unescapeNewlines);
}

function isTemplateStringsArray(
  value: any
): value is LikeTemplateStringsArray | TemplateStringsArray {
  return value && Array.isArray(value.raw);
}

function joinSuppressedNewline(value: string): string {
  return value.replace(/\\\n[ \t]*/g, '');
}

function unescapeBackticks(value: string): string {
  return value.replace(/\\`/g, '`');
}

function trim(value: string): string {
  return value.trim();
}

function unescapeNewlines(value: string): string {
  return value.replace(/\\n/g, '\n');
}

function pipeline<TValue>(value: TValue, ...functions: Array<(value: TValue) => TValue>): TValue {
  return functions.reduce((value, fn) => fn(value), value);
}

function flat<TValue = unknown>(values: Array<TValue[]>): TValue[] {
  return values.reduce((memo, items) => memo.concat(items), []);
}

interface TemplateStringsArray {
  raw: readonly string[];
  [key: string]: any;
}

export default function dedent(
  strings: string | string[] | TemplateStringsArray,
  ...values: string[]
): string {
  const raw =
    typeof strings === 'string'
      ? [strings]
      : isTemplateStringsArray(strings)
      ? strings.raw
      : strings;

  // Combine strings and values
  let combined = raw.reduce((memo, part, index) => {
    memo += pipeline(part, unescapeBackticks, joinSuppressedNewline);
    if (index < values.length) memo += values[index];

    return memo;
  }, '');

  // Determine minimum indentation
  const lines = combined.split('\n');
  const indentation = Math.min(
    ...lines.map(line => {
      const leading_spaces = line.match(/^(\s+)\S+/);
      return leading_spaces ? leading_spaces[1].length : Infinity;
    })
  );

  if (indentation > 0 && indentation < Infinity) {
    combined = lines.map(line => line.slice(indentation)).join('\n');
  }

  return pipeline(combined, trim, unescapeNewlines);
}

function isTemplateStringsArray(value: any): value is TemplateStringsArray {
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

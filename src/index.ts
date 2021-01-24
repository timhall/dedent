interface LikeTemplateStringsArray {
	raw: readonly string[];
}

const placeholder = `{${String.fromCharCode(32)}}`;

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
	const lines = formatted.join(placeholder).split(/\r?\n/);
	const minimumIndentation = Math.min(
		...lines.map((line) => {
			const leadingSpaces = line.match(/^(\s+)\S+/);
			return leadingSpaces ? leadingSpaces[1].length : Infinity;
		})
	);

	// Rejoin formatted lines with unindentation and placeholders
	const shouldDedent = minimumIndentation > 0 && minimumIndentation < Infinity;
	const joined = !shouldDedent
		? lines.join('\n')
		: lines
				.map((line, lineIndex) => {
					const isFirstLine = lineIndex === 0;
					const hasLeadingSpaces = !!line.match(/^(\s+)\S+/);
					const isUnindented = isFirstLine && !hasLeadingSpaces;

					return !isUnindented ? line.slice(minimumIndentation) : line;
				})
				.join('\n');

	// Replace placeholders with values
	const replaced = joined.split(placeholder).reduce((memo, part, partIndex) => {
		return memo + part + (values[partIndex] || '');
	}, '');

	return pipeline(replaced, trim, unescapeNewlines);
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

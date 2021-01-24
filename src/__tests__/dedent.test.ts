import dedent from '..';

it('works without interpolation', () => {
	expect(
		dedent`first
        second
        third`
	).toMatchSnapshot();
});

it('works with interpolation', () => {
	expect(
		dedent`first ${'line'}
        ${'second'}
        third`
	).toMatchSnapshot();
});

it('works with suppressed newlines', () => {
	expect(
		dedent`first \
        ${'second'}
        third`
	).toMatchSnapshot();
});

it('works with blank first line', () => {
	expect(dedent`
    Some text that I might want to indent:
      * reasons
      * fun
    That's all.
  `).toMatchSnapshot();
});

it('works with multiple blank first lines', () => {
	expect(
		dedent`

        first
        second
        third`
	).toMatchSnapshot();
});

it('works with removing same number of spaces', () => {
	expect(
		dedent`
        first
          second
              third
    `
	).toMatchSnapshot();
});

describe('single line input', () => {
	it('works with single line input', () => {
		expect(dedent`A single line of input.`).toMatchSnapshot();
	});

	it('works with single line and closing backtick on newline', () => {
		expect(dedent`
      A single line of input.
    `).toMatchSnapshot();
	});

	it('works with single line and inline closing backtick', () => {
		expect(dedent`
      A single line of input.`).toMatchSnapshot();
	});
});

it('can be used as a function', () => {
	expect(
		dedent(`
    A test argument.
  `)
	).toMatchSnapshot();
});

it('escapes backticks', () => {
	expect(dedent`\``).toMatchSnapshot();
});

it("doesn't strip exlicit newlines", () => {
	expect(dedent`
    <p>Hello world!</p>\n
  `).toMatchSnapshot();
});

it("doesn't strip exlicit newlines with mindent", () => {
	expect(dedent`
    <p>
      Hello world!
    </p>\n
  `).toMatchSnapshot();
});

it('does not dedent inside of interpolated values', () => {
	const value = 'a\nb\nc';
	expect(dedent`
    Not dedented:\n${value}
  `).toMatchSnapshot();
});

it('handles tabs', () => {
	expect(dedent`
				A

				B ${'C'} (${'D'}:${'E'})\n\n${'F'}
			`).toMatchSnapshot();
});

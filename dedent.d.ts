interface TemplateStringsArray {
  raw: readonly string[];
  [key: string]: any;
}

declare module '@timhall/dedent' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}

declare module '@timhall/dedent/macro' {
  export default function dedent(
    strings: string | string[] | TemplateStringsArray,
    ...values: string[]
  ): string;
}

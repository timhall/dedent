declare module 'babel-plugin-macros' {
  export default function plugin(...values: any[]): any;
  export function createMacro(macro: any, options?: any): any;

  export class MacroError {
    constructor(public message: string) {}
  }
}

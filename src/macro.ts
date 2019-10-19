import { NodePath } from '@babel/traverse';
import t, {
  ArgumentPlaceholder,
  Expression,
  JSXNamespacedName,
  SpreadElement,
  StringLiteral,
  TemplateElement,
  TemplateLiteral
} from '@babel/types';
import { createMacro, MacroError } from 'babel-plugin-macros';
import dedent from './';

export default createMacro(dedentMacro);

type Argument = Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder;

interface MacroContext {
  references: {
    default: NodePath[];
    [named: string]: NodePath[];
  };
}

function dedentMacro({ references }: MacroContext) {
  references.default.forEach(referencePath => {
    const parent_type = referencePath.parentPath.type;
    if (parent_type === 'TaggedTemplateExpression') {
      asTag(referencePath.parentPath.get('quasi') as NodePath<TemplateLiteral>);
    } else if (parent_type === 'CallExpression') {
      asFunction(referencePath.parentPath.get('arguments') as NodePath<Argument>[]);
    } else {
      throw new MacroError(
        `dedent/macro can only be used with tagged template literals or as a function call, found type of "${parent_type}".`
      );
    }
  });
}

function asTag(quasiPath: NodePath<TemplateLiteral>) {
  const originalQuasis: TemplateElement[] = quasiPath.get('quasis').map(quasi => quasi.node);
  const strings = { raw: originalQuasis.map(quasi => quasi.value.raw) };
  const expressions = quasiPath.get('expressions').map(expression => expression.node);

  // If no expressions, use string literal
  // otherwise, use template literal
  let replacement: StringLiteral | TemplateLiteral;
  if (!expressions.length) {
    replacement = t.stringLiteral(dedent(strings));
  } else {
    const EXPRESSION = '---EXPR---';

    const originalQuasis = quasiPath.get('quasis').map(quasi => quasi.node);
    const expressions = quasiPath.get('expressions').map(expression => expression.node);

    const strings = { raw: originalQuasis.map(quasi => quasi.value.raw) };
    const placeholders = expressions.map(() => EXPRESSION);
    const result = dedent(strings, ...placeholders);

    const quasis = result.split(EXPRESSION).map((value, index) => {
      return t.templateElement({ raw: value, cooked: value }, originalQuasis[index].tail);
    });

    replacement = t.templateLiteral(quasis, expressions);
  }

  quasiPath.parentPath.replaceWith(replacement);
}

function asFunction(argumentsPaths: NodePath<Argument>[]) {
  const string = argumentsPaths[0].evaluate().value;

  argumentsPaths[0].parentPath.replaceWith(t.stringLiteral(dedent(string)));
}

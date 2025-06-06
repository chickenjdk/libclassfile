/// @ts-nocheck
import {
  Application,
  DeclarationReflection,
  ReflectionKind,
  Converter,
  Context,
  Reflection,
  Type,
  ReferenceType,
  ReflectionGroup,
  SomeType,
  ReflectionType,
  LiteralType,
} from "typedoc";
import ts from "typescript";
import { getReflectionGroups } from "./groupPlugin";
const typeCapture = new Map<DeclarationReflection, SomeType>();

function typeNodeHasTypeArguments(node: ts.TypeNode): boolean {
  let hasGenerics = false;

  function visit(n: ts.Node) {
    if (ts.isTypeReferenceNode(n) && n.typeArguments?.length) {
      hasGenerics = true;
    }
    ts.forEachChild(n, visit);
  }

  visit(node);
  return hasGenerics;
}

function isGenericTypeAlias(symbol: ts.Symbol): boolean {
  const decl = symbol.declarations?.[0];
  return ts.isTypeAliasDeclaration(decl) && !!decl.typeParameters?.length;
}

function isSelfReferentialAlias(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
  seen = new Set<ts.Symbol>()
): boolean {
  if (
    !symbol.declarations?.[0] ||
    !ts.isTypeAliasDeclaration(symbol.declarations[0])
  )
    return false;

  const declaration = symbol.declarations[0] as ts.TypeAliasDeclaration;

  // Avoid infinite loops
  if (seen.has(symbol)) return true;
  seen.add(symbol);

  const node = declaration.type;

  let found = false;

  function visit(n: ts.Node) {
    if (ts.isTypeReferenceNode(n)) {
      const targetSymbol = checker.getSymbolAtLocation(n.typeName);
      if (!targetSymbol) return;

      if (targetSymbol === symbol) {
        found = true;
        return;
      }

      const targetDecl = targetSymbol.declarations?.[0];
      if (targetDecl && ts.isTypeAliasDeclaration(targetDecl)) {
        if (isSelfReferentialAlias(targetSymbol, checker, new Set(seen))) {
          found = true;
          return;
        }
      }
    }

    if (!found) ts.forEachChild(n, visit);
  }

  visit(node);
  return found;
}

function flattenTypeAliasReflection(reflection: DeclarationReflection) {
  if (reflection.type?.type === "reflection" && reflection.type.declaration) {
    const inlineDecl = reflection.type.declaration;

    // Copy children from nested inline declaration to the alias reflection
    reflection.children = inlineDecl.children ?? [];

    // Copy groups (e.g. "Properties" group) from nested inline declaration
    reflection.groups = inlineDecl.groups ?? [];

    // Optionally clear the type to avoid showing alias form
    reflection.type = undefined;
  }
}

export function load(app: Application) {
  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    (context: Context, reflection: Reflection) => {
      if (
        reflection.kind === ReflectionKind.TypeAlias ||
        reflection.kind === ReflectionKind.Class ||
        reflection.kind === ReflectionKind.Interface
      ) {
        const checker = context.program.getTypeChecker();

        const symbol = context.getSymbolFromReflection(reflection);
        if (!symbol) {
          console.log("No symbol");
          return;
        }
        if (!typeNodeHasTypeArguments(symbol.declarations[0])) {
          // Don't resolve something with nothing we want to resolve
          return;
        }
        if (
          isSelfReferentialAlias(symbol, checker) &&
          isGenericTypeAlias(symbol)
        ) {
          // Don't resolve self-referential aliases that are generic themselves
          // Don't resolve Expand but do resolve things that use Expand, like record
          return;
        }
        const tsType = checker.getDeclaredTypeOfSymbol(symbol);

        const converted = context.converter.convertType(context, tsType);
        typeCapture.set(reflection, converted);
      }
    }
  );
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context: Context) => {
    for (const reflection of context.project.getReflectionsByKind(
      ReflectionKind.TypeAlias | ReflectionKind.Class | ReflectionKind.Interface
    )) {
      if (typeCapture.has(reflection)) {
        const docType = typeCapture.get(reflection);
        reflection.type = docType;
        reflection.type.declaration ??= docType;
      }
    }
  });

  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    for (const reflection of context.project.getReflectionsByKind(
      ReflectionKind.TypeAlias | ReflectionKind.Class | ReflectionKind.Interface
    )) {
      flattenTypeAliasReflection(reflection);
    }
  });
}

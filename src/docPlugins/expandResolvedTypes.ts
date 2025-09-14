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
  ReflectionType,
} from "typedoc";
import ts from "typescript";

const typeCapture = new Map<DeclarationReflection, Type>();

function typeNodeHasTypeArguments(node: ts.TypeNode): boolean {
  let hasGenerics = false;
  function visit(n: ts.Node) {
    if (ts.isTypeReferenceNode(n) && n.typeArguments?.length)
      hasGenerics = true;
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
  if (seen.has(symbol)) return true;
  seen.add(symbol);

  const decl = symbol.declarations[0] as ts.TypeAliasDeclaration;
  let found = false;

  function visit(node: ts.Node) {
    if (ts.isTypeReferenceNode(node)) {
      const target = checker.getSymbolAtLocation(node.typeName);
      if (!target) return;
      if (target === symbol) {
        found = true;
        return;
      }
      if (
        target.declarations?.[0] &&
        ts.isTypeAliasDeclaration(target.declarations[0])
      ) {
        if (isSelfReferentialAlias(target, checker, new Set(seen)))
          found = true;
      }
    }
    if (!found) ts.forEachChild(node, visit);
  }

  visit(decl.type);
  return found;
}

function deepResolve(
  type: Type,
  context: Context,
  seen = new Set<Type>()
): Type {
  if (!type || seen.has(type)) return type;
  seen.add(type);

  switch (type.type) {
    case "reference":
      if (type.reflection && type.reflection.type) {
        type.reflection.type = deepResolve(type.reflection.type, context, seen);
      }
      break;
    case "array":
      type.elementType = deepResolve(type.elementType, context, seen);
      break;
    case "union":
    case "intersection":
      type.types = type.types.map((t) => deepResolve(t, context, seen));
      break;
    case "reflection":
      if (type.declaration) {
        type.declaration.type = type.declaration.type
          ? deepResolve(type.declaration.type, context, seen)
          : undefined;
        type.declaration.signatures?.forEach((sig) => {
          sig.parameters?.forEach((p) => {
            if (p.type) p.type = deepResolve(p.type, context, seen);
          });
          if (sig.type) sig.type = deepResolve(sig.type, context, seen);
        });
      }
      break;
  }
  return type;
}

function flattenTypeAliasReflection(reflection: DeclarationReflection) {
  if (reflection.type?.type === "reflection" && reflection.type.declaration) {
    const decl = reflection.type.declaration;
    reflection.children = decl.children ?? [];
    reflection.groups = decl.groups ?? [];
    reflection.type = undefined;
  }
}

function isTypeCircular(
  alias: DeclarationReflection,
  type: Type,
  seen = new Set<Type>()
): boolean {
  if (!type || seen.has(type)) return false;
  seen.add(type);

  switch (type.type) {
    case "reference":
      // Reference to the same reflection counts as circular
      if (type.reflection === alias) return true;
      if (type.reflection?.type)
        return isTypeCircular(alias, type.reflection.type, seen);
      break;
    case "array":
      return isTypeCircular(alias, type.elementType, seen);
    case "union":
    case "intersection":
      return type.types.some((t) => isTypeCircular(alias, t, seen));
    case "reflection":
      if (type.declaration) {
        if (type.declaration === alias) return true;
        if (
          type.declaration.type &&
          isTypeCircular(alias, type.declaration.type, seen)
        )
          return true;
        if (
          type.declaration.signatures?.some(
            (sig) =>
              (sig.type && isTypeCircular(alias, sig.type, seen)) ||
              sig.parameters?.some(
                (p) => p.type && isTypeCircular(alias, p.type, seen)
              )
          )
        )
          return true;
      }
      break;
  }
  return false;
}

export function load(app: Application) {
  // Capture types at declaration creation
  app.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    (context: Context, reflection: Reflection) => {
      if (
        reflection.kind &
        (ReflectionKind.TypeAlias |
          ReflectionKind.Class |
          ReflectionKind.Interface)
      ) {
        const checker = context.program.getTypeChecker();
        const symbol = context.getSymbolFromReflection(reflection);
        if (!symbol) return;
        if (!typeNodeHasTypeArguments(symbol.declarations[0])) return;
        if (
          isSelfReferentialAlias(symbol, checker) &&
          isGenericTypeAlias(symbol)
        )
          return;

        const tsType = checker.getDeclaredTypeOfSymbol(symbol);
        const converted = context.converter.convertType(context, tsType);
        typeCapture.set(reflection as DeclarationReflection, converted);
      }
    }
  );

  // Apply captured types at resolve begin
  app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context: Context) => {
    for (const reflection of context.project.getReflectionsByKind(
      ReflectionKind.TypeAlias | ReflectionKind.Class | ReflectionKind.Interface
    )) {
      const aliasReflection = reflection as DeclarationReflection;
      const resolved = typeCapture.get(aliasReflection);
      if (!resolved) continue;

      // Only replace if it’s not circular
      if (!isTypeCircular(aliasReflection, resolved)) {
        aliasReflection.type = deepResolve(resolved, context);
      }
    }
  });

  // Flatten inline type alias reflections
  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    for (const reflection of context.project.getReflectionsByKind(
      ReflectionKind.TypeAlias | ReflectionKind.Class | ReflectionKind.Interface
    )) {
      flattenTypeAliasReflection(reflection as DeclarationReflection);
    }
  });
}

import {
  BaseTypeName,
  ClassType,
  TypeArgument,
  FieldDescriptor,
  MethodDescriptor,
  FieldTypeSignature,
  TypeSignature,
  MethodTypeSignature,
  ClassSignature,
  TypeParameter,
  DescriptorAST,
  SignatureAST,
} from "./types.js";

// ---------------- utility maps ----------------
const codeByBase: Record<BaseTypeName, string> = {
  byte: "B",
  char: "C",
  double: "D",
  float: "F",
  int: "I",
  long: "J",
  short: "S",
  boolean: "Z",
};

// ---------------- DESCRIPTOR assembly ----------------
export function writeFieldDescriptor(t: FieldDescriptor): string {
  if (t.kind === "base") return codeByBase[t.name];
  if (t.kind === "classType")
    return "L" + writeInternalNameFromClassType(t) + ";";
  if (t.kind === "array")
    return "[" + writeFieldDescriptor(t.element as FieldDescriptor);
  throw new Error(`Unknown field descriptor kind ${(t as any).kind}`);
}

export function writeMethodDescriptor(m: MethodDescriptor): string {
  let out = "(";
  for (const p of m.parameters) out += writeFieldDescriptor(p);
  out += ")";
  if (m.returnType.kind === "void") out += "V";
  else out += writeFieldDescriptor(m.returnType as FieldDescriptor);
  return out;
}

// Helper for object internal name from ClassType (descriptors don't carry generics)
function writeInternalNameFromClassType(t: ClassType): string {
  // packageAndOuter already: package + outer simple
  // inner classes in descriptors are encoded with '$' usually; but the Signature grammar uses '.' between inners.
  // We will emit $-joined simple names for inners to build a binary name, suitable for descriptors.
  const lastSlash = t.packageAndOuter.lastIndexOf("/");
  const pkg = lastSlash >= 0 ? t.packageAndOuter.slice(0, lastSlash) : "";
  const outer =
    lastSlash >= 0 ? t.packageAndOuter.slice(lastSlash + 1) : t.packageAndOuter;
  const simple = [
    outer,
    ...t.simpleNames.slice(1).map((s) => s.identifier),
  ].join("$");
  return pkg ? pkg + "/" + simple : simple;
}

// ---------------- SIGNATURE assembly (generics) ----------------
export function writeFieldTypeSignature(t: FieldTypeSignature): string {
  if (t.kind === "classType") return writeClassTypeSignature(t);
  if (t.kind === "typeVar") return "T" + t.name + ";";
  if (t.kind === "array") return "[" + writeTypeSignature(t.element);
  throw new Error(`Unknown FieldTypeSignature kind ${(t as any).kind}`);
}

export function writeTypeSignature(t: TypeSignature): string {
  if (t.kind === "base") return codeByBase[t.name];
  if (t.kind === "void") return "V";
  return writeFieldTypeSignature(t as FieldTypeSignature);
}

export function writeMethodTypeSignature(m: MethodTypeSignature): string {
  let out = "";
  if (m.typeParameters && m.typeParameters.length)
    out += writeTypeParameters(m.typeParameters);
  out += "(";
  for (const p of m.parameters) out += writeTypeSignature(p);
  out += ")";
  out += writeTypeSignature(m.returnType);
  if (m.throws)
    for (const t of m.throws) {
      out += "^";
      if (t.kind === "classType") out += writeClassTypeSignature(t);
      else if (t.kind === "typeVar") out += "T" + t.name + ";";
      else throw new Error("Invalid throws entry");
    }
  return out;
}

export function writeClassSignature(c: ClassSignature): string {
  let out = "";
  if (c.typeParameters && c.typeParameters.length)
    out += writeTypeParameters(c.typeParameters);
  out += writeClassTypeSignature(c.superClass);
  for (const si of c.superInterfaces) out += writeClassTypeSignature(si);
  return out;
}

function writeTypeParameters(params: TypeParameter[]): string {
  let out = "<";
  for (const p of params) {
    out += p.name + ":";
    if (p.classBound) out += writeFieldTypeSignature(p.classBound);
    if (p.interfaceBounds)
      for (const ib of p.interfaceBounds)
        out += ":" + writeFieldTypeSignature(ib);
  }
  out += ">";
  return out;
}

function writeClassTypeSignature(t: ClassType): string {
  let out = "L";
  const lastSlash = t.packageAndOuter.lastIndexOf("/");
  const pkg = lastSlash >= 0 ? t.packageAndOuter.slice(0, lastSlash) : "";
  const outer =
    lastSlash >= 0 ? t.packageAndOuter.slice(lastSlash + 1) : t.packageAndOuter;
  if (pkg) out += pkg + "/";
  out += outer;
  // type args on outer
  if (t.simpleNames[0]?.typeArguments?.length)
    out += writeTypeArguments(t.simpleNames[0].typeArguments);
  // inner classes separated by '.' with their own type args
  for (let i = 1; i < t.simpleNames.length; i++) {
    const sn = t.simpleNames[i];
    out += "." + sn.identifier;
    if (sn.typeArguments?.length)
      out += writeTypeArguments(sn.typeArguments);
  }
  out += ";";
  return out;
}

function writeTypeArguments(args: TypeArgument[]): string {
  let out = "<";
  for (const a of args) {
    if ((a as any).kind === "wildcard") out += "*";
    else if ((a as any).kind === "extends")
      out += "+" + writeFieldTypeSignature((a as any).type);
    else if ((a as any).kind === "super")
      out += "-" + writeFieldTypeSignature((a as any).type);
    else if ((a as any).kind === "arg")
      out += writeFieldTypeSignature((a as any).type);
    else throw new Error(`Unknown type arg ${(a as any).kind}`);
  }
  out += ">";
  return out;
}

// ---------------- Convenience APIs ----------------
export function writeDescriptor(ast: DescriptorAST): string {
  return (ast as any).kind === "methodDescriptor"
    ? writeMethodDescriptor(ast as MethodDescriptor)
    : writeFieldDescriptor(ast as FieldDescriptor);
}

export function writeSignature(ast: SignatureAST): string {
  if ((ast as any).kind === "methodSignature")
    return writeMethodTypeSignature(ast as MethodTypeSignature);
  if ((ast as any).kind === "classSignature")
    return writeClassSignature(ast as ClassSignature);
  return writeTypeSignature(ast as TypeSignature);
}

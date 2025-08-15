// jvm-signature-parser.ts
// Parsing utilities for JVM Descriptors (§4.3.2–§4.3.3) and Signatures (§4.7.9.1)
// Depends on types from jvm-signature-types.ts

import {
  BaseType,
  BaseTypeName,
  VoidType,
  ArrayType,
  ClassType,
  SimpleClassType,
  TypeArgument,
  FieldDescriptor,
  MethodDescriptor,
  FieldTypeSignature,
  TypeSignature,
  MethodTypeSignature,
  ClassSignature,
  TypeParameter,
  TypeVariable,
  DescriptorAST,
  SignatureAST,
} from './types';

// ---------------- utility maps ----------------
const baseByCode: Record<string, BaseTypeName> = {
  B: 'byte',
  C: 'char',
  D: 'double',
  F: 'float',
  I: 'int',
  J: 'long',
  S: 'short',
  Z: 'boolean',
};
const codeByBase: Record<BaseTypeName, string> = Object.fromEntries(
  Object.entries(baseByCode).map(([k, v]) => [v as BaseTypeName, k])
) as any;

// ---------------- low-level cursor ----------------
class Cursor {
  s: string;
  i: number = 0;
  constructor(s: string) { this.s = s; }
  peek(): string | null { return this.i < this.s.length ? this.s[this.i] : null; }
  take(): string { if (this.i >= this.s.length) throw new Error(`Unexpected end at ${this.i}`); return this.s[this.i++]; }
  expect(ch: string) { const g = this.take(); if (g !== ch) throw new Error(`Expected '${ch}' but got '${g}' @${this.i-1}`); }
  done(): boolean { return this.i >= this.s.length; }
}

// ---------------- shared helpers ----------------
function parseBaseType(c: Cursor): BaseType { const ch = c.take(); const name = baseByCode[ch]; if (!name) throw new Error(`Not a base type code '${ch}'`); return { kind: 'base', name }; }
function parseVoid(c: Cursor): VoidType { c.expect('V'); return { kind: 'void' }; }

function isIdentTerminator(ch: string | null): boolean {
  return ch === null || ch === '/' || ch === ';' || ch === '<' || ch === '>' || ch === ':' || ch === '.' || ch === ')' || ch === '(' || ch === '^' || ch === '[' || ch === ']';
}
function parseIdentifier(c: Cursor): string { let s = ''; while (!isIdentTerminator(c.peek())) s += c.take(); if (!s) throw new Error(`Expected identifier @${c.i}`); return s; }
function parseUntil(c: Cursor, delim: string): string { let s = ''; while (c.peek() !== null && c.peek() !== delim) s += c.take(); return s; }

// ---------------- DESCRIPTOR parsing (no generics) ----------------
export function parseFieldDescriptor(desc: string): FieldDescriptor {
  const c = new Cursor(desc);
  const ty = parseFieldDescriptorInner(c);
  if (!c.done()) throw new Error('Trailing characters in field descriptor');
  return ty;
}
function parseFieldDescriptorInner(c: Cursor): FieldDescriptor {
  const ch = c.peek();
  if (!ch) throw new Error('EOF in field descriptor');
  if ('BCDFIJSZ'.includes(ch)) return parseBaseType(c);
  if (ch === 'L') return parseObjectTypeDescriptor(c);
  if (ch === '[') { c.take(); return { kind: 'array', element: parseFieldDescriptorInner(c) } as ArrayType<FieldDescriptor>; }
  throw new Error(`Unexpected char '${ch}' in field descriptor`);
}
function parseObjectTypeDescriptor(c: Cursor): ClassType {
  c.expect('L');
  // read until ';'
  const body = parseUntil(c, ';');
  c.expect(';');
  // body is internal name, may contain '$' for inners; we normalize to packageAndOuter + simpleNames
  const lastSlash = body.lastIndexOf('/');
  const packagePart = lastSlash >= 0 ? body.slice(0, lastSlash) : '';
  const simplePath = lastSlash >= 0 ? body.slice(lastSlash + 1) : body;
  // split '$' as inner markers if present
  const simpleNames: SimpleClassType[] = simplePath.split('$').map((id) => ({ identifier: id }));
  const packageAndOuter = packagePart ? packagePart + '/' + simpleNames[0].identifier : simpleNames[0].identifier;
  return { kind: 'classType', packageAndOuter, simpleNames };
}

export function parseMethodDescriptor(desc: string): MethodDescriptor {
  const c = new Cursor(desc);
  c.expect('(');
  const params: FieldDescriptor[] = [];
  while (c.peek() !== ')') params.push(parseFieldDescriptorInner(c));
  c.expect(')');
  let returnType: FieldDescriptor | VoidType;
  if (c.peek() === 'V') returnType = parseVoid(c); else returnType = parseFieldDescriptorInner(c);
  if (!c.done()) throw new Error('Trailing characters in method descriptor');
  return { kind: 'methodDescriptor', parameters: params, returnType };
}

// ---------------- SIGNATURE parsing (generics) ----------------
export function parseFieldTypeSignature(sig: string): FieldTypeSignature {
  const c = new Cursor(sig);
  const t = parseFieldOrArrayTypeSignature(c);
  if (!c.done()) throw new Error('Trailing characters after field type signature');
  return t;
}

export function parseMethodTypeSignature(sig: string): MethodTypeSignature {
  const c = new Cursor(sig);
  const m = parseMethodTypeSignatureInner(c);
  if (!c.done()) throw new Error('Trailing characters after method type signature');
  return m;
}

export function parseClassSignature(sig: string): ClassSignature {
  const c = new Cursor(sig);
  const cs = parseClassSignatureInner(c);
  if (!c.done()) throw new Error('Trailing characters after class signature');
  return cs;
}

// ---- internals for signatures ----
function parseTypeSignatureInner(c: Cursor): TypeSignature {
  const ch = c.peek();
  if (!ch) throw new Error('EOF in type signature');
  if ('BCDFIJSZ'.includes(ch)) return parseBaseType(c);
  if (ch === 'V') return parseVoid(c);
  return parseFieldOrArrayTypeSignature(c);
}

function parseFieldOrArrayTypeSignature(c: Cursor): FieldTypeSignature {
  const ch = c.peek();
  if (ch === '[') { 
    c.take(); 
    const element = parseTypeSignatureInner(c);
    if (element.kind !== 'base' && element.kind !== 'classType' && element.kind !== 'typeVar') {
      throw new Error(`Invalid array element type '${element.kind}'`);
    }
    return { kind: 'array', element } as ArrayType<BaseType | ClassType | TypeVariable>; 
  }
  if (ch === 'T') { c.take(); const name = parseUntil(c, ';'); c.expect(';'); return { kind: 'typeVar', name }; }
  if (ch === 'L') return parseClassTypeSignature(c);
  throw new Error(`Unexpected start '${ch}' in field/signature type`);
}

function parseClassTypeSignature(c: Cursor): ClassType {
  // L pkg/.../Outer [<args>] ( . Inner [<args>] )* ;
  c.expect('L');
  // Accumulate until '.', ';', or '<' to get package + outer simple
  let pkgAndOuter = '';
  while (true) {
    const ch = c.peek();
    if (ch === null) throw new Error('EOF in class type');
    if (ch === '.' || ch === ';' || ch === '<') break;
    pkgAndOuter += c.take();
  }
  const lastSlash = pkgAndOuter.lastIndexOf('/');
  const outerSimple = lastSlash >= 0 ? pkgAndOuter.slice(lastSlash + 1) : pkgAndOuter;
  const packagePart = lastSlash >= 0 ? pkgAndOuter.slice(0, lastSlash) : '';

  const simpleNames: SimpleClassType[] = [{ identifier: outerSimple }];
  if (c.peek() === '<') simpleNames[0].typeArguments = parseTypeArguments(c);
  while (c.peek() === '.') {
    c.take();
    const id = parseIdentifier(c);
    const sct: SimpleClassType = { identifier: id };
    if (c.peek() === '<') sct.typeArguments = parseTypeArguments(c);
    simpleNames.push(sct);
  }
  c.expect(';');
  const packageAndOuter = packagePart ? packagePart + '/' + outerSimple : outerSimple;
  return { kind: 'classType', packageAndOuter, simpleNames };
}

function parseTypeArguments(c: Cursor): TypeArgument[] {
  const out: TypeArgument[] = [];
  c.expect('<');
  while (c.peek() !== '>') out.push(parseTypeArgument(c));
  c.expect('>');
  return out;
}
function parseTypeArgument(c: Cursor): TypeArgument {
  const ch = c.peek();
  if (ch === '*') { c.take(); return { kind: 'wildcard', tag: '*' }; }
  if (ch === '+') { c.take(); return { kind: 'extends', type: parseFieldOrArrayTypeSignature(c) }; }
  if (ch === '-') { c.take(); return { kind: 'super', type: parseFieldOrArrayTypeSignature(c) }; }
  return { kind: 'arg', type: parseFieldOrArrayTypeSignature(c) };
}

function parseTypeParameters(c: Cursor): TypeParameter[] {
  const out: TypeParameter[] = [];
  c.expect('<');
  while (c.peek() !== '>') out.push(parseTypeParameter(c));
  c.expect('>');
  return out;
}
function parseTypeParameter(c: Cursor): TypeParameter {
  const name = parseIdentifier(c);
  // class bound
  c.expect(':');
  let classBound: FieldTypeSignature | undefined = undefined;
  if (c.peek() !== ':') classBound = parseFieldOrArrayTypeSignature(c);
  const interfaceBounds: FieldTypeSignature[] = [];
  while (c.peek() === ':') { c.take(); interfaceBounds.push(parseFieldOrArrayTypeSignature(c)); }
  return { name, classBound, interfaceBounds: interfaceBounds.length ? interfaceBounds : undefined };
}

function parseMethodTypeSignatureInner(c: Cursor): MethodTypeSignature {
  const res: MethodTypeSignature = { kind: 'methodSignature', parameters: [], returnType: { kind: 'void' } };
  if (c.peek() === '<') res.typeParameters = parseTypeParameters(c);
  c.expect('(');
  while (c.peek() !== ')') res.parameters.push(parseTypeSignatureInner(c));
  c.expect(')');
  res.returnType = parseTypeSignatureInner(c);
  const thr: (ClassType | TypeVariable)[] = [];
  while (c.peek() === '^') {
    c.take();
    const p = c.peek();
    if (p === 'T') { c.take(); const name = parseUntil(c, ';'); c.expect(';'); thr.push({ kind: 'typeVar', name }); }
    else if (p === 'L') thr.push(parseClassTypeSignature(c));
    else throw new Error(`Invalid throws start '${p}'`);
  }
  if (thr.length) res.throws = thr;
  return res;
}

function parseClassSignatureInner(c: Cursor): ClassSignature {
  const res: ClassSignature = { kind: 'classSignature', superClass: undefined as any, superInterfaces: [] };
  if (c.peek() === '<') res.typeParameters = parseTypeParameters(c);
  res.superClass = parseClassTypeSignature(c);
  while (c.peek() === 'L') res.superInterfaces.push(parseClassTypeSignature(c));
  return res;
}

// ---------------- Convenience discriminated unions ----------------
export function parseDescriptor(desc: string): DescriptorAST {
  if (!desc.startsWith('(')) return parseFieldDescriptor(desc);
  return parseMethodDescriptor(desc);
}
export function parseSignatureAny(sig: string): SignatureAST {
  // If it starts with '(' or '<' (and later a ')') it's a method signature; otherwise try class then type
  if (sig.startsWith('(') || sig.startsWith('<')) {
    // method signature must contain ')'
    if (sig.includes(')')) return parseMethodTypeSignature(sig);
  }
  // try class signature (may start with '<')
  try { return parseClassSignature(sig); } catch {}
  // else treat as type signature
  return parseFieldTypeSignature(sig) as SignatureAST;
}

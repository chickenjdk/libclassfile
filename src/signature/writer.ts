// jvm-signature-assembler.ts
// Assembler utilities for JVM Descriptors and Signatures, mirroring the parser.

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
  const codeByBase: Record<BaseTypeName, string> = {
    byte: 'B', char: 'C', double: 'D', float: 'F', int: 'I', long: 'J', short: 'S', boolean: 'Z'
  };
  
  // ---------------- DESCRIPTOR assembly ----------------
  export function assembleFieldDescriptor(t: FieldDescriptor): string {
    if (t.kind === 'base') return codeByBase[t.name];
    if (t.kind === 'classType') return 'L' + assembleInternalNameFromClassType(t) + ';';
    if (t.kind === 'array') return '[' + assembleFieldDescriptor(t.element as FieldDescriptor);
    throw new Error(`Unknown field descriptor kind ${(t as any).kind}`);
  }
  
  export function assembleMethodDescriptor(m: MethodDescriptor): string {
    let out = '(';
    for (const p of m.parameters) out += assembleFieldDescriptor(p);
    out += ')';
    if (m.returnType.kind === 'void') out += 'V'; else out += assembleFieldDescriptor(m.returnType as FieldDescriptor);
    return out;
  }
  
  // Helper for object internal name from ClassType (descriptors don't carry generics)
  function assembleInternalNameFromClassType(t: ClassType): string {
    // packageAndOuter already: package + outer simple
    // inner classes in descriptors are encoded with '$' usually; but the Signature grammar uses '.' between inners.
    // We will emit $-joined simple names for inners to build a binary name, suitable for descriptors.
    const lastSlash = t.packageAndOuter.lastIndexOf('/');
    const pkg = lastSlash >= 0 ? t.packageAndOuter.slice(0, lastSlash) : '';
    const outer = lastSlash >= 0 ? t.packageAndOuter.slice(lastSlash + 1) : t.packageAndOuter;
    const simple = [outer, ...t.simpleNames.slice(1).map(s => s.identifier)].join('$');
    return pkg ? pkg + '/' + simple : simple;
  }
  
  // ---------------- SIGNATURE assembly (generics) ----------------
  export function assembleFieldTypeSignature(t: FieldTypeSignature): string {
    if (t.kind === 'classType') return assembleClassTypeSignature(t);
    if (t.kind === 'typeVar') return 'T' + t.name + ';';
    if (t.kind === 'array') return '[' + assembleTypeSignature(t.element);
    throw new Error(`Unknown FieldTypeSignature kind ${(t as any).kind}`);
  }
  
  export function assembleTypeSignature(t: TypeSignature): string {
    if (t.kind === 'base') return codeByBase[t.name];
    if (t.kind === 'void') return 'V';
    return assembleFieldTypeSignature(t as FieldTypeSignature);
  }
  
  export function assembleMethodTypeSignature(m: MethodTypeSignature): string {
    let out = '';
    if (m.typeParameters && m.typeParameters.length) out += assembleTypeParameters(m.typeParameters);
    out += '(';
    for (const p of m.parameters) out += assembleTypeSignature(p);
    out += ')';
    out += assembleTypeSignature(m.returnType);
    if (m.throws) for (const t of m.throws) {
      out += '^';
      if (t.kind === 'classType') out += assembleClassTypeSignature(t);
      else if (t.kind === 'typeVar') out += 'T' + t.name + ';';
      else throw new Error('Invalid throws entry');
    }
    return out;
  }
  
  export function assembleClassSignature(c: ClassSignature): string {
    let out = '';
    if (c.typeParameters && c.typeParameters.length) out += assembleTypeParameters(c.typeParameters);
    out += assembleClassTypeSignature(c.superClass);
    for (const si of c.superInterfaces) out += assembleClassTypeSignature(si);
    return out;
  }
  
  function assembleTypeParameters(params: TypeParameter[]): string {
    let out = '<';
    for (const p of params) {
      out += p.name + ':';
      if (p.classBound) out += assembleFieldTypeSignature(p.classBound);
      if (p.interfaceBounds) for (const ib of p.interfaceBounds) out += ':' + assembleFieldTypeSignature(ib);
    }
    out += '>';
    return out;
  }
  
  function assembleClassTypeSignature(t: ClassType): string {
    let out = 'L';
    const lastSlash = t.packageAndOuter.lastIndexOf('/');
    const pkg = lastSlash >= 0 ? t.packageAndOuter.slice(0, lastSlash) : '';
    const outer = lastSlash >= 0 ? t.packageAndOuter.slice(lastSlash + 1) : t.packageAndOuter;
    if (pkg) out += pkg + '/';
    out += outer;
    // type args on outer
    if (t.simpleNames[0]?.typeArguments?.length) out += assembleTypeArguments(t.simpleNames[0].typeArguments);
    // inner classes separated by '.' with their own type args
    for (let i = 1; i < t.simpleNames.length; i++) {
      const sn = t.simpleNames[i];
      out += '.' + sn.identifier;
      if (sn.typeArguments?.length) out += assembleTypeArguments(sn.typeArguments);
    }
    out += ';';
    return out;
  }
  
  function assembleTypeArguments(args: TypeArgument[]): string {
    let out = '<';
    for (const a of args) {
      if ((a as any).kind === 'wildcard') out += '*';
      else if ((a as any).kind === 'extends') out += '+' + assembleFieldTypeSignature((a as any).type);
      else if ((a as any).kind === 'super') out += '-' + assembleFieldTypeSignature((a as any).type);
      else if ((a as any).kind === 'arg') out += assembleFieldTypeSignature((a as any).type);
      else throw new Error(`Unknown type arg ${(a as any).kind}`);
    }
    out += '>';
    return out;
  }
  
  // ---------------- Convenience APIs ----------------
  export function assembleDescriptor(ast: DescriptorAST): string {
    return (ast as any).kind === 'methodDescriptor'
      ? assembleMethodDescriptor(ast as MethodDescriptor)
      : assembleFieldDescriptor(ast as FieldDescriptor);
  }
  
  export function assembleSignature(ast: SignatureAST): string {
    if ((ast as any).kind === 'methodSignature') return assembleMethodTypeSignature(ast as MethodTypeSignature);
    if ((ast as any).kind === 'classSignature') return assembleClassSignature(ast as ClassSignature);
    return assembleTypeSignature(ast as TypeSignature);
  }
  
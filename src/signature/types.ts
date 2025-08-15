// jvm-signature-types.ts
// Shared AST types for JVM Descriptors (§4.3.2–4.3.3) and Signatures (§4.7.9.1)

// ----------------------------- Base primitives -----------------------------
export type BaseTypeCode = 'B' | 'C' | 'D' | 'F' | 'I' | 'J' | 'S' | 'Z';
export type BaseTypeName = 'byte' | 'char' | 'double' | 'float' | 'int' | 'long' | 'short' | 'boolean';

export type BaseType = { kind: 'base'; name: BaseTypeName };
export type VoidType = { kind: 'void' }; // only valid in method *descriptors/signatures* as return type

// ----------------------------- Reusable containers -----------------------------
export interface ArrayType<T = AnyNonVoidType> { kind: 'array'; element: T }

// ClassType for descriptors & signatures (object types); uses internal form names with '/'
export interface SimpleClassType {
  identifier: string; // simple (unqualified) class name or inner class simple name
  typeArguments?: TypeArgument[]; // only used in *signatures* (generics)
}

export interface ClassType {
  kind: 'classType';
  packageAndOuter: string; // package + outer simple name in internal form (slashes)
  simpleNames: SimpleClassType[]; // first is outer; rest are inners via '.' in signatures
}

// ----------------------------- Signatures-only nodes -----------------------------
export interface TypeVariable { kind: 'typeVar'; name: string } // TName;

export interface Wildcard { kind: 'wildcard'; tag: '*' }
export interface Extends { kind: 'extends'; type: ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable> }
export interface Super { kind: 'super'; type: ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable> }
export type TypeArgument = Wildcard | Extends | Super | { kind: 'arg'; type: ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable> };

export interface TypeParameter {
  name: string;
  classBound?: ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable>; // optional (missing => extends Object)
  interfaceBounds?: (ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable>)[]; // zero or more
}

// ----------------------------- Descriptor & Signature unions -----------------------------
// For descriptors (no generics, but arrays & class types allowed)
export type FieldDescriptor = BaseType | ClassType | ArrayType<BaseType | ClassType | ArrayType<any>>;
export interface MethodDescriptor {
  kind: 'methodDescriptor';
  parameters: FieldDescriptor[]; // no 'void' in params
  returnType: FieldDescriptor | VoidType; // return may be void
}

// For signatures (generics allowed) — now flattened to avoid circular refs
type NonVoidFieldLike = ClassType | TypeVariable | ArrayType<BaseType | ClassType | TypeVariable>;
export type FieldTypeSignature = NonVoidFieldLike;
export type TypeSignature = BaseType | FieldTypeSignature | VoidType; // 'void' only valid for method return

export interface MethodTypeSignature {
  kind: 'methodSignature';
  typeParameters?: TypeParameter[];
  parameters: TypeSignature[];
  returnType: TypeSignature; // may be 'void'
  throws?: (ClassType | TypeVariable)[];
}

export interface ClassSignature {
  kind: 'classSignature';
  typeParameters?: TypeParameter[];
  superClass: ClassType;
  superInterfaces: ClassType[];
}

export type AnyNonVoidType = BaseType | ClassType | TypeVariable | ArrayType<any>;
export type AnyType = AnyNonVoidType | VoidType;

export type SignatureAST = MethodTypeSignature | ClassSignature | TypeSignature;
export type DescriptorAST = MethodDescriptor | FieldDescriptor;

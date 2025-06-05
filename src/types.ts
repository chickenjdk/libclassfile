import { attribute, getLegalAttributes } from "./attributes/types";
import type { classInfo, PoolType, utf8Info } from "./constantPool/types";

/**
 * @private
 */
type IsSpecificNumber<T> = number extends T
  ? false
  : T extends number
  ? true
  : false;
/**
 * @private
 */
type ArrayClone<
  T extends any[],
  Ignore = never,
  N extends any[] = []
> = IsSpecificNumber<T["length"]> extends true
  ? T["length"] extends 0
    ? N
    : T extends [infer item, ...infer rest]
    ? ArrayClone<rest, Ignore, [...N, Expand<item, Ignore, false>]>
    : never
  : Expand<T[number], Ignore, false>[];
type and<A, B> = A extends true ? (B extends true ? true : false) : false;
type not<T> = T extends true ? false : true;
export type Expand<O, Ignore = never, DontIgnoreTop = true> = and<
  O extends Ignore ? true : false,
  not<DontIgnoreTop>
> extends true
  ? O
  : O extends any[]
  ? ArrayClone<O, Ignore>
  : {
      [K in keyof O]: O[K] extends string | number | symbol
        ? O[K]
        : O[K] extends any[]
        ? ArrayClone<O[K], Ignore>
        : Expand<O[K], Ignore, false>;
    };
export type flagsType =
  | accessFlags
  | innerClassAccessFlags
  | methodsAccessFlags
  | methodParametersAccessFlags
  | moduleAttributeAccessFlags
  | moduleAttributeRequiresAccessFlags
  | moduleAttributeExportsFlags
  | moduleAttributeOpensFlags;
export type expansionIgnoreList =
  | PoolType[number]
  | attribute
  | flagsType
  | flags;
export type expansionIgnoreListSafe =
  | { tag: number; index: number }
  | { name: string }
  | flagsType
  | flags;
// Access flags
export type accessFlags = {
  isPublic: boolean;
  isFinal: boolean;
  isSuper: boolean;
  isInterface: boolean;
  isAbstract: boolean;
  isAnnotation: boolean;
  isEnum: boolean;
  isModule: boolean;
};
export type innerClassAccessFlags = {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isInterface: boolean;
  isAbstract: boolean;
  isSynthetic: boolean;
  isAnnotation: boolean;
  isEnum: boolean;
};
export type methodsAccessFlags = {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isSynchronized: boolean;
  isBridge: boolean;
  isVarargs: boolean;
  isNative: boolean;
  isAbstract: boolean;
  isStrict: boolean;
  isSynthetic: boolean;
};
export type methodParametersAccessFlags = {
  isFinal: boolean;
  isSynthetic: boolean;
  isMandated: boolean;
};
export type moduleAttributeAccessFlags = {
  isOpen: boolean;
  isSynthetic: boolean;
  isMandated: boolean;
};
export type moduleAttributeRequiresAccessFlags = {
  isTransitive: boolean;
  isStaticPhase: boolean;
  isSynthetic: boolean;
  isMandated: boolean;
};
export type moduleAttributeExportsFlags = {
  isSynthetic: boolean;
  isMandated: boolean;
};
export type moduleAttributeOpensFlags = {
  isSynthetic: boolean;
  isMandated: boolean;
};

// Fields types
export type flags = {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isVolatile: boolean;
  isTransient: boolean;
  isSynthetic: boolean;
  isEnum: boolean;
};
export type fields = Expand<
  {
    flags: flags;
    name: utf8Info;
    attributes: getLegalAttributes<"field_info">;
  }[],
  expansionIgnoreList
>;
// Methods type
export type methods = Expand<
{
  accessFlags: methodsAccessFlags;
  name: utf8Info;
  descriptor: utf8Info;
  attributes: getLegalAttributes<"method_info">;
}[],
expansionIgnoreList
> ;
// Classfile type
export type classFile = {
  minorVersion: number;
  majorVersion: number;
  constantPool: PoolType;
  accessFlags: accessFlags;
  thisClass: classInfo;
  superClass: classInfo | undefined;
  interfaces: classInfo[];
  fields: fields;
  methods: methods;
  attributes: attribute[];
}
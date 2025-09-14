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

export type flagsType =
  | accessFlags
  | innerClassAccessFlags
  | methodsAccessFlags
  | methodParametersAccessFlags
  | moduleAttributeAccessFlags
  | moduleAttributeRequiresAccessFlags
  | moduleAttributeExportsFlags
  | moduleAttributeOpensFlags;

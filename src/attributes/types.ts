import type { range, Expand } from "@chickenjdk/common";
import type {
  expansionIgnoreListSafe,
  moduleAttributeOpensFlags,
} from "../types";
import type { moduleAttributeExportsFlags } from "../types";
import type { moduleAttributeRequiresAccessFlags } from "../types";
import type { moduleAttributeAccessFlags } from "../types";
import type { methodParametersAccessFlags } from "../types";
import type { innerClassAccessFlags } from "../types";
import type { predefinedValidClassFileAttributesMap } from "../common";
import type {
  poolTags,
  findInfoTypeByTag,
  methodHandleInfo,
  loadableTags,
  moduleInfo,
  packageInfo,
} from "../constantPool/types";
import type {
  PoolType,
  integerInfo,
  floatInfo,
  longInfo,
  doubleInfo,
  stringInfo,
  classInfo,
  utf8Info,
  nameAndTypeInfo,
} from "../constantPool/types";
import { BytecodeInstruction } from "../bytecode/types";
import { ClassSignature, FieldDescriptor, FieldTypeSignature, MethodTypeSignature, SignatureAST, TypeSignature } from "../signature";

/**
 * @private
 */
export type customAssertInfoType = <expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: PoolType[number]
) => asserts entry is findInfoTypeByTag<
  expectedTag extends any[] ? expectedTag[number] : expectedTag
>;
export type makeStringUtf8Info<T extends string> = Expand<
  utf8Info & { value: T }
>;
export type constantValue = {
  name: makeStringUtf8Info<"ConstantValue">;
  known: true;
  value: integerInfo | floatInfo | longInfo | doubleInfo | stringInfo;
};
export type code = {
  name: makeStringUtf8Info<"Code">;
  known: true;
  maxStack: number;
  maxLocals: number;
  code: BytecodeInstruction[];
  exceptionTable: exceptionTable;
  attributes: attribute[];
};
// Stack map table CHICKEN POOP
//verificationTypeInfo Union stuff
export type topVariableInfo = { tag: 0 };
export type integerVariableInfo = { tag: 1 };
export type floatVariableInfo = { tag: 2 };
export type nullVariableInfo = { tag: 5 };
export type uninitializedthisVariableInfo = { tag: 6 };
export type objectVariableInfo = { tag: 7; cpool: classInfo };
export type uninitializedVariableInfo = { tag: 8; offset: number };
// Takes two slots
export type longVariableInfo = { tag: 4 };
export type doubleVariableInfo = { tag: 3 };
// All of them together
export type verificationTypeInfo =
  | topVariableInfo
  | integerVariableInfo
  | floatVariableInfo
  | nullVariableInfo
  | uninitializedthisVariableInfo
  | objectVariableInfo
  | uninitializedVariableInfo
  | longVariableInfo
  | doubleVariableInfo;
// stackMapFrame stuff
export type byteOffsetDelta = range<0, 63>;
export type sameFrame = {
  frameType: "sameFrame";
  offsetDelta: byteOffsetDelta;
};
export type sameLocals1StackItemFrame = {
  frameType: "sameLocals1StackItemFrame";
  offsetDelta: byteOffsetDelta;
  stack: [verificationTypeInfo];
};
export type sameLocals1StackItemFrameExtended = {
  frameType: "sameLocals1StackItemFrameExtended";
  offsetDelta: number;
  stack: [verificationTypeInfo];
};
export type chopFrame = {
  frameType: "chopFrame";
  frames: range<1, 3>;
  offsetDelta: number;
};
export type sameFrameExtended = {
  frameType: "sameFrameExtended";
  offsetDelta: number;
};
export type appendFrame = {
  frameType: "appendFrame";
  locals: verificationTypeInfo[] & { length: range<1, 3> };
  offsetDelta: number;
};
export type fullFrame = {
  frameType: "fullFrame";
  offsetDelta: number;
  locals: verificationTypeInfo[];
  stack: verificationTypeInfo[];
};
export type stackMapFrame =
  | sameFrame
  | sameLocals1StackItemFrame
  | sameLocals1StackItemFrameExtended
  | chopFrame
  | sameFrameExtended
  | appendFrame
  | fullFrame;
// Stack map frames (Remapped to make easer to process)
/**
 * @private
 */
export type remapFrame<T> = T extends any
  ? Omit<T, "offsetDelta"> & { offset: number }
  : never;
export type stackMapFrames = Expand<
  remapFrame<
    | sameFrame
    | sameLocals1StackItemFrame
    | sameLocals1StackItemFrameExtended
    | chopFrame
    | sameFrameExtended
    | appendFrame
    | fullFrame
  >[],
  expansionIgnoreListSafe
>;
export type stackMapTable = {
  name: makeStringUtf8Info<"StackMapTable">;
  known: true;
  entries: stackMapFrames;
};
// No more stack map table CHICKEN POOP
export type exeptions = {
  name: makeStringUtf8Info<"Exeptions">;
  known: true;
  exeptions: classInfo[];
};
export type innerClasses = {
  name: makeStringUtf8Info<"InnerClasses">;
  known: true;
  classes: {
    innerClassInfo: classInfo;
    outerClassInfo: classInfo | undefined;
    innerName: utf8Info | undefined;
    innerClassAccessFlags: innerClassAccessFlags;
  }[];
};
export type enclosingMethod = {
  name: makeStringUtf8Info<"EnclosingMethod">;
  known: true;
  class: classInfo;
  method: nameAndTypeInfo | undefined;
};
export type synthetic = { name: makeStringUtf8Info<"Synthetic">; known: true };
export type signature = {
  name: makeStringUtf8Info<"Signature">;
  known: true;
  signature: ClassSignature | MethodTypeSignature | FieldTypeSignature;
};
export type sourcefile = {
  name: makeStringUtf8Info<"SourceFile">;
  known: true;
  sourcefile: utf8Info;
};
export type sourceDebugExtension = {
  name: makeStringUtf8Info<"SourceDebugExtension">;
  known: true;
  debugExtension: string;
};
export type lineNumberTable = {
  name: makeStringUtf8Info<"LineNumberTable">;
  known: true;
  lineNumberTable: { startPc: number; lineNumber: number }[];
};
export type localVariableTable = {
  name: makeStringUtf8Info<"LocalVariableTable">;
  known: true;
  localVariableTable: {
    startPc: number;
    length: number;
    name: utf8Info;
    descriptor: FieldDescriptor;
    index: number;
  }[];
};
export type localVariableTypeTable = {
  name: makeStringUtf8Info<"LocalVariableTypeTable">;
  known: true;
  localVariableTypeTable: {
    startPc: number;
    length: number;
    name: utf8Info;
    signature: FieldTypeSignature;
    index: number;
  }[];
};
export type deprecated = {
  name: makeStringUtf8Info<"Deprecated">;
  known: true;
};
export type runtimeVisibleAnnotations = {
  name: makeStringUtf8Info<"RuntimeVisibleAnnotations">;
  known: true;
  annotations: annotation[];
};
export type runtimeInvisibleAnnotations = {
  name: makeStringUtf8Info<"RuntimeInvisibleAnnotations">;
  known: true;
  annotations: annotation[];
};
export type runtimeVisibleParameterAnnotations = {
  name: makeStringUtf8Info<"RuntimeVisibleParameterAnnotations">;
  known: true;
  parameterAnnotations: annotation[][];
};
export type runtimeInvisibleParameterAnnotations = {
  name: makeStringUtf8Info<"RuntimeInvisibleParameterAnnotations">;
  known: true;
  parameterAnnotations: annotation[][];
};
// Type annotations types
export type targetTypes = {
  0x00: "typeParameterTarget";
  0x01: "typeParameterTarget";
  0x10: "supertypeTarget";
  0x11: "typeParameterBoundTarget";
  0x12: "typeParameterBoundTarget";
  0x13: "emptyTarget";
  0x14: "emptyTarget";
  0x15: "emptyTarget";
  0x16: "formalParameterTarget";
  0x17: "throwsTarget";
  // Part 2
  0x40: "localvarTarget";
  0x41: "localvarTarget";
  0x42: "catchTarget";
  0x43: "offsetTarget";
  0x44: "offsetTarget";
  0x45: "offsetTarget";
  0x46: "offsetTarget";
  0x47: "typeArgumentTarget";
  0x48: "typeArgumentTarget";
  0x49: "typeArgumentTarget";
  0x4a: "typeArgumentTarget";
  0x4b: "typeArgumentTarget";
};
/**
 * @private
 */
type entries<T, K extends keyof T = keyof T> = K extends any
  ? [K, T[K]]
  : never;
/**
 * @private
 */
type addCodes<T extends { targetType: targetTypes[keyof targetTypes] }> =
  T extends any
    ? T & {
        targetTypeCode: Extract<
          entries<targetTypes>,
          [any, T["targetType"]]
        >[0];
      }
    : never;
export type targetInfo = Expand<
  addCodes<
    | {
        targetType: "typeParameterTarget";
        typeParameterIndex: number;
      }
    | { targetType: "supertypeTarget"; supertypeIndex: number }
    | {
        targetType: "typeParameterBoundTarget";
        typeParameterIndex: number;
        boundIndex: number;
      }
    | {
        targetType: "emptyTarget";
      }
    | { targetType: "formalParameterTarget"; formalParameterIndex: number }
    | { targetType: "throwsTarget"; throwsTypeIndex: number }
    | {
        targetType: "localvarTarget";
        table: { startPc: number; length: number; index: number }[];
      }
    | { targetType: "catchTarget"; exceptionTableIndex: number }
    | { targetType: "offsetTarget"; offset: number }
    | {
        targetType: "typeArgumentTarget";
        offset: number;
        typeArgumentIndex: number;
      }
  >,
  expansionIgnoreListSafe
>;
export type typeAnnotation = {
  targetInfo: targetInfo;
  path: (
    | {
        typePathKind: 0 | 1 | 2;
        typeArgumentIndex: 0;
      }
    | {
        typePathKind: 3;
        typeArgumentIndex: number;
      }
  )[];
} & annotation;
// END
export type runtimeVisibleTypeAnnotations = {
  name: makeStringUtf8Info<"RuntimeVisibleTypeAnnotations">;
  known: true;
  annotations: typeAnnotation[];
};
export type runtimeInvisibleTypeAnnotations = {
  name: makeStringUtf8Info<"RuntimeInvisibleTypeAnnotations">;
  known: true;
  annotations: typeAnnotation[];
};
export type annotationDefault = {
  name: makeStringUtf8Info<"AnnotationDefault">;
  known: true;
  defaultValue: elementValue;
};
export type bootstrapMethods = {
  name: makeStringUtf8Info<"BootstrapMethods">;
  known: true;
  bootstrapMethods: {
    bootstrapMethod: methodHandleInfo;
    bootstrapArguments: loadableTags[];
  }[];
};
export type methodParameters = {
  name: makeStringUtf8Info<"MethodParameters">;
  known: true;
  parameters: {
    name: utf8Info | undefined;
    accessFlags: methodParametersAccessFlags;
  }[];
};

export type module = {
  name: makeStringUtf8Info<"Module">;
  known: true;
  moduleName: utf8Info;
  moduleFlags: moduleAttributeAccessFlags;
  moduleVersion: utf8Info | undefined;
  requires: {
    requires: moduleInfo;
    requiresFlags: moduleAttributeRequiresAccessFlags;
    requiresVersion: utf8Info | undefined;
  }[];
  exports: {
    exports: packageInfo;
    exportsFlags: moduleAttributeExportsFlags;
    exportsTo: moduleInfo[];
  }[];
  opens: {
    opens: packageInfo;
    opensFlags: moduleAttributeOpensFlags;
    opensTo: moduleInfo[];
  }[];
  uses: classInfo[];
  provides: { provides: classInfo; providesWith: classInfo[] }[];
};
export type modulePackages = {
  name: makeStringUtf8Info<"ModulePackages">;
  known: true;
  packages: packageInfo[];
};
export type moduleMainClass = {
  name: makeStringUtf8Info<"ModuleMainClass">;
  known: true;
  mainClass: classInfo;
};
export type nestHost = {
  name: makeStringUtf8Info<"NestHost">;
  known: true;
  hostClass: classInfo;
};
export type nestMembers = {
  name: makeStringUtf8Info<"NestMembers">;
  known: true;
  classes: classInfo[];
};
export type record = Expand<
  {
    name: makeStringUtf8Info<"Record">;
    known: true;
    components: {
      name: utf8Info;
      descriptor: utf8Info;
      attributes: getLegalAttributes<"record_component_info">;
    }[];
  },
  expansionIgnoreListSafe
>;
export type permittedSubclasses = {
  name: makeStringUtf8Info<"PermittedSubclasses">;
  known: true;
  classes: classInfo[];
};
type __attribute = [
  | constantValue
  | code
  | stackMapTable
  | exeptions
  | innerClasses
  | enclosingMethod
  | synthetic
  | signature
  | sourcefile
  | sourceDebugExtension
  | lineNumberTable
  | localVariableTable
  | localVariableTypeTable
  | deprecated
  | runtimeVisibleAnnotations
  | runtimeInvisibleAnnotations
  | runtimeVisibleParameterAnnotations
  | runtimeInvisibleParameterAnnotations
  | runtimeVisibleTypeAnnotations
  | runtimeInvisibleTypeAnnotations
  | annotationDefault
  | bootstrapMethods
  | methodParameters
  | module
  | modulePackages
  | moduleMainClass
  | nestHost
  | nestMembers
  | record
  | permittedSubclasses
];
export type knownAttribute = __attribute[number];
export type attribute =
  | __attribute[0]
  | { name: utf8Info; rawData: Uint8Array; known: false };
export type exceptionTable = {
  // Inclusive
  startPc: number;
  // Exclusive
  endPc: number;
  handlerPc: number;
  catchType: utf8Info | undefined;
}[];
export type elementValue =
  | { tag: "@"; value: annotation }
  | { tag: "B" | "C" | "I" | "S" | "Z"; value: integerInfo }
  | { tag: "D"; value: doubleInfo }
  | { tag: "F"; value: floatInfo }
  | { tag: "J"; value: longInfo }
  | { tag: "["; values: elementValue[] }
  | { tag: "c"; value: utf8Info }
  | { tag: "e"; typeName: utf8Info; constName: utf8Info }
  | { tag: "s"; value: utf8Info };
export type annotation = {
  type: utf8Info;
  elementValuePairs: {
    elementName: utf8Info;
    value: elementValue;
  }[];
};
/**
 * Returns the legal attributes for a given class file type.
 * @private
 */
export type getLegalAttributes<
  T extends keyof typeof predefinedValidClassFileAttributesMap
> = Extract<
  attribute,
  {
    name: utf8Info & {
      value: (typeof predefinedValidClassFileAttributesMap)[T][number];
    };
  }
>[];

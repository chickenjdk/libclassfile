import type { readableBuffer } from "@chickenjdk/byteutils";
import { PoolType } from "../constantPool/types";
import { disallowedError, invalidPointerError, unknownError } from "../errors";
import {
  annotation,
  attribute,
  byteOffsetDelta,
  customAssertInfoType,
  elementValue,
  stackMapFrame,
  stackMapFrames,
  targetInfo,
  typeAnnotation,
  verificationTypeInfo,
} from "./types";
import { inRange, makeMutable, range } from "@chickenjdk/common";

const validTags = [1, 2, 3, 4, 5, 6, 7, 8];
export function readVerificationTypeInfo(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): verificationTypeInfo {
  const tag = buffer.shift() as range<1, 8>;
  if (!validTags.includes(tag)) {
    throw new unknownError(`Unknown verificationTypeInfo tag ${tag}`);
  }
  switch (tag) {
    case 7: {
      const cpoolIndex = buffer.readUnsignedInt(2);
      const cpool = constantPool[cpoolIndex];
      customAssertInfoType(7, cpoolIndex, cpool);
      return { tag, cpool };
    }
    case 8: {
      const offset = buffer.readUnsignedInt(2);
      return { tag, offset };
    }
    default: {
      return { tag };
    }
  }
}
export function readStackMapFrame(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): stackMapFrame {
  const frameType = buffer.shift();
  if (inRange(frameType, [0, 63])) {
    return { frameType: "sameFrame", offsetDelta: frameType };
  } else if (inRange(frameType, [64, 127])) {
    return {
      frameType: "sameLocals1StackItemFrame",
      offsetDelta: (frameType - 64) as byteOffsetDelta,
      stack: [
        readVerificationTypeInfo(buffer, constantPool, customAssertInfoType),
      ],
    };
  } else if (frameType === 247) {
    const offsetDelta = buffer.readUnsignedInt(2);
    return {
      frameType: "sameLocals1StackItemFrameExtended",
      offsetDelta,
      stack: [
        readVerificationTypeInfo(buffer, constantPool, customAssertInfoType),
      ],
    };
  } else if (inRange(frameType, [248, 250])) {
    const offsetDelta = buffer.readUnsignedInt(2);
    return {
      frameType: "chopFrame",
      offsetDelta,
      frames: (251 - frameType) as 1 | 2 | 3,
    };
  } else if (frameType === 251) {
    const offsetDelta = buffer.readUnsignedInt(2);
    return { frameType: "sameFrameExtended", offsetDelta };
  } else if (inRange(frameType, [252, 254])) {
    const numberOfLocals = frameType - 251;
    const offsetDelta = buffer.readUnsignedInt(2);
    const locals = Array(numberOfLocals)
      .fill(undefined)
      .map(() =>
        readVerificationTypeInfo(buffer, constantPool, customAssertInfoType)
      ) as verificationTypeInfo[] & {
      length: range<1, 3>;
    };
    return { frameType: "appendFrame", offsetDelta, locals };
  } else {
    const offsetDelta = buffer.readUnsignedInt(2);
    const numberOfLocals = buffer.readUnsignedInt(2);
    const locals = Array(numberOfLocals)
      .fill(undefined)
      .map(() =>
        readVerificationTypeInfo(buffer, constantPool, customAssertInfoType)
      );
    const numberOfStackItems = buffer.readUnsignedInt(2);
    const stack = Array(numberOfStackItems)
      .fill(undefined)
      .map(() =>
        readVerificationTypeInfo(buffer, constantPool, customAssertInfoType)
      );
    return { frameType: "fullFrame", offsetDelta, locals, stack };
  }
}
export function readStackMapFrames(
  numberOfFrames: number,
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): stackMapFrames {
  const frames: stackMapFrames = [];
  let offset = 0;
  for (let index = 0; index < numberOfFrames; index++) {
    const frame = readStackMapFrame(buffer, constantPool, customAssertInfoType);
    if (offset === 0) {
      // @ts-ignore
      frame.offset = offset += frame.offsetDelta;
      // @ts-ignore
      delete frame.offsetDelta;
      frames.push(frame as unknown as stackMapFrames[number]);
    } else {
      // @ts-ignore
      frame.offset = offset += frame.offsetDelta + 1;
      // @ts-ignore
      delete frame.offsetDelta;
      frames.push(frame as unknown as stackMapFrames[number]);
    }
  }
  return frames;
}
export function readElementValue(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): elementValue {
  const elementValueTag = buffer.shift();
  const tag = tagMap[elementValueTag as keyof typeof tagMap] as
    | (typeof tagMap)[keyof typeof tagMap]
    | undefined;
  if (typeof tag === "undefined") {
    throw new unknownError(
      `element_value structure contains unknown type ${elementValueTag}`
    );
  }
  switch (tag) {
    case "@": {
      return {
        tag,
        value: readAnnotation(buffer, constantPool, customAssertInfoType),
      };
    }

    case "B":
    case "C":
    case "I":
    case "S":
    case "Z": {
      const integerIndex = buffer.readUnsignedInt(2);
      const integer = constantPool[integerIndex];
      customAssertInfoType(3, integerIndex, integer);
      return { tag, value: integer };
    }

    case "D": {
      const doubleIndex = buffer.readUnsignedInt(2);
      const double = constantPool[doubleIndex];
      customAssertInfoType(6, doubleIndex, double);
      return { tag, value: double };
    }

    case "F": {
      const floatIndex = buffer.readUnsignedInt(2);
      const float = constantPool[floatIndex];
      customAssertInfoType(4, floatIndex, float);
      return { tag, value: float };
    }

    case "J": {
      const longIndex = buffer.readUnsignedInt(2);
      const long = constantPool[longIndex];
      customAssertInfoType(5, longIndex, long);
      return { tag, value: long };
    }

    case "[": {
      const numValues = buffer.readUnsignedInt(2);
      const array: ReturnType<typeof readElementValue>[] = [];
      for (let index = 0; index < numValues; index++) {
        array[index] = readElementValue(
          buffer,
          constantPool,
          customAssertInfoType
        );
      }
      return { tag, values: array };
    }

    case "c":
    case "s": {
      const utf8Index = buffer.readUnsignedInt(2);
      const utf8 = constantPool[utf8Index];
      customAssertInfoType(1, utf8Index, utf8);
      return { tag, value: utf8 };
    }

    case "e": {
      const typeNameIndex = buffer.readUnsignedInt(2);
      const typeName = constantPool[typeNameIndex];
      customAssertInfoType(1, typeNameIndex, typeName);
      const constNameIndex = buffer.readUnsignedInt(2);
      const constName = constantPool[constNameIndex];
      customAssertInfoType(1, constNameIndex, constName);
      return { tag, typeName, constName };
    }
  }
}
export const tagMap = {
  64: "@",
  66: "B",
  67: "C",
  68: "D",
  70: "F",
  73: "I",
  74: "J",
  83: "S",
  90: "Z",
  91: "[",
  99: "c",
  101: "e",
  115: "s",
} as const;
export function readAnnotation(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): annotation {
  const typeIndex = buffer.readUnsignedInt(2);
  const type = constantPool[typeIndex];
  customAssertInfoType(1, typeIndex, type);
  const numElementValuePairs = buffer.readUnsignedInt(2);
  const elementValuePairs: annotation["elementValuePairs"] = [];
  for (let index = 0; index < numElementValuePairs; index++) {
    const elementNameIndex = buffer.readUnsignedInt(2);
    const elementName = constantPool[elementNameIndex];
    customAssertInfoType(1, elementNameIndex, elementName);
    const value = readElementValue(buffer, constantPool, customAssertInfoType);
    elementValuePairs[index] = {
      elementName,
      value,
    };
  }
  return { type, elementValuePairs };
}
const targetTypeMappings = {
  0x00: "typeParameterTarget",
  0x01: "typeParameterTarget",
  0x10: "supertypeTarget",
  0x11: "typeParameterBoundTarget",
  0x12: "typeParameterBoundTarget",
  0x13: "emptyTarget",
  0x14: "emptyTarget",
  0x15: "emptyTarget",
  0x16: "formalParameterTarget",
  0x17: "throwsTarget",
  // Part 2
  0x40: "localvarTarget",
  0x41: "localvarTarget",
  0x42: "catchTarget",
  0x43: "offsetTarget",
  0x44: "offsetTarget",
  0x45: "offsetTarget",
  0x46: "offsetTarget",
  0x47: "typeArgumentTarget",
  0x48: "typeArgumentTarget",
  0x49: "typeArgumentTarget",
  0x4a: "typeArgumentTarget",
  0x4b: "typeArgumentTarget",
} as const;
const targetTypeAllowedStructuresMappings = {
  0x00: ["ClassFile"],
  0x01: ["method_info"],
  0x10: ["ClassFile"],
  0x11: ["ClassFile"],
  0x12: ["method_info"],
  0x13: ["field_info", "record_component_info"],
  0x14: ["method_info"],
  0x15: ["method_info"],
  0x16: ["method_info"],
  0x17: ["method_info"],
  0x40: ["Code"],
  0x41: ["Code"],
  0x42: ["Code"],
  0x43: ["Code"],
  0x44: ["Code"],
  0x45: ["Code"],
  0x46: ["Code"],
  0x47: ["Code"],
  0x48: ["Code"],
  0x49: ["Code"],
  0x4a: ["Code"],
  0x4b: ["Code"],
};
export function readTypeAnnotation(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType,
  enclosingStructure:
    | "ClassFile"
    | "method_info"
    | "field_info"
    | "record_component_info"
    | "Code"
): typeAnnotation {
  const targetTypeCode = buffer.shift() as keyof typeof targetTypeMappings;
  if (!(targetTypeCode in targetTypeMappings)) {
    throw new unknownError(
      `Unknown type annotation target type code ${targetTypeCode}`
    );
  }
  const targetType = targetTypeMappings[targetTypeCode];
  if (
    !targetTypeAllowedStructuresMappings[targetTypeCode].includes(
      enclosingStructure
    )
  ) {
    throw new disallowedError(
      `Disallowed target type ${targetType} (${targetTypeCode}) for structure ${enclosingStructure}`
    );
  }
  let targetInfo: targetInfo;
  switch (targetType) {
    case "typeParameterTarget": {
      const typeParameterIndex = buffer.shift();
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        typeParameterIndex,
      };
      break;
    }
    case "supertypeTarget": {
      const supertypeIndex = buffer.readUnsignedInt(2);
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        supertypeIndex,
      };
      break;
    }
    case "typeParameterBoundTarget": {
      const typeParameterIndex = buffer.shift();
      const boundIndex = buffer.shift();
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        typeParameterIndex,
        boundIndex,
      };
      break;
    }
    case "emptyTarget": {
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
      };
      break;
    }
    case "formalParameterTarget": {
      const formalParameterIndex = buffer.shift();
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        formalParameterIndex,
      };
      break;
    }
    case "throwsTarget": {
      const throwsTypeIndex = buffer.readUnsignedInt(2);
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        throwsTypeIndex,
      };
      break;
    }
    case "localvarTarget": {
      const tableLength = buffer.readUnsignedInt(2);
      const table: { startPc: number; length: number; index: number }[] = [];
      for (let i = 0; i < tableLength; i++) {
        const startPc = buffer.readUnsignedInt(2);
        const length = buffer.readUnsignedInt(2);
        const index = buffer.readUnsignedInt(2);
        table[i] = { startPc, length, index };
      }
      targetInfo = { targetType, targetTypeCode: targetTypeCode as any, table };
      break;
    }
    case "catchTarget": {
      const exceptionTableIndex = buffer.readUnsignedInt(2);
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        exceptionTableIndex,
      };
      break;
    }
    case "offsetTarget": {
      const offset = buffer.readUnsignedInt(2);
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        offset,
      };
      break;
    }
    case "typeArgumentTarget": {
      const offset = buffer.readUnsignedInt(2);
      const typeArgumentIndex = buffer.shift();
      targetInfo = {
        targetType,
        targetTypeCode: targetTypeCode as any,
        offset,
        typeArgumentIndex,
      };
      break;
    }
  }
  const pathLength = buffer.shift();
  const path: (
    | { typePathKind: 0 | 1 | 2; typeArgumentIndex: 0 }
    | { typePathKind: 3; typeArgumentIndex: number }
  )[] = [];
  for (let index = 0; index < pathLength; index++) {
    const typePathKind = buffer.shift();
    const typeArgumentIndex = buffer.shift();
    if (
      !(
        typePathKind === 0 ||
        typePathKind === 1 ||
        typePathKind === 2 ||
        typePathKind === 3
      )
    ) {
      throw new unknownError(
        `Unknown path kind ${typePathKind} in type annotation`
      );
    }
    if (typePathKind !== 3 && typeArgumentIndex !== 0) {
      throw new disallowedError(
        `Type argument index must be zero if type path kind is not 3 (got ${typePathKind}) in type annotation`
      );
    }
    // @ts-ignore
    path[index] = { typePathKind, typeArgumentIndex };
  }
  return {
    targetInfo,
    path,
    ...readAnnotation(buffer, constantPool, customAssertInfoType),
  };
}
export function assertAttributeType<
  allowedNames extends
    | attribute["name"]
    | attribute["name"][]
    | readonly attribute["name"][]
>(
  allowedNames: allowedNames,
  entry: attribute,
  structName: string
): asserts entry is Extract<
  attribute,
  {
    name: makeMutable<allowedNames> extends any[]
      ? makeMutable<allowedNames>[number]
      : makeMutable<allowedNames>;
  }
> {
  if (Array.isArray(allowedNames)) {
    if (allowedNames.length === 0) {
      throw new Error("Wow. Just wow. (Invalid function use)");
    }
    if (!allowedNames.includes(entry.name)) {
      throw new disallowedError(
        `${structName} has invalild attribute with name ${
          entry.name
        } but allowed name${
          allowedNames.length === 1
            ? ` is ${allowedNames[0]}`
            : `s are ${
                allowedNames.length > 2
                  ? allowedNames.reduce(
                      (last, allowed, index, array) =>
                        index === array.length - 1
                          ? `${last}and ${allowed}`
                          : `${last}${allowed}, `,
                      ""
                    )
                  : `${allowedNames[0]} and ${allowedNames[1]}`
              }`
        }`
      );
    }
  } else {
    if (!(entry.name === allowedNames)) {
      throw new invalidPointerError(
        `${structName} has invalild attribute with name ${entry.name} but allowed name is ${allowedNames}`
      );
    }
  }
}

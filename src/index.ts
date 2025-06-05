import { readConstantPool } from "./constantPool/parser";
import type { readableBuffer } from "@chickenjdk/byteutils";
import { formatError } from "./errors";
import { readAccessFlags } from "./accessFlags";
import { readInterfaces } from "./interfaces";
import { readFields } from "./fields";
import {
  assertInfoType,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { classInfo } from "./constantPool/types";
import { readMethods } from "./methods";
import { attribute, getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { assertAttributeType } from "./attributes/helpers";
import { Expand, expansionIgnoreList, classFile } from "./types";
/**
 * Parse a class file. Nearly completely up to the specs at https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html
 * @param buffer
 * @returns
 */
export function readClassFile(buffer: readableBuffer): classFile {
  const magicNumber = buffer
    .readArray(4)
    .map((value) => value.toString(16))
    .join("");
  if (magicNumber !== "cafebabe") {
    throw new formatError(
      `Expected magic number 0xcafebabe, but got 0x${magicNumber}`
    );
  }
  const minorVersion = buffer.readUnsignedInt(2);
  const majorVersion = buffer.readUnsignedInt(2);
  const constantPool = readConstantPool(buffer);
  const accessFlags = readAccessFlags(buffer);
  const thisClassIndex = buffer.readUnsignedInt(2);
  const thisClass = constantPool[thisClassIndex];
  assertInfoType(7, thisClassIndex, thisClass, "Class file (Top level)");
  const superClassIndex = buffer.readUnsignedInt(2);
  const superClass = constantPool[superClassIndex];
  if (superClassIndex !== 0) {
    assertInfoType(7, superClassIndex, superClass, "Class file (Top level)");
  }
  const interfaces = readInterfaces(buffer, constantPool, false);
  const fieldsCount = buffer.readUnsignedInt(2);
  const fields = readFields(buffer, constantPool, fieldsCount);
  const methodsCount = buffer.readUnsignedInt(2);
  const methods = readMethods(buffer, constantPool, methodsCount);
  const attributesCount = buffer.readUnsignedInt(2);
  const attributes: Expand<
    getLegalAttributes<"ClassFile">,
    expansionIgnoreList
  > = [];
  for (let index = 0; index < attributesCount; index++) {
    const attribute = readAttribute(
      buffer,
      constantPool,
      (...args) => assertInfoType(...args, "Class file (Top level)"),
      "ClassFile"
    );
    assertAttributeType(
      predefinedValidClassFileAttributesMap.ClassFile,
      attribute,
      "Class file (Top level)"
    );
    attributes[index] = attribute;
  }
  return {
    minorVersion,
    majorVersion,
    constantPool,
    accessFlags,
    thisClass,
    superClass: superClass as classInfo | undefined,
    interfaces,
    fields,
    methods,
    attributes,
  };
}

export * from "./attributes/types";
export * from "./constantPool/types";
export * from "./types";

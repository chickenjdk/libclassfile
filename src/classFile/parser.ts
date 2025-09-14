import { readableBuffer } from "@chickenjdk/byteutils";
import { classFile } from "./types.js";
import { formatError } from "../errors.js";
import {
  parser as constantPoolParser,
  helpers as constantPoolHelpers,
  classInfo,
  customAssertInfoType,
} from "../constantPool/index.js";
import { parser as accessFlagsParser } from "../accessFlags/index.js";
import { parser as interfacesParser } from "../interfaces/index.js";
import { parser as fieldsParser } from "../fields/index.js";
import { parser as methodsParser } from "../methods/index.js";
import {
  parser as attributesParser,
  helpers as attributesHelpers,
  getLegalAttributes,
} from "../attributes/index.js";
import { Expand } from "@chickenjdk/common";
import { expansionIgnoreList } from "../types.js";

const customAssertInfoType: customAssertInfoType = (...args) =>
  constantPoolHelpers.assertInfoType(...args, "Class file (Top level)");
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
  const constantPool = constantPoolParser.readConstantPool(buffer);
  const accessFlags = accessFlagsParser.readAccessFlags(buffer);
  const thisClassIndex = buffer.readUnsignedInt(2);
  const thisClass = constantPool[thisClassIndex];
  customAssertInfoType(7, thisClassIndex, thisClass);
  const superClassIndex = buffer.readUnsignedInt(2);
  const superClass = constantPool[superClassIndex];
  if (superClassIndex !== 0) {
    customAssertInfoType(7, superClassIndex, superClass);
  }
  const interfaces = interfacesParser.readInterfaces(
    buffer,
    constantPool,
    customAssertInfoType
  );
  const fieldsCount = buffer.readUnsignedInt(2);
  const fields = fieldsParser.readFields(buffer, constantPool, fieldsCount);
  const methodsCount = buffer.readUnsignedInt(2);
  const methods = methodsParser.readMethods(buffer, constantPool, methodsCount);
  const attributesCount = buffer.readUnsignedInt(2);
  const attributes: Expand<
    getLegalAttributes<"ClassFile">,
    expansionIgnoreList
  > = [];
  for (let index = 0; index < attributesCount; index++) {
    const attribute = attributesParser.readAttribute(
      buffer,
      constantPool,
      customAssertInfoType,
      "ClassFile"
    );
    attributesHelpers.assertAttributeType(
      attributesHelpers.predefinedValidClassFileAttributesMap.ClassFile,
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

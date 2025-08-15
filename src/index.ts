import { readConstantPool } from "./constantPool/parser";
import { readableBuffer, writableBuffer } from "@chickenjdk/byteutils";
import { formatError } from "./errors";
import { readAccessFlags, writeAccessFlags } from "./accessFlags";
import { readInterfaces, writeInterfaces } from "./interfaces";
import { readFields, writeFields } from "./fields";
import {
  assertInfoType,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { classInfo } from "./constantPool/types";
import { readMethods, writeMethods } from "./methods";
import { customAssertInfoType, getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { writeAttribute } from "./attributes/writer";
import { assertAttributeType } from "./attributes/helpers";
import { expansionIgnoreList, classFile } from "./types";
import { Expand, log } from "@chickenjdk/common";
import { flushSinkWritableBuffer } from "./customBuffers";
import { PoolRegister, writeConstantPool } from "./constantPool/writer";
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
/**
 * Assemble a class file. Nearly completely up to the specs at https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html
 * @param classFile The class file AST to write.
 * The constantPool attribute is ignored, please set it to {} (generates a warning)
 * The constantPool indexes are ignored, please set them to 0 (generates no logs for disregarding).
 * @returns
 */
export function writeClassFile(classFile: classFile): writableBuffer {
  const buffer = new writableBuffer();
  if (Object.keys(classFile.constantPool).length !== 0) {
    log(
      "warning",
      "Attribute provided a non-blank constant pool. Please provide {}."
    );
  }
  buffer.writeUint8Array(new Uint8Array([0xca, 0xfe, 0xba, 0xbe]));
  buffer.writeUnsignedInt(classFile.minorVersion, 2);
  buffer.writeUnsignedInt(classFile.majorVersion, 2);
  // Write constant pool related items
  const flushBuff = new flushSinkWritableBuffer();
  const poolRegister = new PoolRegister();
  const customAssertInfoType: customAssertInfoType = (
    ...args: any[] // @ts-ignore
  ) => assertInfoType(...args, "Class file (Top level)");
  // Access flags
  writeAccessFlags(flushBuff, classFile.accessFlags);
  // Class indexs
  const thisClassIndex = poolRegister.registerEntry(classFile.thisClass);
  customAssertInfoType(7, thisClassIndex, classFile.thisClass);
  flushBuff.writeUnsignedInt(thisClassIndex, 2);
  if (classFile.superClass !== undefined) {
    const superClassIndex = poolRegister.registerEntry(classFile.superClass);
    customAssertInfoType(7, superClassIndex, classFile.superClass);
    flushBuff.writeUnsignedInt(superClassIndex, 2);
  } else {
    flushBuff.writeUnsignedInt(0, 2);
  }
  // Interfaces
  writeInterfaces(
    flushBuff,
    classFile.interfaces,
    poolRegister,
    customAssertInfoType
  );
  writeFields(flushBuff, classFile.fields, poolRegister);
  writeMethods(flushBuff, classFile.methods, poolRegister);
  flushBuff.writeUnsignedInt(classFile.attributes.length, 2);
  for (const attribute of classFile.attributes) {
    assertAttributeType(
      predefinedValidClassFileAttributesMap.ClassFile,
      attribute,
      "Class file (Top level)"
    );
    writeAttribute(
      flushBuff,
      attribute,
      (...args) => assertInfoType(...args, "Class file (Top level)"),
      "ClassFile",
      poolRegister
    );
  }
  // Write constant pool
  writeConstantPool(buffer, poolRegister);
  // Flush buffer
  log(
    "verbose",
    `Flush buffer has quete length (number of operations pending) ${flushBuff._queteLength}`
  );
  flushBuff.flush(buffer);
  return buffer;
}
export * from "./attributes/types";
export * from "./constantPool/types";
export * from "./bytecode/types";
export * from "./bytecode/parse";
export * from "./bytecode/writer";
export * from "./types";
export * as signature from "./signature";

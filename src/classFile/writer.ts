import { writableBuffer } from "@chickenjdk/byteutils";
import { classFile } from "./types.js";
import {writer as constantPoolWriter, helpers as constantPoolHelpers, customAssertInfoType} from "../constantPool/index.js";
import {writer as accessFlagsWriter} from "../accessFlags/index.js";
import {writer as interfacesWriter} from "../interfaces/index.js";
import {writer as fieldsWriter} from "../fields/index.js";
import {writer as methodsWriter} from "../methods/index.js";
import { writer as attributesWriter, helpers as attributesHelpers } from "../attributes/index.js";
import { log } from "@chickenjdk/common";
import { flushSinkWritableBuffer } from "../customBuffers.js";

const customAssertInfoType: customAssertInfoType = (...args) => constantPoolHelpers.assertInfoType(...args, "Class file (Top level)")

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
        "Class file provided a non-blank constant pool. Please provide {}."
      );
    }
    buffer.writeUint8Array(new Uint8Array([0xca, 0xfe, 0xba, 0xbe]));
    buffer.writeUnsignedInt(classFile.minorVersion, 2);
    buffer.writeUnsignedInt(classFile.majorVersion, 2);
    // Write constant pool related items
    const flushBuff = new flushSinkWritableBuffer();
    const poolRegister = new constantPoolWriter.PoolRegister();
    // Access flags
    accessFlagsWriter.writeAccessFlags(flushBuff, classFile.accessFlags);
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
    interfacesWriter.writeInterfaces(
      flushBuff,
      classFile.interfaces,
      poolRegister,
      customAssertInfoType
    );
    fieldsWriter.writeFields(flushBuff, classFile.fields, poolRegister);
    methodsWriter.writeMethods(flushBuff, classFile.methods, poolRegister);
    flushBuff.writeUnsignedInt(classFile.attributes.length, 2);
    for (const attribute of classFile.attributes) {
      attributesHelpers.assertAttributeType(
        attributesHelpers.predefinedValidClassFileAttributesMap.ClassFile,
        attribute,
        "Class file (Top level)"
      );
      attributesWriter.writeAttribute(
        flushBuff,
        attribute,
        customAssertInfoType,
        "ClassFile",
        poolRegister
      );
    }
    // Write constant pool
    constantPoolWriter.writeConstantPool(buffer, poolRegister);
    // Flush buffer
    log(
      "verbose",
      `Flush buffer has quete length (number of operations pending) ${flushBuff._queteLength}`
    );
    flushBuff.flush(buffer);
    return buffer;
  }
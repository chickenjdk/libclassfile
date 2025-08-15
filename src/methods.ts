import {
  readableBuffer,
  writableBuffer,
  writableBufferBase,
} from "@chickenjdk/byteutils";
import { readMethodsAccessFlags, writeMethodsAccessFlags } from "./accessFlags";
import { PoolType, utf8Info } from "./constantPool/types";
import {
  assertInfoType,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { attribute, getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { assertAttributeType } from "./attributes/helpers";
import { expansionIgnoreList, methodsAccessFlags, methods } from "./types";
import { PoolRegister } from "./constantPool/writer";
import { writeAttribute } from "./attributes/writer";
import { flushSinkWritableBuffer } from "./customBuffers";
export function readMethods(
  buffer: readableBuffer,
  constantPool: PoolType,
  methodsCount: number
): methods {
  const methods: methods = [];
  for (let index = 0; index < methodsCount; index++) {
    const accessFlags = readMethodsAccessFlags(buffer);
    const nameIndex = buffer.readUnsignedInt(2);
    const name = constantPool[nameIndex];
    assertInfoType(1, nameIndex, name, "Methods structure");
    const descriptorIndex = buffer.readUnsignedInt(2);
    const descriptor = constantPool[descriptorIndex];
    assertInfoType(1, descriptorIndex, descriptor, "Methods structure");
    const attributesCount = buffer.readUnsignedInt(2);
    const attributes: getLegalAttributes<"method_info"> = [];
    for (let index = 0; index < attributesCount; index++) {
      const attribute = readAttribute(
        buffer,
        constantPool,
        (...args) => assertInfoType(...args, "Methods structure attributes"),
        "method_info"
      );
      assertAttributeType(
        predefinedValidClassFileAttributesMap.method_info,
        attribute,
        "Methods info"
      );
      attributes[index] = attribute;
    }
    methods[index] = { accessFlags, name, descriptor, attributes };
  }
  return methods;
}

export function writeMethods(
  buffer: writableBuffer | flushSinkWritableBuffer,
  methods: methods,
  constantPool: PoolRegister
): void {
  buffer.writeUnsignedInt(methods.length, 2);
  for (const method of methods) {
    writeMethodsAccessFlags(buffer, method.accessFlags);
    // Name
    const nameIndex = constantPool.registerEntry(method.name);
    assertInfoType(1, nameIndex, method.name, "Methods structure");
    buffer.writeUnsignedInt(nameIndex, 2);
    // Descriptor
    const descriptorIndex = constantPool.registerEntry(method.descriptor);
    assertInfoType(1, descriptorIndex, method.descriptor, "Methods structure");
    buffer.writeUnsignedInt(descriptorIndex, 2);
    // Attributes
    buffer.writeUnsignedInt(method.attributes.length, 2);
    for (const attribute of method.attributes) {
      assertAttributeType(
        predefinedValidClassFileAttributesMap.method_info,
        attribute,
        "Methods info"
      );
      writeAttribute(
        buffer,
        attribute,
        (...args) => assertInfoType(...args, "Methods structure attributes"),
        "method_info",
        constantPool
      );
    }
  }
}

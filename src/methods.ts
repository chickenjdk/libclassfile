import { readableBuffer } from "@chickenjdk/byteutils";
import { readMethodsAccessFlags } from "./accessFlags";
import { PoolType, utf8Info } from "./constantPool/types";
import {
  assertInfoType,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { attribute, getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { assertAttributeType } from "./attributes/helpers";
import { Expand, expansionIgnoreList, methodsAccessFlags, methods } from "./types";
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

import { readableBuffer } from "@chickenjdk/byteutils";
import { PoolType, helpers as constantPoolHelpers } from "../constantPool/index.js";
import { parser as accessFlagsParser } from "../accessFlags/index.js";
import {
  getLegalAttributes,
  parser as attributeParser,
  helpers as attributesHelpers,
} from "../attributes/index.js";
import { methods } from "./types.js";

export function readMethods(
  buffer: readableBuffer,
  constantPool: PoolType,
  methodsCount: number
): methods {
  const methods: methods = [];
  for (let index = 0; index < methodsCount; index++) {
    const accessFlags = accessFlagsParser.readMethodsAccessFlags(buffer);
    const nameIndex = buffer.readUnsignedInt(2);
    const name = constantPool[nameIndex];
    constantPoolHelpers.assertInfoType(1, nameIndex, name, "Methods structure");
    const descriptorIndex = buffer.readUnsignedInt(2);
    const descriptor = constantPool[descriptorIndex];
    constantPoolHelpers.assertInfoType(
      1,
      descriptorIndex,
      descriptor,
      "Methods structure"
    );
    const attributesCount = buffer.readUnsignedInt(2);
    const attributes: getLegalAttributes<"method_info"> = [];
    for (let index = 0; index < attributesCount; index++) {
      const attribute = attributeParser.readAttribute(
        buffer,
        constantPool,
        (...args) =>
          constantPoolHelpers.assertInfoType(
            ...args,
            "Methods structure attributes"
          ),
        "method_info"
      );
      attributesHelpers.assertAttributeType(
        attributesHelpers.predefinedValidClassFileAttributesMap.method_info,
        attribute,
        "Methods info"
      );
      attributes[index] = attribute;
    }
    methods[index] = { accessFlags, name, descriptor, attributes };
  }
  return methods;
}

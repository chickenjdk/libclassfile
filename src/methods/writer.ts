import { lengthWritableBuffer } from "../types.js";
import {
  writer as constantPoolWriter,
  helpers as constantPoolHelpers,
} from "../constantPool/index.js";
import { methods } from "./types.js";
import {
  writer as attributeWriter,
  helpers as attributesHelpers,
} from "../attributes/index.js";
import { writer as accessFlagsWriter } from "../accessFlags/index.js";

export function writeMethods(
  buffer: lengthWritableBuffer,
  methods: methods,
  constantPool: constantPoolWriter.PoolRegister
): void {
  buffer.writeUnsignedInt(methods.length, 2);
  for (const method of methods) {
    accessFlagsWriter.writeMethodsAccessFlags(buffer, method.accessFlags);
    // Name
    const nameIndex = constantPool.registerEntry(method.name);
    constantPoolHelpers.assertInfoType(
      1,
      nameIndex,
      method.name,
      "Methods structure"
    );
    buffer.writeUnsignedInt(nameIndex, 2);
    // Descriptor
    const descriptorIndex = constantPool.registerEntry(method.descriptor);
    constantPoolHelpers.assertInfoType(
      1,
      descriptorIndex,
      method.descriptor,
      "Methods structure"
    );
    buffer.writeUnsignedInt(descriptorIndex, 2);
    // Attributes
    buffer.writeUnsignedInt(method.attributes.length, 2);
    for (const attribute of method.attributes) {
      attributesHelpers.assertAttributeType(
        attributesHelpers.predefinedValidClassFileAttributesMap.method_info,
        attribute,
        "Methods info"
      );
      attributeWriter.writeAttribute(
        buffer,
        attribute,
        (...args) =>
          constantPoolHelpers.assertInfoType(
            ...args,
            "Methods structure attributes"
          ),
        "method_info",
        constantPool
      );
    }
  }
}

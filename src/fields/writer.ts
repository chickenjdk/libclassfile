import type {
  writableBufferBase,
} from "@chickenjdk/byteutils";
import { flags, fields } from "./types.js";
import { writer as attributesWriter, helpers } from "../attributes/index.js";
import { writer as constantPoolWriter } from "../constantPool/index.js";
import { lengthWritableBuffer } from "../types.js";
import { assertInfoType, makeDescription } from "./helpers.js";

export function writeFlags(buffer: writableBufferBase, flags: flags): void {
  let flagValue = 0;
  if (flags.isPublic) flagValue |= 0x0001;
  if (flags.isPrivate) flagValue |= 0x0002;
  if (flags.isProtected) flagValue |= 0x0004;
  if (flags.isStatic) flagValue |= 0x0008;
  if (flags.isFinal) flagValue |= 0x0010;
  if (flags.isVolatile) flagValue |= 0x0040;
  if (flags.isTransient) flagValue |= 0x0080;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isEnum) flagValue |= 0x4000;
  buffer.writeUnsignedInt(2, flagValue);
}

export function writeFields(
  buffer: lengthWritableBuffer,
  fields: fields,
  constantPool: constantPoolWriter.PoolRegister
): void {
  buffer.writeUnsignedInt(fields.length, 2);
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    writeFlags(buffer, field.flags);
    const nameIndex = constantPool.registerEntry(field.name);
    assertInfoType(1, nameIndex, field.name, [index, field.flags]);
    buffer.writeUnsignedInt(nameIndex, 2);
    const descriptorIndex = constantPool.registerEntry(field.descriptor);
    assertInfoType(1, descriptorIndex, field.descriptor, [index, field.flags]);
    buffer.writeUnsignedInt(field.descriptor.index, 2);
    // Write attributes
    buffer.writeUnsignedInt(field.attributes.length, 2);
    for (const attribute of field.attributes) {
      helpers.assertAttributeType(
        helpers.predefinedValidClassFileAttributesMap.field_info,
        attribute,
        makeDescription(index, field.flags)
      );
      attributesWriter.writeAttribute(
        buffer,
        attribute,
        (expectedTag, entryIndex, entry) =>
          assertInfoType(expectedTag, entryIndex, entry, [index, field.flags]),
        "field_info",
        constantPool
      );
    }
  }
}

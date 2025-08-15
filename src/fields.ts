import type {
  readableBuffer,
  writableBuffer,
  writableBufferBase,
} from "@chickenjdk/byteutils";
import type { findInfoTypeByTag, poolTags } from "./constantPool/types";
import type { PoolType } from "./constantPool/types";
import {
  assertInfoType as __assertInfoType_old__,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { bitMaskBool } from "@chickenjdk/common";
import { getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { assertAttributeType } from "./attributes/helpers";
import { flags, fields } from "./types";
import { writeAttribute } from "./attributes/writer";
import { flushSinkWritableBuffer } from "./customBuffers";
import { PoolRegister } from "./constantPool/writer";
/**
 * Generate a description for a field entry.
 * @param index The index of the field
 * @param flags The flags of the field
 * @returns The string description of the field entry
 */
function makeDescription(index: number, flags: flags): string {
  return `Field entry with index ${index} and flags ${Object.entries(flags)
    .filter(([_key, value]) => value)
    .map(([key]) => key.slice(2))
    .join(", ")}`;
}
function assertInfoType<expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: PoolType[number],
  [index, flags]: [number, flags]
): asserts entry is findInfoTypeByTag<
  expectedTag extends any[] ? expectedTag[number] : expectedTag
> {
  return __assertInfoType_old__(
    expectedTag,
    entryIndex,
    entry,
    makeDescription(index, flags)
  );
}
function readFlags(buffer: readableBuffer): flags {
  const flags = buffer.readUnsignedInt(2);
  const isPublic = bitMaskBool(flags, 0x0001);
  const isPrivate = bitMaskBool(flags, 0x0002);
  const isProtected = bitMaskBool(flags, 0x0004);
  const isStatic = bitMaskBool(flags, 0x0008);
  const isFinal = bitMaskBool(flags, 0x0010);
  const isVolatile = bitMaskBool(flags, 0x0040);
  const isTransient = bitMaskBool(flags, 0x0080);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isEnum = bitMaskBool(flags, 0x4000);
  return {
    isPublic,
    isPrivate,
    isProtected,
    isStatic,
    isFinal,
    isVolatile,
    isTransient,
    isSynthetic,
    isEnum,
  };
}
function writeFlags(buffer: writableBufferBase, flags: flags): void {
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

export function readFields(
  buffer: readableBuffer,
  constantPool: PoolType,
  fieldCount: number
): fields {
  const fields: fields = [];
  for (let index = 0; index < fieldCount; index++) {
    const flags = readFlags(buffer);
    const nameIndex = buffer.readUnsignedInt(2);
    const nameEntry = constantPool[nameIndex];
    assertInfoType(1, nameIndex, nameEntry, [index, flags]);
    const descriptorIndex = buffer.readUnsignedInt(2);
    const descriptorEntry = constantPool[descriptorIndex];
    assertInfoType(1, descriptorIndex, descriptorEntry, [index, flags]);
    const attributesCount = buffer.readUnsignedInt(2);
    const attributes: getLegalAttributes<"field_info"> = [];
    for (let index = 0; index < attributesCount; index++) {
      const attribute = readAttribute(
        buffer,
        constantPool,
        (expectedTag, entryIndex, entry) =>
          assertInfoType(expectedTag, entryIndex, entry, [index, flags]),
        "field_info"
      );
      assertAttributeType(
        predefinedValidClassFileAttributesMap.field_info,
        attribute,
        makeDescription(index, flags)
      );
      attributes[index] = attribute;
    }
    fields[index] = {
      flags,
      name: nameEntry,
      descriptor: descriptorEntry,
      attributes,
    };
  }
  return fields;
}

export function writeFields(
  buffer: writableBuffer | flushSinkWritableBuffer,
  fields: fields,
  constantPool: PoolRegister
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
      assertAttributeType(
        predefinedValidClassFileAttributesMap.field_info,
        attribute,
        makeDescription(index, field.flags)
      );
      writeAttribute(
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

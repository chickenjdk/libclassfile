import type { readableBuffer } from "@chickenjdk/byteutils";
import type {
  findInfoTypeByTag,
  poolTags,
  utf8Info,
} from "./constantPool/types";
import type { PoolType } from "./constantPool/types";
import {
  assertInfoType as __assertInfoType_old__,
  predefinedValidClassFileAttributesMap,
} from "./common";
import { bitMaskBool } from "@chickenjdk/common";
import { getLegalAttributes } from "./attributes/types";
import { readAttribute } from "./attributes/parser";
import { assertAttributeType } from "./attributes/helpers";
type flags = {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isVolatile: boolean;
  isTransient: boolean;
  isSynthetic: boolean;
  isEnum: boolean;
};
type fields = {
  flags: flags;
  name: utf8Info;
  attributes: getLegalAttributes<"field_info">;
}[];
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
    fields[index] = { flags, name: nameEntry, attributes };
  }
  return fields;
}

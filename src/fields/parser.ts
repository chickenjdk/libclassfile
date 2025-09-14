import { readableBuffer } from "@chickenjdk/byteutils";
import { bitMaskBool } from "@chickenjdk/common";
import {flags, fields} from "./types.js";
import { PoolType } from "../constantPool/index.js";
import { assertInfoType, makeDescription } from "./helpers.js";
import { getLegalAttributes, helpers, parser, } from "../attributes/index.js";

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
        const attribute = parser.readAttribute(
          buffer,
          constantPool,
          (expectedTag, entryIndex, entry) =>
            assertInfoType(expectedTag, entryIndex, entry, [index, flags]),
          "field_info"
        );
        helpers.assertAttributeType(
          helpers.predefinedValidClassFileAttributesMap.field_info,
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
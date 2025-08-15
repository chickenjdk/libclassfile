import type { readableBuffer } from "@chickenjdk/byteutils";
import { constantPoolUnknownTagError, unknownTagError } from "../errors";
import { assertInRange, prioritizedHook } from "@chickenjdk/common";
import { assertInfoType as __assertInfoType_old__ } from "../common";
import { findInfoTypeByTag, poolTags, PoolType } from "./types";
function assertInfoType<expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: PoolType[number],
  [callerTag, callerIndex]: [poolTags, number]
): asserts entry is findInfoTypeByTag<
  expectedTag extends any[] ? expectedTag[number] : expectedTag
> {
  return __assertInfoType_old__(
    expectedTag,
    entryIndex,
    entry,
    `Constant pool structure with tag ${callerTag} and index ${callerIndex}`
  );
}
export function readConstantPool(buffer: readableBuffer) {
  const length = buffer.readUnsignedInt(2);
  const pool: PoolType = {};
  // 0 depends on one layer. 1 depends on two layers, and so on... (Layers with no dependencys are executed directly)
  const waterfall = new prioritizedHook();
  for (let poolIndex = 1; poolIndex < length; poolIndex++) {
    const tag = buffer.shift();
    switch (tag) {
      case 7: {
        // class
        const nameIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(0, () => {
          const nameEntry = pool[nameIndex];
          assertInfoType(1, nameIndex, nameEntry, [tag, poolIndex]);
          pool[poolIndex] = { name: nameEntry, tag, index: poolIndex };
        });
        break;
      }
      case 9:
      case 10:
      case 11: {
        // Fieldref, Methodref, or InterfaceMethodref
        const classIndex = buffer.readUnsignedInt(2);
        const nameAndTypeIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(1, () => {
          const classEntry = pool[classIndex];
          const nameAndTypeEntry = pool[nameAndTypeIndex];
          assertInfoType(7, classIndex, classEntry, [tag, poolIndex]);
          assertInfoType(12, nameAndTypeIndex, nameAndTypeEntry, [
            tag,
            poolIndex,
          ]);
          pool[poolIndex] = {
            class: classEntry,
            nameAndType: nameAndTypeEntry,
            tag,
            index: poolIndex,
          };
        });
        break;
      }
      case 8: {
        // String
        const stringIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(0, () => {
          const utf8InfoEntry = pool[stringIndex];
          assertInfoType(1, stringIndex, utf8InfoEntry, [tag, poolIndex]);
          pool[poolIndex] = { value: utf8InfoEntry, tag, index: poolIndex };
        });
        break;
      }
      case 3: {
        // Integer
        pool[poolIndex] = {
          value: buffer.readUnsignedInt(4),
          tag,
          index: poolIndex,
        };
        break;
      }
      case 4: {
        // float
        pool[poolIndex] = { value: buffer.readFloat(), tag, index: poolIndex };
        break;
      }
      case 5: {
        // long
        pool[poolIndex] = {
          value: buffer.readUnsignedIntBigint(8),
          tag,
          index: poolIndex,
        };
        pool[++poolIndex] = { tag: 0, index: poolIndex }; // 8 byte constants take up two entries
        break;
      }
      case 6: {
        // double
        pool[poolIndex] = { value: buffer.readDouble(), tag, index: poolIndex };
        pool[++poolIndex] = { tag: 0, index: poolIndex }; // 8 byte constants take up two entries
        break;
      }
      case 12: {
        // nameAndType
        const nameIndex = buffer.readUnsignedInt(2);
        const descriptorIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(0, () => {
          const nameEntry = pool[nameIndex];
          const descriptorEntry = pool[descriptorIndex];
          assertInfoType(1, nameIndex, nameEntry, [tag, poolIndex]);
          assertInfoType(1, descriptorIndex, descriptorEntry, [tag, poolIndex]);
          pool[poolIndex] = {
            name: nameEntry,
            descriptor: descriptorEntry,
            tag,
            index: poolIndex,
          };
        });
        break;
      }
      case 1: {
        // (m)utf8
        pool[poolIndex] = {
          value: buffer.readString(buffer.readUnsignedInt(2), true),
          tag,
          index: poolIndex,
        };
        break;
      }
      case 15: {
        // methodHandle
        const referenceKind = buffer.shift();
        const referenceIndex = buffer.readUnsignedInt(2);
        assertInRange(
          referenceKind,
          [1, 9],
          new constantPoolUnknownTagError(
            `Unknown reference kind ${referenceKind} in methodHandle`
          )
        );
        // ?
        waterfall.addListener(2, () => {
          const reference = pool[referenceIndex];
          switch (referenceKind) {
            case 1:
            case 2:
            case 3:
            case 4: {
              assertInfoType(9, referenceIndex, reference, [tag, poolIndex]);
              pool[poolIndex] = {
                reference,
                referenceKind,
                tag,
                index: poolIndex,
              };
              break;
            }
            case 5:
            case 8: {
              assertInfoType(10, referenceIndex, reference, [tag, poolIndex]);
              pool[poolIndex] = {
                reference,
                referenceKind,
                tag,
                index: poolIndex,
              };
              break;
            }
            case 6:
            case 7: {
              assertInfoType([10, 11], referenceIndex, reference, [
                tag,
                poolIndex,
              ]);
              pool[poolIndex] = {
                reference,
                referenceKind,
                tag,
                index: poolIndex,
              };
              break;
            }
            case 9: {
              assertInfoType(11, referenceIndex, reference, [tag, poolIndex]);
              pool[poolIndex] = {
                reference,
                referenceKind,
                tag,
                index: poolIndex,
              };
              break;
            }
          }
        });
        break;
      }
      case 16: {
        // methodType
        const descriptorIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(0, () => {
          const utf8InfoEntry = pool[descriptorIndex];
          assertInfoType(1, descriptorIndex, utf8InfoEntry, [tag, poolIndex]);
          pool[poolIndex] = {
            descriptor: utf8InfoEntry,
            tag,
            index: poolIndex,
          };
        });
        break;
      }
      case 17:
      case 18: {
        const bootstrapMethodAttrIndex = buffer.readUnsignedInt(2);
        const nameAndTypeIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(1, () => {
          const nameAndType = pool[nameAndTypeIndex];
          assertInfoType(12, nameAndTypeIndex, nameAndType, [tag, poolIndex]);
          pool[poolIndex] = {
            bootstrapMethodAttrIndex,
            nameAndType,
            tag,
            index: poolIndex,
          };
        });
        break;
      }
      case 19:
      case 20: {
        const nameIndex = buffer.readUnsignedInt(2);
        waterfall.addListener(0, () => {
          const utf8InfoEntry = pool[nameIndex];
          assertInfoType(1, nameIndex, utf8InfoEntry, [tag, poolIndex]);
          pool[poolIndex] = { name: utf8InfoEntry, tag, index: poolIndex };
        });
        break;
      }
      default: {
        throw new unknownTagError(`Unknown constant pool tag ${tag}`);
      }
    }
  }
  waterfall.call();
  return pool;
}

import { writableBuffer } from "@chickenjdk/byteutils";
import { PoolType } from "./types";
import { flushSinkWritableBuffer } from "../customBuffers";
import {
  constantPoolUnknownTagError,
  disallowedError,
  formatError,
  unknownTagError,
} from "../errors";
import { assertInRange, inRange, log } from "@chickenjdk/common";
import {
  assertInfoType as __assertInfoType_old__,
  assertInfoType,
} from "../common";
import { isDeepStrictEqual } from "util";

export function writeConstantPool(buffer: writableBuffer, pool: PoolRegister) {
  const flushBuff = new flushSinkWritableBuffer();
  const flushBuff2 = new flushSinkWritableBuffer();

  let isUnusable = false;
  for (const entry of pool) {
    if (!entry) {
      throw new formatError(`Constant pool entry is undefined`);
    }
    // Unusable info is not actauly a thing in the constant pool
    if (entry.tag !== 0) {
      flushBuff.push(entry.tag);
      if (isUnusable) {
        throw new disallowedError(
          `Expected unusable_info at index ${entry.index} but got tag ${entry.tag}`
        );
      }
    }
    switch (entry.tag) {
      case 0: // unusable_info
        // This for double and long info's following unusable entry
        if (!isUnusable) {
          throw new disallowedError(
            `Invalid placement of unusable_info at ${entry.index}`
          );
        } else {
          isUnusable = false;
        }
        break;
      case 7: {
        // class_info
        const index = pool.registerEntry(entry.name);
        assertInfoType(1, index, entry.name, "class_info");
        flushBuff.writeUnsignedInt(index, 2);
        break;
      }
      case 9: // fieldref_info
      case 10: // methodref_info
      case 11: {
        // interface_methodref_info
        const classIndex = pool.registerEntry(entry.class);
        assertInfoType(7, classIndex, entry.class, "interface_methodref_info");
        flushBuff.writeUnsignedInt(classIndex, 2);
        const nameAndTypeIndex = pool.registerEntry(entry.nameAndType);
        assertInfoType(
          12,
          nameAndTypeIndex,
          entry.nameAndType,
          "interface_methodref_info"
        );
        flushBuff.writeUnsignedInt(nameAndTypeIndex, 2);
        break;
      }
      case 8: {
        // string_info
        const index = pool.registerEntry(entry.value);
        assertInfoType(1, index, entry.value, "string_info");
        flushBuff.writeUnsignedInt(index, 2);
        break;
      }
      case 3: {
        // integer_info
        flushBuff.writeUnsignedInt(entry.value, 4);
        break;
      }
      case 4: {
        // float_info
        flushBuff.writeFloat(entry.value);
        break;
      }
      case 5: {
        // long_info
        flushBuff.writeUnsignedIntBigint(entry.value, 8);
        break;
      }
      case 6: {
        // double_info
        flushBuff.writeDouble(entry.value);
        break;
      }
      case 12: {
        // name_and_type_info
        const index = pool.registerEntry(entry.name);
        assertInfoType(1, index, entry.name, "name_and_type_info");
        flushBuff.writeUnsignedInt(index, 2);
        const descriptorIndex = pool.registerEntry(entry.descriptor);
        assertInfoType(
          1,
          descriptorIndex,
          entry.descriptor,
          "name_and_type_info"
        );
        flushBuff.writeUnsignedInt(descriptorIndex, 2);
        break;
      }
      case 1: {
        // utf8_info
        const length = flushBuff2.writeString(entry.value, true);
        flushBuff.writeUnsignedInt(length, 2);
        flushBuff2.flush(flushBuff);
        break;
      }
      case 15: {
        // method_handle_info
        assertInRange(
          entry.referenceKind,
          [1, 9],
          new constantPoolUnknownTagError(
            `Unknown reference kind ${entry.referenceKind} in methodHandle`
          )
        );
        flushBuff.push(entry.referenceKind);
        const referenceIndex = pool.registerEntry(entry.reference);
        if (inRange(entry.referenceKind, [1, 4])) {
          assertInfoType(
            9,
            referenceIndex,
            entry.reference,
            "method_handle_info"
          );
        } else if (entry.referenceKind === 5 || entry.referenceKind === 8) {
          assertInfoType(
            10,
            referenceIndex,
            entry.reference,
            "method_handle_info"
          );
        } else if (inRange(entry.referenceKind, [6, 7])) {
          assertInfoType(
            [10, 11],
            referenceIndex,
            entry.reference,
            "method_handle_info"
          );
        } else if (entry.referenceKind === 9) {
          assertInfoType(
            11,
            referenceIndex,
            entry.reference,
            "method_handle_info"
          );
        } else {
          throw new unknownTagError(
            `Unknown referenceKind ${entry.referenceKind} at method_handle_info`
          );
        }
        flushBuff.writeUnsignedInt(referenceIndex, 2);
        break;
      }
      case 16: {
        // method_type_info
        const descriptorIndex = pool.registerEntry(entry.descriptor);
        assertInfoType(
          1,
          descriptorIndex,
          entry.descriptor,
          "method_handle_info"
        );
        flushBuff.writeUnsignedInt(descriptorIndex, 2);
        break;
      }
      case 18: // invoke_dynamic_info
      case 17: {
        // dynamic_info
        flushBuff.writeUnsignedInt(entry.bootstrapMethodAttrIndex, 2);
        const nameAndTypeIndex = pool.registerEntry(entry.nameAndType);
        assertInfoType(
          12,
          nameAndTypeIndex,
          entry.nameAndType,
          "method_handle_info"
        );
        flushBuff.writeUnsignedInt(nameAndTypeIndex, 2);
        break;
      }
      case 19: // module_info
      case 20: {
        // package_info
        const index = pool.registerEntry(entry.name);
        assertInfoType(1, index, entry.name, "method_handle_info");
        flushBuff.writeUnsignedInt(index, 2);
        break;
      }
      default: {
        throw new unknownTagError(
          `Unknown constant pool tag ${(entry as PoolType[number]).tag}`
        );
      }
    }
  }
  if (isUnusable) {
    throw new disallowedError(
      `Expected unusable_info but constant pool ends before it could be stored`
    );
  }
  const length = Object.keys(pool.pool).length + 1; // +1 for the zero index
  buffer.writeUnsignedInt(length, 2);
  flushBuff.flush(buffer);
}

export class PoolRegister {
  #pool: PoolType = {};
  #poolLength: number = 0;
  constructor() {}
  registerEntry(entry: PoolType[number]): number {
    for (const poolEntry of Object.values(this.#pool)) {
      if (
        isDeepStrictEqual(
          Object.assign({}, poolEntry, { index: 0 }),
          Object.assign({}, entry, { index: 0 })
        )
      ) {
        entry.index = poolEntry.index;
        return poolEntry.index; // Return the existing index if found
      }
    }
    entry.index = ++this.#poolLength;
    this.#pool[this.#poolLength] = entry;
    console.log(entry);
    return this.#poolLength;
  }
  get pool() {
    // Clone pool
    return Object.assign({}, this.#pool);
  }
  [Symbol.iterator]() {
    const self = this;
    return new (class {
      index: number = 0;
      next() {
        if (this.index === self.#poolLength) {
          return { done: true };
        } else {
          return { value: self.#pool[++this.index], done: false };
        }
      }
    })();
  }
}

import type { readableBuffer, writableBufferBase } from "@chickenjdk/byteutils";
import type { classInfo, PoolType } from "./constantPool/types";
import { invalidPointerError } from "./errors";
import { assertNotUndefined } from "@chickenjdk/common";
import { strictEqual } from "assert";
import { PoolRegister } from "./constantPool/writer";
import { customAssertInfoType } from "./attributes/types";
// Function is outdated, update for modern structure of this package
export function readInterfaces<ReturnRawIndexes extends boolean>(
  buffer: readableBuffer,
  constantPool: PoolType,
  returnRawIndexes: ReturnRawIndexes
): ReturnRawIndexes extends true
  ? number[]
  : Extract<PoolType[number], { tag: 7 }>[] {
  const interfacesCount = buffer.readUnsignedInt(2);
  const interfaces = [] as any[] as ReturnRawIndexes extends true
    ? number[]
    : Extract<PoolType[number], { tag: 7 }>[];
  for (let index = 0; index < interfacesCount; index++) {
    const poolIndex = buffer.readUnsignedInt(2);
    const poolEntry = constantPool[poolIndex];
    assertNotUndefined(
      poolEntry,
      new invalidPointerError(
        `Interfaces entry with index ${index} points to a undefined constant pool entry (id ${poolIndex})`
      ) as Error
    );
    strictEqual(
      poolEntry.tag,
      7,
      new invalidPointerError(
        `Interfaces entry with index ${index} points to a entry in the constant pool with tag ${poolEntry.tag} (and index ${poolIndex}), but expected tag 7`
      ) as Error
    );
    interfaces[index] = returnRawIndexes ? poolIndex : poolEntry;
  }
  return interfaces;
}
export function writeInterfaces(
  buffer: writableBufferBase,
  interfaces: classInfo[],
  constantPool: PoolRegister,
  customAssertInfoType: customAssertInfoType
): void {
  buffer.writeUnsignedInt(interfaces.length, 2);
  for (const interface_ of interfaces) {
    const interfaceIndex = constantPool.registerEntry(interface_);
    customAssertInfoType(7, interfaceIndex, interface_);
    buffer.writeUnsignedInt(interfaceIndex, 2);
  }
}

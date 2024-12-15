import type { readableBuffer } from "@chickenjdk/byteutils";
import type { PoolType } from "./constantPool/types";
import { invalidPointerError } from "./errors";
import { assertNotUndefined } from "@chickenjdk/common";
import { strictEqual } from "assert";
export function readInterfaces<ReturnRawIndexes extends boolean>(buffer:readableBuffer, constantPool:PoolType, returnRawIndexes:ReturnRawIndexes): ReturnRawIndexes extends true ? number[] : Extract<PoolType[number],{tag:7}>[]{
    const interfacesCount = buffer.readUnsignedInt(2);
    const interfaces = [] as any[] as ReturnRawIndexes extends true ? number[] : Extract<PoolType[number],{tag:7}>[];
    for (let index = 0; index < interfacesCount; index++) {
        const poolIndex = buffer.readUnsignedInt(2);
        const poolEntry = constantPool[poolIndex];
        assertNotUndefined(poolEntry,new invalidPointerError(`Interfaces entry with index ${index} points to a undefined constant pool entry (id ${poolIndex})`) as Error);
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
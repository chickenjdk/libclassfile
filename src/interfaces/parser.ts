import type { readableBuffer } from "@chickenjdk/byteutils";
import { classInfo, PoolType, customAssertInfoType } from "../constantPool/index.js";

export function readInterfaces(
  buffer: readableBuffer,
  constantPool: PoolType,
  customAssertInfoType: customAssertInfoType
): classInfo[] {
  const interfacesCount = buffer.readUnsignedInt(2);
  const interfaces: classInfo[] = [];
  for (let index = 0; index < interfacesCount; index++) {
    const poolIndex = buffer.readUnsignedInt(2);
    const poolEntry = constantPool[poolIndex];
    customAssertInfoType(7, poolIndex, poolEntry);
    interfaces[index] = poolEntry;
  }
  return interfaces;
}
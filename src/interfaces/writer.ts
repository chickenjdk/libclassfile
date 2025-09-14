import type { writableBufferBase } from "@chickenjdk/byteutils";
import { writer as constantPoolWriter, classInfo, customAssertInfoType } from "../constantPool/index.js";

export function writeInterfaces(
  buffer: writableBufferBase,
  interfaces: classInfo[],
  constantPool: constantPoolWriter.PoolRegister,
  customAssertInfoType: customAssertInfoType
): void {
  buffer.writeUnsignedInt(interfaces.length, 2);
  for (const interface_ of interfaces) {
    const interfaceIndex = constantPool.registerEntry(interface_);
    customAssertInfoType(7, interfaceIndex, interface_);
    buffer.writeUnsignedInt(interfaceIndex, 2);
  }
}

import {
  accessFlags,
  innerClassAccessFlags,
  methodParametersAccessFlags,
  methodsAccessFlags,
  moduleAttributeAccessFlags,
  moduleAttributeExportsFlags,
  moduleAttributeRequiresAccessFlags,
} from "./types.js";
import type { writableBufferBase } from "@chickenjdk/byteutils";

/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.4.6
 * @param buffer The buffer to read from
 * @param flags The flags to write
 */
export function writeAccessFlags(
  buffer: writableBufferBase,
  flags: accessFlags
): void {
  let flagValue = 0;
  if (flags.isPublic) flagValue |= 0x0001;
  if (flags.isFinal) flagValue |= 0x0010;
  if (flags.isSuper) flagValue |= 0x0020;
  if (flags.isInterface) flagValue |= 0x0200;
  if (flags.isAbstract) flagValue |= 0x1000;
  if (flags.isAnnotation) flagValue |= 0x2000;
  if (flags.isEnum) flagValue |= 0x4000;
  if (flags.isModule) flagValue |= 0x8000;
  buffer.writeUnsignedInt(flagValue, 2);
}
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.7.4
 * @param buffer The buffer to read from
 * @param flags The flags to write
 */
export function writeInnerClassAccessFlags(
  buffer: writableBufferBase,
  flags: innerClassAccessFlags
): void {
  let flagValue = 0;
  if (flags.isPublic) flagValue |= 0x0001;
  if (flags.isPrivate) flagValue |= 0x0002;
  if (flags.isProtected) flagValue |= 0x0004;
  if (flags.isStatic) flagValue |= 0x0008;
  if (flags.isFinal) flagValue |= 0x0010;
  if (flags.isInterface) flagValue |= 0x0200;
  if (flags.isAbstract) flagValue |= 0x0400;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isAnnotation) flagValue |= 0x2000;
  if (flags.isEnum) flagValue |= 0x4000;
  buffer.writeUnsignedInt(flagValue, 2);
}
export function writeMethodsAccessFlags(
  buffer: writableBufferBase,
  flags: methodsAccessFlags
) {
  let flagValue = 0;
  if (flags.isPublic) flagValue |= 0x0001;
  if (flags.isPrivate) flagValue |= 0x0002;
  if (flags.isProtected) flagValue |= 0x0004;
  if (flags.isStatic) flagValue |= 0x0008;
  if (flags.isFinal) flagValue |= 0x0010;
  if (flags.isSynchronized) flagValue |= 0x0020;
  if (flags.isBridge) flagValue |= 0x0040;
  if (flags.isVarargs) flagValue |= 0x0080;
  if (flags.isNative) flagValue |= 0x0100;
  if (flags.isAbstract) flagValue |= 0x0400;
  if (flags.isStrict) flagValue |= 0x0800;
  if (flags.isSynthetic) flagValue |= 0x1000;
  buffer.writeUnsignedInt(flagValue, 2);
}
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.7.24
 * @param buffer The buffer to read from
 */
export function writeMethodParametersAccessFlags(
  buffer: writableBufferBase,
  flags: methodParametersAccessFlags
): void {
  let flagValue = 0;
  if (flags.isFinal) flagValue |= 0x0010;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isMandated) flagValue |= 0x8000;
  buffer.writeUnsignedInt(flagValue, 2);
}
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.7.25
 * @param buffer The buffer to read from
 */
export function writeModuleAttributeAccessFlags(
  buffer: writableBufferBase,
  flags: moduleAttributeAccessFlags
): void {
  let flagValue = 0;
  if (flags.isOpen) flagValue |= 0x0020;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isMandated) flagValue |= 0x8000;
  buffer.writeUnsignedInt(flagValue, 2);
}
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.7.25
 * @param buffer The buffer to read from
 */
export function writeModuleAttributeRequiresAccessFlags(
  buffer: writableBufferBase,
  flags: moduleAttributeRequiresAccessFlags
): void {
  let flagValue = 0;
  if (flags.isTransitive) flagValue |= 0x0020;
  if (flags.isStaticPhase) flagValue |= 0x0040;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isMandated) flagValue |= 0x8000;
  buffer.writeUnsignedInt(flagValue, 2);
}
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.7.25
 * @param buffer The buffer to read from
 */
export function writeModuleAttributeExportsFlags(
  buffer: writableBufferBase,
  flags: moduleAttributeExportsFlags
): void {
  let flagValue = 0;
  if (flags.isSynthetic) flagValue |= 0x1000;
  if (flags.isMandated) flagValue |= 0x8000;
  buffer.writeUnsignedInt(flagValue, 2);
}
export const writeModuleAttributeOpensFlags = writeModuleAttributeExportsFlags;

import type { readableBuffer, writableBufferBase } from "@chickenjdk/byteutils";
import { bitMaskBool } from "@chickenjdk/common";
import {
  accessFlags,
  innerClassAccessFlags,
  methodParametersAccessFlags,
  methodsAccessFlags,
  moduleAttributeAccessFlags,
  moduleAttributeExportsFlags,
  moduleAttributeRequiresAccessFlags,
} from "./types";
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.4.6
 * @param buffer The buffer to read from
 */
export function readAccessFlags(buffer: readableBuffer): accessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isPublic = bitMaskBool(flags, 0x0001);
  const isFinal = bitMaskBool(flags, 0x0010);
  const isSuper = bitMaskBool(flags, 0x0020);
  const isInterface = bitMaskBool(flags, 0x0200);
  const isAbstract = bitMaskBool(flags, 0x1000);
  const isAnnotation = bitMaskBool(flags, 0x2000);
  const isEnum = bitMaskBool(flags, 0x4000);
  const isModule = bitMaskBool(flags, 0x8000);
  return {
    isPublic,
    isFinal,
    isSuper,
    isInterface,
    isAbstract,
    isAnnotation,
    isEnum,
    isModule,
  };
}
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
 */
export function readInnerClassAccessFlags(
  buffer: readableBuffer
): innerClassAccessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isPublic = bitMaskBool(flags, 0x0001);
  const isPrivate = bitMaskBool(flags, 0x0002);
  const isProtected = bitMaskBool(flags, 0x0004);
  const isStatic = bitMaskBool(flags, 0x0008);
  const isFinal = bitMaskBool(flags, 0x0010);
  const isInterface = bitMaskBool(flags, 0x0200);
  const isAbstract = bitMaskBool(flags, 0x0400);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isAnnotation = bitMaskBool(flags, 0x2000);
  const isEnum = bitMaskBool(flags, 0x4000);
  return {
    isPublic,
    isPrivate,
    isProtected,
    isStatic,
    isFinal,
    isInterface,
    isAbstract,
    isSynthetic,
    isAnnotation,
    isEnum,
  };
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
/**
 * See https://docs.oracle.com/javase/specs/jvms/se22/html/jvms-4.html#jvms-4.6-200-A.1
 * @param buffer The buffer to read from
 */
export function readMethodsAccessFlags(
  buffer: readableBuffer
): methodsAccessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isPublic = bitMaskBool(flags, 0x0001);
  const isPrivate = bitMaskBool(flags, 0x0002);
  const isProtected = bitMaskBool(flags, 0x0004);
  const isStatic = bitMaskBool(flags, 0x0008);
  const isFinal = bitMaskBool(flags, 0x0010);
  const isSynchronized = bitMaskBool(flags, 0x0020);
  const isBridge = bitMaskBool(flags, 0x0040);
  const isVarargs = bitMaskBool(flags, 0x0080);
  const isNative = bitMaskBool(flags, 0x0100);
  const isAbstract = bitMaskBool(flags, 0x0400);
  const isStrict = bitMaskBool(flags, 0x0800);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  return {
    isPublic,
    isPrivate,
    isProtected,
    isStatic,
    isFinal,
    isSynchronized,
    isBridge,
    isVarargs,
    isNative,
    isAbstract,
    isStrict,
    isSynthetic,
  };
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
export function readMethodParametersAccessFlags(
  buffer: readableBuffer
): methodParametersAccessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isFinal = bitMaskBool(flags, 0x0010);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isMandated = bitMaskBool(flags, 0x8000);
  return { isFinal, isSynthetic, isMandated };
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
export function readModuleAttributeAccessFlags(
  buffer: readableBuffer
): moduleAttributeAccessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isOpen = bitMaskBool(flags, 0x0020);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isMandated = bitMaskBool(flags, 0x8000);
  return { isOpen, isSynthetic, isMandated };
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
export function readModuleAttributeRequiresAccessFlags(
  buffer: readableBuffer
): moduleAttributeRequiresAccessFlags {
  const flags = buffer.readUnsignedInt(2);
  const isTransitive = bitMaskBool(flags, 0x0020);
  const isStaticPhase = bitMaskBool(flags, 0x0040);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isMandated = bitMaskBool(flags, 0x8000);
  return { isTransitive, isStaticPhase, isSynthetic, isMandated };
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
export function readModuleAttributeExportsFlags(
  buffer: readableBuffer
): moduleAttributeExportsFlags {
  const flags = buffer.readUnsignedInt(2);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isMandated = bitMaskBool(flags, 0x8000);
  return { isSynthetic, isMandated };
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
// Same structure (As of se22)
export const readModuleAttributeOpensFlags = readModuleAttributeExportsFlags;
export const writeModuleAttributeOpensFlags = writeModuleAttributeExportsFlags;

import type { readableBuffer } from "@chickenjdk/byteutils";
import { bitMaskBool } from "@chickenjdk/common";
import { accessFlags, innerClassAccessFlags, methodParametersAccessFlags, methodsAccessFlags, moduleAttributeAccessFlags, moduleAttributeExportsFlags, moduleAttributeRequiresAccessFlags } from "./types";
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
export function readModuleAttributeExportsFlags(
  buffer: readableBuffer
): moduleAttributeExportsFlags {
  const flags = buffer.readUnsignedInt(2);
  const isSynthetic = bitMaskBool(flags, 0x1000);
  const isMandated = bitMaskBool(flags, 0x8000);
  return { isSynthetic, isMandated };
}
// Same structure (As of December 2024)
export const readModuleAttributeOpensFlags = readModuleAttributeExportsFlags;

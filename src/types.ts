import { attribute } from "./attributes/types.js";
import type { classInfo, constantPoolEntry, PoolType } from "./constantPool/types.js";
import { writableBufferBase } from "@chickenjdk/byteutils";
import { fields, flags } from "./fields/types.js";
import { accessFlags, flagsType } from "./accessFlags/index.js";

export type expansionIgnoreList =
  | constantPoolEntry
  | attribute
  | flagsType
  | flags;
export type expansionIgnoreListSafe =
  | { tag: number; index: number }
  | { name: string }
  | flagsType
  | flags;

// Misc types
export type lengthWritableBuffer = writableBufferBase & { length: number };
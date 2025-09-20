import { Expand, IsSpecificNumber } from "@chickenjdk/common";
import {
  SignedByteOperand,
  BranchByteOperand,
  ConstantPoolEntryOperandShort,
  ConstantPoolEntryOperand,
  LocalVariableIndexOperand,
  SignedShortOperand,
  SignedIntOperand,
  SignedLongOperand,
  UnsignedShortOperand,
  JumpOffsettsOperand,
  MatchOffsetPairsOperand,
  operands,
  remapBytecodeFormat,
} from "./types.js";
import { unknownError } from "../errors.js";

export const templates = {
  signedByte: {
    type: "signedByte",
    size: 1,
    signed: true,
    description: "A signed byte (-128 to 127)",
    formatChar: "c",
  } as SignedByteOperand,
  branchByte: {
    type: "branchByte",
    size: 1,
    signed: true,
    description: "A signed byte used for branch offsets (-128 to 127)",
    formatChar: "o",
  } as BranchByteOperand,
  constantPoolEntryShort: {
    type: "constantPoolEntryShort",
    size: 1,
    signed: false,
    description: "A constant pool entry (index 0 to 255)",
    formatChar: "k",
  } as ConstantPoolEntryOperandShort,
  constantPoolEntry: {
    type: "constantPoolEntry",
    size: 2,
    signed: false,
    description: "A constant pool entry (index 0 to 65535)",
    formatChar: "kk",
  } as ConstantPoolEntryOperand,
  localVariableIndex: {
    type: "localVariableIndex",
    size: 1,
    signed: false,
    description: "An index into the local variable array (0 to 255)",
    formatChar: "i",
  } as LocalVariableIndexOperand,
  signedShort: {
    type: "signedShort",
    size: 2,
    signed: true,
    description: "A signed short (-32768 to 32767)",
    formatChar: "s",
  } as SignedShortOperand,
  unsignedShort: {
    type: "unsignedShort",
    size: 2,
    signed: false,
    description: "An unsigned short (0 to 65535)",
    formatChar: "u",
  } as UnsignedShortOperand,
  signedInt: {
    type: "signedInt",
    size: 4,
    signed: true,
    description: "A signed integer (-2147483648 to 2147483647)",
    formatChar: "n",
  } as SignedIntOperand,
  signedLong: {
    type: "signedLong",
    size: 8,
    signed: true,
    description: "A signed long integer (-2^63 to 2^63-1)",
    formatChar: "l",
  } as SignedLongOperand,
  jumpOffsets: {
    type: "jumpOffsets",
    signed: true,
    description: "A list of jump offsets (used in the tableswitch instruction)",
    formatChar: undefined,
  } as JumpOffsettsOperand,
  matchOffsetPairs: {
    type: "matchOffsetPairs",
    signed: true,
    description:
      "A list of match-offset pairs (used in the lookupswitch instruction)",
    formatChar: undefined,
  } as MatchOffsetPairsOperand,
} as const;
export type normalTemplateIndexes<T extends operands = operands> = Expand<
  (T extends any
    ? IsSpecificNumber<T["size"]> extends true
      ? T
      : never
    : never)["type"]
>;
export function encapsulateOperand<
  T extends "jumpOffsets" | "matchOffsetPairs"
>(
  type: T,
  value: (typeof templates)[T]["value"],
  size: number
): (typeof templates)[T];
export function encapsulateOperand<T extends normalTemplateIndexes>(
  type: T,
  value: (typeof templates)[T]["value"]
): (typeof templates)[T];
export function encapsulateOperand<T extends keyof typeof templates>(
  type: T,
  value: (typeof templates)[T]["value"],
  size?: number
): (typeof templates)[T] {
  return {
    ...templates[type],
    value,
    ...(typeof size === "number" ? { size } : {}),
  };
}
export function assertOperandType<T extends string>(
  operand: operands,
  type: T
): asserts operand is Extract<operands, { type: T }> {
  if (operand.type !== type) {
    if (!(operand.type in templates)) {
      throw new unknownError(`Unknown operand type: ${operand.type}`);
    } else {
      throw new Error(
        `Operand type mismatch: expected ${type}, got ${operand.type}`
      );
    }
  }
}

export function splitBytecodeFormat<T extends string>(
  format: T
): remapBytecodeFormat<T> {
  return format
    ?.split("")
    .reduce(
      (acc, val) =>
        val === "k" && acc[acc.length - 1] === "k"
          ? [...acc.slice(0, -2), "kk"]
          : [...acc, val],
      [] as string[]
    ) as remapBytecodeFormat<T>;
}

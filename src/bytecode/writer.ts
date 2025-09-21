import {
  BytecodeInstruction,
  opcodeMnemonics,
  operands,
  typeMapping,
} from "./types.js";
import { disallowedError, disallowedLengthError } from "../errors.js";
import { writer } from "../constantPool/index.js";
import { lengthWritableBuffer } from "../types.js";
import { assertOperandType, splitBytecodeFormat } from "./helpers.js";
import { assert } from "console";

function assertCorrectType<char extends keyof typeMapping>(
  operand: unknown,
  char: char
): asserts operand is typeMapping[char] {
  for (const key in typeMapping) {
    if (
      char === key &&
      typeof operand !== typeMapping[key as keyof typeof typeMapping]
    ) {
      throw new disallowedError(
        `Expected operand of type ${
          typeMapping[key as keyof typeof typeMapping]
        } for format char "${char}" but got ${typeof operand}`
      );
    }
  }
}
/**
 * Parses a bytecode instruction and writes it to the provided buffer.
 * @param buffer - The writable buffer to write the bytecode to.
 * @param bytecode - The bytecode instruction to parse.
 * @throws Will throw an error if the opcode is unknown or if the operand type is incorrect.
 */
export function writeBytecode(
  buffer: lengthWritableBuffer,
  bytecode: BytecodeInstruction[],
  constantPool: writer.PoolRegister
): void {
  const startLength = buffer.length;
  for (const instruction of bytecode) {
    const { operands, wide, opcode } = instruction;
    const pos = buffer.length - startLength;
    const mnemonic = opcodeMnemonics[opcode];

    if (wide) {
      buffer.push(0xc4); // wide opcode
    }
    buffer.push(opcode);

    if (opcode === 0xaa /* tableswitch */) {
      const padding = (4 - ((pos + 1) % 4)) % 4; // See parser.ts for explanation
      buffer.writeUint8Array(new Uint8Array(padding).fill(0));
      // Default offset, low, high, and jump offsets
      const defaultOffset = operands[0];
      const low = operands[1];
      assertOperandType(low, "signedInt");
      const high = operands[2];
      assertOperandType(high, "signedInt");
      const jumpOffsets = operands[3];
      assertOperandType(jumpOffsets, "jumpOffsets");
      if (high.value - low.value + 1 !== jumpOffsets.value.length) {
        throw new disallowedLengthError(
          `Invalid number of jump offsets: expected ${
            high.value - low.value + 1
          } but got ${jumpOffsets.value.length}`
        );
      }
      buffer.writeTwosComplement(defaultOffset.value, 4);
      buffer.writeTwosComplement(low.value, 4);
      buffer.writeTwosComplement(high.value, 4);
      for (const jumpOffset of jumpOffsets.value) {
        assertOperandType(jumpOffset, "signedInt");
        buffer.writeTwosComplement(jumpOffset.value, 4);
      }
    } else if (opcode === 0xab /* lookupswitch */) {
      const padding = (4 - ((pos + 1) % 4)) % 4;
      buffer.writeUint8Array(new Uint8Array(padding).fill(0));

      const defaultOffset = operands[0];
      assertOperandType(defaultOffset, "signedInt");
      const matchOffsetPairs = operands[1];
      assertOperandType(matchOffsetPairs, "matchOffsetPairs");
      const npairs = matchOffsetPairs.value.length;
      buffer.writeTwosComplement(defaultOffset.value, 4);
      buffer.writeTwosComplement(npairs, 4);
      for (const [match, offset] of matchOffsetPairs.value) {
        assertOperandType(match, "signedInt");
        buffer.writeTwosComplement(match.value, 4);
        assertOperandType(offset, "signedInt");
        buffer.writeTwosComplement(offset.value, 4);
      }
    } else {
      const _bytecodeFormat = wide ? mnemonic.wideFormat : mnemonic.format;
      const bytecodeFormat = splitBytecodeFormat(
        _bytecodeFormat as Exclude<typeof _bytecodeFormat, null>
      );
      for (
        let [index, operandIndex] = [0, 0];
        index < bytecodeFormat.length;
        index++
      ) {
        const char = bytecodeFormat[index];
        const operand = operands[operandIndex] as operands;

        switch (char) {
          case "b":
            assertOperandType(operand, "unsignedByte");
            buffer.push(operand.value);
            operandIndex++;
            break;
          case "c": {
            // signed byte
            assertOperandType(operand, "signedByte");
            buffer.writeTwosComplementByte(operand.value);
            operandIndex++;
            break;
          }
          case "k": {
            // constant pool index (u1)
            assertOperandType(operand, "constantPoolEntryShort");
            const poolIndex = constantPool.registerEntry(operand.value);
            buffer.push(poolIndex);
            operandIndex++;
            break;
          }
          case "kk": {
            // constant pool index (u2)
            assertOperandType(operand, "constantPoolEntry");
            const poolIndex = constantPool.registerEntry(operand.value);
            buffer.writeUnsignedInt(poolIndex, 2);
            operandIndex++;
            break;
          }
          case "i": {
            // Local varible index (unsigned byte)
            assertOperandType(operand, "localVariableIndex");
            buffer.push(operand.value);
            operandIndex++;
            break;
          }
          case "o": {
            // Signed branch byte (signed byte)
            assertOperandType(operand, "branchByte");
            buffer.writeTwosComplementByte(operand.value);
            operandIndex++;
            break;
          }
          case "_":
            buffer.push(0); // Signifys a 0
            break;
          default:
            throw new Error(
              `Unsupported format char: "${char}" in opcode ${opcode.toString(
                16
              )}`
            );
        }
      }
    }
  }
}

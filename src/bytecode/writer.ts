import { writableBuffer } from "@chickenjdk/byteutils";
import { BytecodeInstruction, opcodeMnemonics, typeMapping } from "./types";
import {
  classFileParseError,
  disallowedError,
  disallowedLengthError,
} from "../errors";
import { flushSinkWritableBuffer } from "../customBuffers";
import { PoolRegister } from "../constantPool/writer";

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
  buffer: writableBuffer | flushSinkWritableBuffer,
  bytecode: BytecodeInstruction[],
  constantPool: PoolRegister
): void {
  const startLength = buffer.length;
  for (const instruction of bytecode) {
    const { operands, wide, opcode, ctx } = instruction;
    // Register context, do more strict checks later?
    const poolIndexMapping: { [key in number]: number } = {};
    for (const key of Object.keys(ctx)) {
      poolIndexMapping[ctx[key as unknown as number].index] =
        constantPool.registerEntry(ctx[key as unknown as number]);
    }
    const mnemonic = opcodeMnemonics[opcode];
    const pos = buffer.length - startLength;
    if (!mnemonic) {
      throw new Error(`Unknown opcode: ${opcode}`);
    }
    if (mnemonic.wideFormat === null && wide) {
      throw new Error(
        `Opcode ${mnemonic.mnemonic} (${opcode}) cannot be widened`
      );
    }
    buffer.push(opcode);

    if (wide) {
      buffer.push(0xc4); // wide opcode
    }
    if (opcode === 0xaa /* tableswitch */) {
      const padding = (4 - (pos % 4)) % 4;
      buffer.writeUint8Array(new Uint8Array(padding).fill(0));
      // Default offset, low, high, and jump offsets
      const defaultOffset = operands[0];
      const low = operands[1];
      const high = operands[2];
      if (high - low + 1 !== operands[3].length) {
        throw new disallowedLengthError(
          `Invalid number of jump offsets: expected ${high - low + 1} but got ${
            operands[3].length
          }`
        );
      }
      buffer.writeSignedInteger(defaultOffset, 4);
      buffer.writeSignedInteger(low, 4);
      buffer.writeSignedInteger(high, 4);
      const jumpOffsets = operands[3];
      for (const jumpOffset of jumpOffsets) {
        buffer.writeSignedInteger(jumpOffset, 4);
      }
    } else if (opcode === 0xab /* lookupswitch */) {
      const padding = (4 - (pos % 4)) % 4;
      buffer.writeUint8Array(new Uint8Array(padding).fill(0));

      const defaultOffset = operands[0];
      const npairs = operands[1].length;
      buffer.writeSignedInteger(defaultOffset, 4);
      buffer.writeSignedInteger(npairs, 4);
      const matchOffsetPairs = operands[1];
      for (const [match, offset] of matchOffsetPairs) {
        buffer.writeSignedInteger(match, 4);
        buffer.writeSignedInteger(offset, 4);
      }
    } else {
      const _bytecodeFormat = wide ? mnemonic.wideFormat : mnemonic.format;
      const bytecodeFormat = _bytecodeFormat as Exclude<
        typeof _bytecodeFormat,
        null
      >;
      // A HUGE mess, clean up
      const kCount: number = bytecodeFormat
        ?.split("")
        .filter((value) => value === "k").length as unknown as number;
      const countedChars = "ckisunloJ".split("");
      const cleanFormat = bytecodeFormat
        ?.split("")
        .filter((value) => countedChars.includes(value)) as unknown as string[];

      if (kCount === 1) {
        const poolIndex = operands[cleanFormat.indexOf("k")] as number;
        const newIndex = poolIndexMapping[poolIndex];
        operands[cleanFormat.indexOf("k")] = newIndex;
      } else if (kCount === 2) {
        const poolIndex =
          ((operands[cleanFormat.indexOf("k")] as number) << 8) |
          (operands[cleanFormat.indexOf("k") + 1] as number);
        const newIndex = poolIndexMapping[poolIndex];

        operands[cleanFormat.indexOf("k")] = newIndex >> 8;
        operands[cleanFormat.indexOf("k") + 1] = newIndex & 0xff;
      }
      for (
        let [index, operandIndex] = [0, 0];
        index < bytecodeFormat.length;
        index++
      ) {
        const char = bytecodeFormat[index] as keyof typeMapping;
        const operand: BytecodeInstruction["operands"][number] =
          operands[operandIndex];

        switch (char) {
          case "b":
            /*assertCorrectType(operand, char);
            buffer.push(operand);
            operandIndex++;*/
            break;
          case "c": // unsigned byte
          case "k": // constant pool index (u1)
          case "i": // Unsigned byte operand
            assertCorrectType(operand, char);
            buffer.push(operand);
            operandIndex++;
            break;
          case "s": // signed short
            assertCorrectType(operand, char);
            buffer.writeSignedInteger(operand, 2);
            operandIndex++;
            break;
          case "u": // Unsigned short
            assertCorrectType(operand, char);
            buffer.writeUnsignedInt(operand, 2);
            operandIndex++;
            break;
          case "n": // signed int
            assertCorrectType(operand, char);
            buffer.writeSignedInteger(operand, 4);
            operandIndex++;
            break;
          case "l": // signed long (bigint)
            assertCorrectType(operand, char);
            buffer.writeSignedIntegerBigint(operand, 8);
            operandIndex++;
            break;
          case "o":
            assertCorrectType(operand, char);
            buffer.writeSignedInteger(operand, 2); // signed 16-bit offset
            operandIndex++;
            break;
          case "J":
            assertCorrectType(operand, char);
            buffer.writeSignedInteger(operand, 4);
            operandIndex++;
            break;
          case "_":
            break;
          case "w": // Handled, skip
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

import { unwidenableOpcodeError, noOperandError } from "../errors";
import { BytecodeInstructionType, opcodeMnemonics } from "./types";
import { readableBuffer } from "@chickenjdk/byteutils";

export function parseBytecode(
  bytecodeBuffer: readableBuffer
): BytecodeInstructionType[] {
  const instructions: BytecodeInstructionType[] = [];
  let wideMode = false;
  const orgiginalPosition = bytecodeBuffer._offset;
  while (bytecodeBuffer.length > 0) {
    // Must be aligned relitive to the start of the bytecode
    const pos = bytecodeBuffer._offset-orgiginalPosition;
    const { wideFormat, format, mnemonic, opcode } =
      opcodeMnemonics[bytecodeBuffer.shift()];
    if (wideMode && (wideFormat === null || wideFormat === undefined)) {
      throw new unwidenableOpcodeError(
        `Opcode ${opcode} (${mnemonic}) may not be widened`
      );
    }
    switch (opcode) {
      case 0xc4 /* wide */:
        wideMode = true;
        break;
      case 0xaa /* tableswitch */:
        if (true) {
          const pad = (4 - (pos % 4)) % 4;
          bytecodeBuffer.read(pad);

          const defaultOffset = bytecodeBuffer.readSignedInteger(4);
          const low = bytecodeBuffer.readSignedInteger(4);
          const high = bytecodeBuffer.readSignedInteger(4);

          const jumpOffsets: number[] = [];
          const count = high - low + 1;
          for (let i = 0; i < count; i++) {
            jumpOffsets.push(bytecodeBuffer.readSignedInteger(4));
          }

          instructions.push({
            pos,
            opcode,
            mnemonic: "tableswitch",
            operands: [defaultOffset, low, high, jumpOffsets],
            wide: false,
          });
        }
        break;
      case 0xab /* lookupswitch */:
        if (true) {
          const pad = (4 - (pos % 4)) % 4;
          bytecodeBuffer.read(pad);

          const defaultOffset = bytecodeBuffer.readSignedInteger(4);
          const npairs = bytecodeBuffer.readSignedInteger(4);

          const matchOffsetPairs: [number, number][] = [];
          for (let i = 0; i < npairs; i++) {
            const match = bytecodeBuffer.readSignedInteger(4);
            const offset = bytecodeBuffer.readSignedInteger(4);
            matchOffsetPairs.push([match, offset]);
          }

          instructions.push({
            pos,
            opcode,
            mnemonic: "lookupswitch",
            operands: [defaultOffset, matchOffsetPairs],
            wide: false,
          });
        }
        break;

      default: /* normal opcode */
        const bytecodeFormat = wideMode ? wideFormat : format;
        const operands = [];
        for (const char of bytecodeFormat as Exclude<
          typeof bytecodeFormat,
          null
        >) {
          switch (char) {
            case "b":
              operands.push(opcode); // b = the opcode
              break;
            case "c": // unsigned byte
            case "k": // constant pool index (u1)
            case "i": // Unsigned byte operand
              operands.push(bytecodeBuffer.shift());
              break;
            case "s": // signed short
              operands.push(bytecodeBuffer.readSignedInteger(2));
              break;
            case "u": // Unsigned short
              operands.push(bytecodeBuffer.readUnsignedInt(2));
              break;
            case "n": // signed int
              operands.push(bytecodeBuffer.readSignedInteger(4));
              break;
            case "l": // signed long (bigint)
              operands.push(bytecodeBuffer.readSignedIntegerBigint(8));
              break;
            case "o":
              operands.push(bytecodeBuffer.readSignedInteger(2)); // signed 16-bit offset
              break;
            case "J":
              operands.push(bytecodeBuffer.readSignedInteger(4));
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
        instructions.push({
          pos,
          opcode,
          mnemonic,
          // @ts-ignore
          operands,
          wide: wideMode,
        });
        wideMode = false;
        break;
    }
  }
  if (wideMode) {
    throw new noOperandError("Wide mode has no operand");
  }
  return instructions;
}

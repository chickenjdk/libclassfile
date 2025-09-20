import { PoolType } from "../constantPool/index.js";
import { unwidenableOpcodeError, noOperandError, refError } from "../errors.js";
import { encapsulateOperand, splitBytecodeFormat } from "./helpers.js";
import {
  BytecodeInstruction,
  opcodeMnemonics,
  operands,
  remapBytecodeFormat,
  SignedIntOperand,
} from "./types.js";
import { readableBuffer } from "@chickenjdk/byteutils";

export function parseBytecode(
  bytecodeBuffer: readableBuffer,
  constantPool: PoolType
): BytecodeInstruction[] {
  const instructions: BytecodeInstruction[] = [];
  let wideMode = false;
  const orgiginalPosition = bytecodeBuffer._offset;
  while (bytecodeBuffer.length > 0) {
    // Must be aligned relitive to the start of the bytecode
    const pos = bytecodeBuffer._offset - orgiginalPosition;
    const {
      wideFormat,
      format,
      mnemonic,
      opcode,
      resultType,
      stackEffect,
      canTrap,
    } = opcodeMnemonics[bytecodeBuffer.shift()];
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

          const jumpOffsets: SignedIntOperand[] = [];
          const count = high - low + 1;
          for (let i = 0; i < count; i++) {
            jumpOffsets.push(
              encapsulateOperand(
                "signedInt",
                bytecodeBuffer.readSignedInteger(4)
              )
            );
          }

          instructions.push({
            pos,
            opcode,
            mnemonic: "tableswitch",
            operands: [
              encapsulateOperand("signedInt", defaultOffset),
              encapsulateOperand("signedInt", low),
              encapsulateOperand("signedInt", high),
              // 4 for each jump offset
              encapsulateOperand("jumpOffsets", jumpOffsets, 4 * count),
            ],
            wide: false,
            resultType,
            stackEffect,
            canTrap,
          });
        }
        break;
      case 0xab /* lookupswitch */:
        if (true) {
          const pad = (4 - (pos % 4)) % 4;
          bytecodeBuffer.read(pad);

          const defaultOffset = bytecodeBuffer.readSignedInteger(4);
          const npairs = bytecodeBuffer.readSignedInteger(4);

          const matchOffsetPairs: [SignedIntOperand, SignedIntOperand][] = [];
          for (let i = 0; i < npairs; i++) {
            const match = bytecodeBuffer.readSignedInteger(4);
            const offset = bytecodeBuffer.readSignedInteger(4);
            matchOffsetPairs.push([
              encapsulateOperand("signedInt", match),
              encapsulateOperand("signedInt", offset),
            ]);
          }

          instructions.push({
            pos,
            opcode,
            mnemonic: "lookupswitch",
            operands: [
              encapsulateOperand("signedInt", defaultOffset),
              // 4 for the match, and 4 for the offset
              encapsulateOperand(
                "matchOffsetPairs",
                matchOffsetPairs,
                8 * npairs
              ),
            ],
            wide: false,
            resultType,
            stackEffect,
            canTrap,
          });
        }
        break;

      default: /* normal opcode */
        const bytecodeFormat = wideMode ? wideFormat : format;
        const operands: operands[] = [];
        for (const char of splitBytecodeFormat(
          bytecodeFormat as Exclude<typeof bytecodeFormat, null>
        )) {
          switch (char) {
            case "b":
              //operands.push(opcode); // b = the opcode
              break;
            case "c": // signed byte
              operands.push(
                encapsulateOperand(
                  "signedByte",
                  bytecodeBuffer.readSignedIntegerByte()
                )
              );
              break;
            case "k": {
              // constant pool index (u1)
              const poolIndex = bytecodeBuffer.shift();
              const poolEntry = constantPool[poolIndex];
              if (poolEntry === undefined) {
                throw new refError(
                  `Bytecode refered to non-exsistent constant pool entry (Constant pool index ${poolIndex}, opcode ${opcode} (${mnemonic}))`
                );
              }
              operands.push(
                encapsulateOperand("constantPoolEntryShort", poolEntry)
              );
              break;
            }
            case "kk": {
              // constant pool index (u2)
              const poolIndex =
                (bytecodeBuffer.shift() << 8) | bytecodeBuffer.shift();
              const poolEntry = constantPool[poolIndex];
              if (poolEntry === undefined) {
                throw new refError(
                  `Bytecode refered to non-exsistent constant pool entry (Constant pool index ${poolIndex}, opcode ${opcode} (${mnemonic}))`
                );
              }
              operands.push(
                encapsulateOperand("constantPoolEntry", poolEntry)
              );
              break;
            }
            case "i": // Local variable index (unsigned byte)
              operands.push(
                encapsulateOperand("localVariableIndex", bytecodeBuffer.shift())
              );
              break;
            case "o": // Signed branch byte (signed byte)
              operands.push(
                encapsulateOperand(
                  "branchByte",
                  bytecodeBuffer.readSignedIntegerByte()
                )
              );
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
          resultType,
          stackEffect,
          canTrap,
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

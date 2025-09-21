import { log } from "@chickenjdk/common";
import { PoolType } from "../constantPool/index.js";
import {
  unwidenableOpcodeError,
  noOperandError,
  refError,
  disallowedError,
  unknownError,
} from "../errors.js";
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
    try {
      // Must be aligned relitive to the start of the bytecode
      const pos = bytecodeBuffer._offset - orgiginalPosition;
      const _opcode = bytecodeBuffer.shift();
      if (!(_opcode in opcodeMnemonics)) {
        throw new unknownError(`Unknown opcode: ${_opcode} at position ${pos}`);
      }
      const {
        wideFormat,
        format,
        opcode,
        mnemonic,
        resultType,
        stackEffect,
        canTrap,
      } = opcodeMnemonics[_opcode];
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
          {
            const pad = (4 - ((pos + 1) % 4)) % 4; // The +1 is because the opcode itself takes 1 byte
            bytecodeBuffer.read(pad);
            const defaultOffset = bytecodeBuffer.readTwosComplement(4);
            const low = bytecodeBuffer.readTwosComplement(4);
            const high = bytecodeBuffer.readTwosComplement(4);

            const jumpOffsets: SignedIntOperand[] = [];
            const count = high - low + 1;
            for (let i = 0; i < count; i++) {
              jumpOffsets.push(
                encapsulateOperand(
                  "signedInt",
                  bytecodeBuffer.readTwosComplement(4)
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
          {
            const pad = (4 - ((pos + 1) % 4)) % 4;
            bytecodeBuffer.read(pad);

            const defaultOffset = bytecodeBuffer.readTwosComplement(4);
            const npairs = bytecodeBuffer.readTwosComplement(4);

            const matchOffsetPairs: [SignedIntOperand, SignedIntOperand][] = [];
            for (let i = 0; i < npairs; i++) {
              const match = bytecodeBuffer.readTwosComplement(4);
              const offset = bytecodeBuffer.readTwosComplement(4);
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
              case "b": // Unsigned byte
                operands.push(
                  encapsulateOperand("unsignedByte", bytecodeBuffer.shift())
                );
                break;
              case "c": // signed byte
                operands.push(
                  encapsulateOperand(
                    "signedByte",
                    bytecodeBuffer.readTwosComplementByte()
                  )
                );
                break;
              case "k": {
                // constant pool index (u1)
                const poolIndex = bytecodeBuffer.shift();
                const poolEntry = constantPool[poolIndex];
                if (poolEntry === undefined) {
                  throw new refError(
                    `Bytecode refered to non-exsistent constant pool entry (Constant pool index ${poolIndex}, position ${pos}, opcode ${opcode} (${mnemonic}))`
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
                    `Bytecode refered to non-exsistent constant pool entry (Constant pool index ${poolIndex}, position ${pos}, opcode ${opcode} (${mnemonic}))`
                  );
                }
                operands.push(
                  encapsulateOperand("constantPoolEntry", poolEntry)
                );
                break;
              }
              case "i": // Local variable index (unsigned byte)
                operands.push(
                  encapsulateOperand(
                    "localVariableIndex",
                    bytecodeBuffer.shift()
                  )
                );
                break;
              case "o": // Signed branch byte (signed byte)
                operands.push(
                  encapsulateOperand(
                    "branchByte",
                    bytecodeBuffer.readTwosComplementByte()
                  )
                );
                break;
              case "_":
                const value = bytecodeBuffer.shift();
                if (value !== 0) {
                  throw new disallowedError(
                    `Expected 0 byte for "_" bytecode format, got ${value} (at position ${pos}, opcode ${opcode} (${mnemonic}))`
                  );
                }
                break;
              default:
                throw new unknownError(
                  `Uknown bytecode format char: "${char}" in opcode ${opcode.toString(
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
    } catch (e) {
      log(
        "error",
        `Caught error while parsing bytecode, last 5 successfully parsed bytecode dump: ${JSON.stringify(
          instructions.slice(-5),
          null,
          2
        )}`
      );
      throw e;
    }
  }
  if (wideMode) {
    throw new noOperandError("Wide mode has no operand");
  }
  return instructions;
}

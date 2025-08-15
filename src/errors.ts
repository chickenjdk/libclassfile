import { createClassifyedError, chickenJVMError } from "@chickenjdk/common";
export const classFileError = createClassifyedError(
  "Class file error",
  chickenJVMError
);
export const classFileParseError = createClassifyedError(
  "Parse error",
  classFileError
);
export const refError = createClassifyedError(
  "Refrence error",
  classFileParseError
);
export const formatError = createClassifyedError(
  "Invalid class file format",
  classFileParseError
);
export const unknownError = createClassifyedError(
  "Unknown type",
  classFileParseError
);
export const disallowedError = createClassifyedError(
  "Disallowed",
  classFileParseError
);
export const noOperandError = createClassifyedError(
  "No operand",
  classFileParseError
);
// Constant pool stuff
export const unknownTagError = createClassifyedError(
  "Unknown tag",
  unknownError
);
export const invalidPointerError = createClassifyedError(
  "Invalid pointer",
  classFileParseError
);
export const constantPoolUnknownTagError = createClassifyedError(
  "Constant pool",
  unknownTagError
);
// Attributes stuff
export const unknownAttributeError = createClassifyedError(
  "Unknown attribute",
  classFileParseError
);
// Bytecode stuff
export const unknownBytecodeOpcodeError = createClassifyedError(
  "Unknown bytecode opcode",
  unknownError
);
export const unwidenableOpcodeError = createClassifyedError(
  "Opcode does not support the wide modifyer",
  disallowedError
);
export const disallowedLengthError = createClassifyedError(
  "Disallowed length",
  disallowedError
);

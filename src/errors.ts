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
// Constant pool stuff
export const unknownTagError = createClassifyedError(
  "Unknown tag",
  unknownError
);
export const invalidPointerError = createClassifyedError(
  "Invalid pointer",
  classFileParseError
);
// Attributes stuff
export const unknownAttributeError = createClassifyedError(
  "Unknown attribute",
  classFileParseError
);

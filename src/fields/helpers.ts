
import {
  constantPoolEntry,
  findInfoTypeByTag,
  poolTags, helpers
} from "../constantPool/index.js";
import { flags } from "./types.js";

/**
 * Generate a description for a field entry.
 * @param index The index of the field
 * @param flags The flags of the field
 * @returns The string description of the field entry
 */
export function makeDescription(index: number, flags: flags): string {
  return `Field entry with index ${index} and flags ${Object.entries(flags)
    .filter(([_key, value]) => value)
    .map(([key]) => key.slice(2))
    .join(", ")}`;
}

/**
 * Asserts that the provided constant pool entry matches the expected tag(s).
 * @param expectedTag The expected tag for the entry
 * @param entryIndex The index of the entry
 * @param entry The entry
 * The last paramiter is a tuple of [index, flags] for description generation (it is destructured in the function, therefore meaning as far as I know you can't use a \@param to describe it in JSDoc)
 * @returns Nothing
 */
export function assertInfoType<expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: constantPoolEntry,
  [index, flags]: [number, flags]
): asserts entry is findInfoTypeByTag<
  expectedTag extends any[] ? expectedTag[number] : expectedTag
> {
  return helpers.assertInfoType(
    expectedTag,
    entryIndex,
    entry,
    makeDescription(index, flags)
  );
}

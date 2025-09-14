import { assertNotUndefined } from "@chickenjdk/common";
import { strictEqual } from "assert";
import { poolTags, constantPoolEntry, findInfoTypeByTag } from "./types.js";
import { invalidPointerError } from "../errors.js";

export function assertInfoType<expectedTag extends poolTags | poolTags[]>(
    expectedTag: expectedTag,
    entryIndex: number,
    entry: constantPoolEntry,
    name: string
  ): asserts entry is findInfoTypeByTag<
    expectedTag extends any[] ? expectedTag[number] : expectedTag
  > {
    assertNotUndefined(
      entry,
      new invalidPointerError(
        `${name} points to a undefined entry in the constant pool (Index ${entryIndex})`
      ) as Error
    );
    if (Array.isArray(expectedTag)) {
      if (!expectedTag.includes(entry.tag as poolTags)) {
        throw new invalidPointerError(
          `${name} points to a entry in the constant pool with tag ${
            entry.tag
          } (and index ${entryIndex}), but expected tag ${expectedTag.join(
            " or "
          )}`
        );
      }
    } else {
      strictEqual(
        entry.tag,
        expectedTag,
        new invalidPointerError(
          `${name} points to a entry in the constant pool with tag ${entry.tag} (and index ${entryIndex}), but expected tag ${expectedTag}`
        ) as Error
      );
    }
  }
import { makeMutable, Expand } from "@chickenjdk/common";
import { expansionIgnoreListSafe } from "../types.js";
import { FieldDescriptor, MethodDescriptor } from "../signature/index.js";

/**
 * @private
 */

export type customAssertInfoType = <expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: constantPoolEntry
) => asserts entry is findInfoTypeByTag<
  expectedTag extends any[] ? expectedTag[number] : expectedTag
>;

type addIndex<T> = T extends any ? T & { index: number } : never;
export type unusableInfo = Expand<
  addIndex<{ tag: 0 }>,
  expansionIgnoreListSafe
>;
export type classInfo = Expand<
  addIndex<{ name: utf8Info; tag: 7 }>,
  expansionIgnoreListSafe
>;
export type refInfo = Expand<
  addIndex<
    | {
        tag: 9;
        class: classInfo;
        nameAndType: nameAndTypeInfo;
      }
    | {
        tag: 10;
        class: classInfo;
        nameAndType: nameAndTypeInfo;
      }
    | {
        tag: 11;
        class: classInfo;
        nameAndType: nameAndTypeInfo;
      }
  >,
  expansionIgnoreListSafe
>;
export type stringInfo = Expand<
  addIndex<{ tag: 8; value: utf8Info }>,
  expansionIgnoreListSafe
>;
export type integerInfo = Expand<
  addIndex<{ tag: 3; value: number }>,
  expansionIgnoreListSafe
>;
export type floatInfo = Expand<
  addIndex<{ tag: 4; value: number }>,
  expansionIgnoreListSafe
>;
export type longInfo = Expand<
  addIndex<{ tag: 5; value: bigint }>,
  expansionIgnoreListSafe
>;
export type doubleInfo = Expand<
  addIndex<{ tag: 6; value: number }>,
  expansionIgnoreListSafe
>;
/**
 * Descriptor entry is the raw descriptor string entry, not used in the constant pool writer, it is just for lower-level use in parsing
 */
export type nameAndTypeInfo = Expand<
  addIndex<{
    tag: 12;
    name: utf8Info;
    descriptorEntry: utf8Info; 
    descriptor: FieldDescriptor | MethodDescriptor;
  }>,
  expansionIgnoreListSafe
>;
export type utf8Info = Expand<
  addIndex<{ tag: 1; value: string }>,
  expansionIgnoreListSafe
>;
export type methodHandleInfo = Expand<
  addIndex<
    {
      tag: 15;
    } & (
      | { referenceKind: 1 | 2 | 3 | 4; reference: refInfo & { tag: 9 } }
      | { referenceKind: 5 | 8; reference: refInfo & { tag: 10 } }
      | { referenceKind: 6 | 7; reference: refInfo & { tag: 10 | 11 } }
      | { referenceKind: 9; reference: refInfo & { tag: 11 } }
    )
  >,
  expansionIgnoreListSafe
>;
export type methodTypeInfo = Expand<
  addIndex<{ tag: 16; descriptor: utf8Info }>,
  expansionIgnoreListSafe
>;
export type dynamicInfo = Expand<
  addIndex<{
    tag: 17 | 18;
    bootstrapMethodAttrIndex: number;
    nameAndType: nameAndTypeInfo;
  }>,
  expansionIgnoreListSafe
>;
export type moduleOrPackageInfo = moduleInfo | packageInfo;
export type moduleInfo = Expand<
  addIndex<{ tag: 19; name: utf8Info }>,
  expansionIgnoreListSafe
>;
export type packageInfo = Expand<
  addIndex<{ tag: 20; name: utf8Info }>,
  expansionIgnoreListSafe
>;

export type constantPoolEntry =
  | unusableInfo
  | classInfo
  | refInfo
  | stringInfo
  | integerInfo
  | floatInfo
  | longInfo
  | doubleInfo
  | nameAndTypeInfo
  | utf8Info
  | methodHandleInfo
  | methodTypeInfo
  | dynamicInfo
  | moduleOrPackageInfo;
export type PoolType = {
  [key in number]: constantPoolEntry;
};
export type poolTags = constantPoolEntry["tag"];
/**
 * @private
 */
export type findInfoTypeByTag<Tag extends poolTags> = Extract<
  constantPoolEntry,
  { tag: Tag }
>;
export type loadableTags =
  | integerInfo
  | floatInfo
  | longInfo
  | doubleInfo
  | classInfo
  | stringInfo
  | methodHandleInfo
  | methodTypeInfo
  | dynamicInfo;
/**
 * @private
 */
const _loadableTags = [16, 17, 18, 7, 8, 3, 4, 5, 6, 15] as const;
export const loadableTags = _loadableTags as makeMutable<typeof _loadableTags>;

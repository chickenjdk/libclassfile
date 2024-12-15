import { makeMutable } from "@chickenjdk/common";

type addIndex<T> = T extends any ? T & { index: number } : never;
export type classInfo = addIndex<{ name: utf8Info; tag: 7 }>;
export type refInfo = addIndex<
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
>;
export type stringInfo = addIndex<{ tag: 8; value: utf8Info }>;
export type integerInfo = addIndex<{ tag: 3; value: number }>;
export type floatInfo = addIndex<{ tag: 4; value: number }>;
export type longInfo = addIndex<{ tag: 5; value: bigint }>;
export type doubleInfo = addIndex<{ tag: 6; value: number }>;
export type nameAndTypeInfo = addIndex<{
  tag: 12;
  name: utf8Info;
  descriptor: utf8Info;
}>;
export type utf8Info = addIndex<{ tag: 1; value: string }>;
export type methodHandleInfo = addIndex<
  {
    tag: 15;
  } & (
    | { referenceKind: 1 | 2 | 3 | 4; reference: refInfo & { tag: 9 } }
    | { referenceKind: 5 | 8; reference: refInfo & { tag: 10 } }
    | { referenceKind: 6 | 7; reference: refInfo & { tag: 10 | 11 } }
    | { referenceKind: 9; reference: refInfo & { tag: 11 } }
  )
>;
export type methodTypeInfo = addIndex<{ tag: 16; descriptor: utf8Info }>;
export type dynamicInfo = addIndex<{
  tag: 17 | 18;
  bootstrapMethodAttrIndex: number;
  nameAndType: nameAndTypeInfo;
}>;
export type moduleOrPackageInfo = moduleInfo | packageInfo;
export type moduleInfo = addIndex<{ tag: 19; name: utf8Info }>;
export type packageInfo = addIndex<{ tag: 20; name: utf8Info }>;

export type PoolType = {
  [key in number]:
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
};
export type poolTags = PoolType[number]["tag"];
export type findInfoTypeByTag<Tag extends poolTags> = Extract<
  PoolType[number],
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
const _loadableTags = [16, 17, 18, 7, 8, 3, 4, 5, 6, 15] as const;
export const loadableTags = _loadableTags as makeMutable<typeof _loadableTags>;

import { strictEqual } from "assert";
import { assertNotUndefined } from "@chickenjdk/common";
import { poolTags, findInfoTypeByTag } from "./constantPool/types";
import { PoolType } from "./constantPool/types";
import { invalidPointerError } from "./errors";

export function assertInfoType<expectedTag extends poolTags | poolTags[]>(
  expectedTag: expectedTag,
  entryIndex: number,
  entry: PoolType[number],
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
export const predefinedValidClassFileAttributesMap = {
  ClassFile: [
    "SourceFile",
    "InnerClasses",
    "EnclosingMethod",
    "SourceDebugExtension",
    "BootstrapMethods",
    "Module",
    "ModulePackages",
    "ModuleMainClass",
    "NestHost",
    "NestMembers",
    "Record",
    "PermittedSubclasses",
    "Synthetic",
    "Deprecated",
    "Signature",
    "RuntimeVisibleAnnotations",
    "RuntimeVisibleTypeAnnotations",
  ],
  field_info: [
    "ConstantValue",
    "Signature",
    "RuntimeVisibleAnnotations",
    "RuntimeVisibleTypeAnnotations",
  ],
  method_info: [
    "Code",
    "Exceptions",
    "RuntimeVisibleParameterAnnotations",
    "AnnotationDefault",
    "MethodParameters",
    "Signature",
    "RuntimeVisibleAnnotations",
    "RuntimeVisibleTypeAnnotations",
  ],
  record_component_info: [
    "Signature",
    "RuntimeVisibleAnnotations",
    "RuntimeVisibleTypeAnnotations",
  ],
  Code: [
    "LineNumberTable",
    "LocalVariableTable",
    "LocalVariableTypeTable",
    "StackMapTable",
    "RuntimeVisibleTypeAnnotations",
  ],
} as const;
/*
Run in browser
const detable = (tbody) =>
  Array.from(tbody.children).map((line) =>
    [
      line.children[1].children[0].textContent,
      line.children[0].children[0].textContent,
      // @ts-ignore
    ].map((text) => text.replace(/[^A-z,]/gm, "").split(","))
  );
Format
const map = (unmapped
//: [string[], string[]][]
) =>
  unmapped.reduce((map, item) => {
    for (const key of item[0]) {
      if (!(key in map)) {
        map[key] = [];
      }
      map[key].push(...item[1]);
    }
    return map;
  }, // {} as { [key in string]: string[] }
  );
*/


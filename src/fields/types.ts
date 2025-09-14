import { Expand } from "@chickenjdk/common";
import { utf8Info } from "../constantPool/index.js";
import { getLegalAttributes } from "../attributes/index.js";
import { expansionIgnoreList } from "../types.js";

export type flags = {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isVolatile: boolean;
  isTransient: boolean;
  isSynthetic: boolean;
  isEnum: boolean;
};
export type fields = Expand<
  {
    flags: flags;
    name: utf8Info;
    descriptor: utf8Info;
    attributes: getLegalAttributes<"field_info">;
  }[],
  expansionIgnoreList
>;
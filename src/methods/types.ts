import { Expand } from "@chickenjdk/common";
import { methodsAccessFlags } from "../accessFlags/index.js";
import { utf8Info } from "../constantPool/index.js";
import { getLegalAttributes } from "../attributes/index.js";
import { expansionIgnoreList } from "../types.js";

export type methods = Expand<
  {
    accessFlags: methodsAccessFlags;
    name: utf8Info;
    descriptor: utf8Info;
    attributes: getLegalAttributes<"method_info">;
  }[],
  expansionIgnoreList
>;
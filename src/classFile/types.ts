import { accessFlags } from "../accessFlags/index.js";
import { attribute } from "../attributes/index.js";
import { classInfo, PoolType } from "../constantPool/index.js";
import { fields } from "../fields/index.js";
import { methods } from "../methods/index.js";

// Classfile type
export type classFile = {
  minorVersion: number;
  majorVersion: number;
  constantPool: PoolType;
  accessFlags: accessFlags;
  thisClass: classInfo;
  superClass: classInfo | undefined;
  interfaces: classInfo[];
  fields: fields;
  methods: methods;
  attributes: attribute[];
};

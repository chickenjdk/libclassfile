import { disallowedError } from "../errors.js";
import {
  AnyNonVoidType,
  AnyType,
  ArrayType,
  BaseType,
  ClassType,
  Extends,
  FieldDescriptor,
  Super,
  TypeArgument,
  TypeParameter,
  Wildcard,
} from "./types.js";
// Normal helpers
// ---------------- low-level cursor ----------------
export class Cursor {
  s: string;
  i: number = 0;
  constructor(s: string) {
    this.s = s;
  }
  peek(): string | null {
    return this.i < this.s.length ? this.s[this.i] : null;
  }
  take(): string {
    if (this.i >= this.s.length) throw new Error(`Unexpected end at ${this.i}`);
    return this.s[this.i++];
  }
  expect(ch: string) {
    const g = this.take();
    if (g !== ch)
      throw new Error(`Expected '${ch}' but got '${g}' @${this.i - 1}`);
  }
  done(): boolean {
    return this.i >= this.s.length;
  }
}
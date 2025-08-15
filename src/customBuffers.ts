import { writableBufferBase } from "@chickenjdk/byteutils";

export class flushSinkWritableBuffer extends writableBufferBase<false> {
  #quete: {
    type:
      | "push"
      | "array"
      | "arrayBackwards"
      | "uint8Array"
      | "uint8ArrayBackwards";
    value: any[];
  }[] = [];
  /**
   * @private
   */
  get _queteLength(){
    return this.#quete.length
  }
  length: number = 0;
  constructor() {
    super();
  }

  push(...args: any[]): void {
    this.length++;
    this.#quete.push({ type: "push", value: args });
  }

  writeArray(...args: any[]): void {
    this.length += args[0].length;
    this.#quete.push({ type: "array", value: args });
  }

  writeArrayBackwards(...args: any[]): void {
    this.length += args[0].length;
    this.#quete.push({ type: "arrayBackwards", value: args });
  }

  writeUint8Array(...args: any[]): void {
    this.length += args[0].length;
    this.#quete.push({ type: "uint8Array", value: args });
  }

  writeUint8ArrayBackwards(...args: any[]): void {
    this.length += args[0].length;
    this.#quete.push({ type: "uint8ArrayBackwards", value: args });
  }

  /**
   * Write all of the queted data to the provided writableBuffer.
   * @param sink The writableBuffer to write the data to.
   */
  flush(sink: writableBufferBase): void {
    for (const item of this.#quete) {
      switch (item.type) {
        case "push":
          // @ts-ignore
          sink.push(...item.value);
          break;
        case "array":
          // @ts-ignore
          sink.writeArray(...item.value);
          break;
        case "arrayBackwards":
          // @ts-ignore
          sink.writeArrayBackwards(...item.value);
          break;
        case "uint8Array":
          // @ts-ignore
          sink.writeUint8Array(...item.value);
          break;
        case "uint8ArrayBackwards":
          // @ts-ignore
          sink.writeUint8ArrayBackwards(...item.value);
          break;
      }
    }
    this.#quete = [];
    this.length = 0;
  }
}

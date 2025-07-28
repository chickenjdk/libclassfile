const { readClassFile, parseBytecode } = require("./");
const { readFileSync } = require("fs");
const { readableBuffer } = require("@chickenjdk/byteutils");
const testFile = readFileSync("./main.class");
const parsedFile = readClassFile(new readableBuffer(testFile));
console.log(JSON.stringify(parsedFile));

const testBytecodeCases = [
  {
    label: "nop (b)",
    bytes: Uint8Array.from([0x00]), // nop
  },
  {
    label: "bipush (bc)",
    bytes: Uint8Array.from([0x10, 0x7f]), // bipush 127
  },
  {
    label: "sipush (bcc)",
    bytes: Uint8Array.from([0x11, 0x01, 0x00]), // sipush 256
  },
  {
    label: "iload (bi)",
    bytes: Uint8Array.from([0x15, 0x02]), // iload 2
  },
  {
    label: "wide iload (wbii)",
    bytes: Uint8Array.from([0xc4, 0x15, 0x01, 0x00]), // wide iload 256
  },
  {
    label: "iinc (bic)",
    bytes: Uint8Array.from([0x84, 0x01, 0x05]), // iinc 1 by 5
  },
  {
    label: "wide iinc (wbiicc)",
    bytes: Uint8Array.from([0xc4, 0x84, 0x01, 0x00, 0x00, 0x05]), // iinc 256 by 5
  },
  {
    label: "invokespecial (bkk)",
    bytes: Uint8Array.from([0xb7, 0x00, 0x0a]), // invokespecial #10
  },
  {
    label: "invokeinterface (bkkc)",
    bytes: Uint8Array.from([0xb9, 0x00, 0x05, 0x02, 0x00]), // invokeinterface #5, count 2, padding
  },
  {
    label: "invokedynamic (bkk__)",
    bytes: Uint8Array.from([0xba, 0x00, 0x07, 0x00, 0x00]), // invokedynamic #7, 2-byte zero
  },
  {
    label: "newarray (boo)",
    bytes: Uint8Array.from([0xbc, 0x0a]), // newarray (type: 10 = int)
  },
  {
    label: "multianewarray (bkkc)",
    bytes: Uint8Array.from([0xc5, 0x00, 0x0b, 0x02]), // #11, dimensions=2
  },
  {
    label: "tableswitch (special, padded to 4 bytes)",
    bytes: Uint8Array.from([
      0xaa, // tableswitch
      0x00,
      0x00,
      0x00, // padding (3 bytes)
      0xff,
      0xff,
      0xff,
      0xff, // default -1
      0x00,
      0x00,
      0x00,
      0x02, // low = 2
      0x00,
      0x00,
      0x00,
      0x03, // high = 3
      0x00,
      0x00,
      0x00,
      0x0a, // offset 10
      0x00,
      0x00,
      0x00,
      0x0b, // offset 11
    ]),
  },
  {
    label: "lookupswitch (special, padded to 4 bytes)",
    bytes: Uint8Array.from([
      0xab, // lookupswitch
      0x00,
      0x00, 
      0x00, // padding (3 bytes)
      0x00,
      0x00,
      0x00,
      0x00, // default = 0
      0x00,
      0x00,
      0x00,
      0x02, // npairs = 2
      0x00,
      0x00,
      0x00,
      0x01, // match 1
      0x00,
      0x00,
      0x00,
      0x0a, // offset 10
      0x00,
      0x00,
      0x00,
      0x02, // match 2
      0x00,
      0x00,
      0x00,
      0x0b, // offset 11
    ]),
  },
];
for (const test of testBytecodeCases) {
  console.log(`Testing: ${test.label}`);
  const bytecodeBuffer = new readableBuffer(test.bytes);
  const instructions = parseBytecode(bytecodeBuffer);
  console.log(JSON.stringify(instructions, null, 2));
}

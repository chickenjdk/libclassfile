const { readClassFile } = require("./");
const { readFileSync } = require("fs");
const { readableBuffer } = require("@chickenjdk/byteutils");
const testFile = readFileSync("./main.class");
console.log(JSON.stringify(readClassFile(new readableBuffer(testFile))));

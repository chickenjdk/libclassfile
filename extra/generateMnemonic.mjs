const regex =
  /def\(\s*(_\w+)\s*,\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*(?:(?:"([^"]*)")|nullptr)\s*,\s*(\w+)\s*,\s*(-?\d+)\s*,\s*(true|false)\s*,\s*(_\w+)\s*\)/g;

let match;
let i = 0;
const data = [];
const res = (
  await (
    await fetch(
      "https://github.com/openjdk/jdk/raw/refs/heads/master/src/hotspot/share/interpreter/bytecodes.cpp"
    )
  ).text()
).match(/#define BYTECODES_DO\(def\)[\S\s]*?JVM_BYTECODES_DO\(def\)/)[0];
const table = {
  bJJ: "bkk", // invoke*
  bJJ__: "bkk__", // invokedynamic
  bJJJJ: "", // tableswitch / lookupswitch → special
};

function remapMnemonics(mnemonics) {
  const result = [];
  for (const mnemonic of mnemonics) {
    result.push(
      mnemonic.format in table
        ? Object.assign({}, mnemonic, {
            format: table[mnemonic.format],
          })
        : mnemonic
    );
  }
  return result;
}
while ((match = regex.exec(res)) !== null) {
  const [
    _,
    enumName,
    mnemonic,
    format,
    wideFormat,
    resultType,
    stackEffect,
    canTrap,
    javaName,
  ] = match;

  const instr = {
    mnemonic,
    format,
    wideFormat: wideFormat || null,
    resultType,
    stackEffect: parseInt(stackEffect),
    canTrap: canTrap === "true",
    enumName,
    opcode: i++,
  };

  data.push(instr);
}
console.log(JSON.stringify(remapMnemonics(data)));

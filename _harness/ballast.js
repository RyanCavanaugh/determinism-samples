// node ballast.js <file> <count> [prefix]  -- appends <count> slow-to-check mapped-type statements to <file>
const fs = require("fs");
const [file, count, prefix = "B"] = process.argv.slice(2);
let s = "\n";
for (let i = 0; i < +count; i++) {
    s += `type ${prefix}${i}<T> = { [K in keyof T as \`q${i}_\${K & string}\`]: T[K] extends object ? ${prefix}${i}<T[K]> : T[K] };\n`;
    s += `declare const ${prefix}v${i}: ${prefix}${i}<{ a: { b: { c: number, d: string }, e: boolean }, f: ${i} }>;\n`;
    s += `export const ${prefix}r${i}: number = ${prefix}v${i}.q${i}_a.q${i}_b.q${i}_c + ${i};\n`;
}
fs.appendFileSync(file, s);

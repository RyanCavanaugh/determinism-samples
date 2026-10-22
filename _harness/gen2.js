// node gen2.js <outDir> --core <dir> --k1 4 --k2 4 [--padSize 40] [--k3 0]
// Two-group layout: core files + k1 pads in g1/, k2 pads in g2/ (and optionally k3 pads in g3/).
// Each directory becomes a locality group, so with N = number of groups the core's owner races
// the other checkers, which steal the light core files from the back of its queue once they go idle.
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const out = path.resolve(args[0]);
function opt(n, d) { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; }
const core = path.resolve(opt("core"));
const padSize = +opt("padSize", "40");
const ks = [+opt("k1", "4"), +opt("k2", "4"), +opt("k3", "0"), +opt("k4", "0")];
fs.rmSync(out, { recursive: true, force: true });
const coreCfg = fs.existsSync(path.join(core, "tsconfig.json")) ? JSON.parse(fs.readFileSync(path.join(core, "tsconfig.json"), "utf8")) : null;
const files = [];
fs.mkdirSync(path.join(out, "g1"), { recursive: true });
const order = coreCfg ? coreCfg.files : fs.readdirSync(core).filter(f => /\.[cm]?[tj]sx?$/.test(f));
for (const f of order) {
    const src = path.join(core, f);
    if (!fs.existsSync(src) || fs.readFileSync(src, "utf8").trim() === "") continue;
    fs.mkdirSync(path.dirname(path.join(out, "g1", f)), { recursive: true });
    fs.copyFileSync(src, path.join(out, "g1", f));
    files.push("g1/" + f);
}
const ghost = +opt("ghost", "0");
const sizes = opt("sizes", "") ? opt("sizes").split(",").map(Number) : [];
function pad(k) {
    let s = `// padding ${k}\n`;
    if (ghost) s += ("// " + "x".repeat(97) + "\n").repeat(Math.ceil(ghost / 100));
    const size = sizes[k] ?? padSize;
    for (let i = 0; i < size; i++) {
        s += `type P${k}_${i}<T> = { [K in keyof T as \`p${i}_\${K & string}\`]: T[K] extends object ? P${k}_${i}<T[K]> : T[K] };\n`;
        s += `declare const v${k}_${i}: P${k}_${i}<{ a: { b: { c: number, d: string }, e: boolean }, f: ${i} }>;\n`;
        s += `export const r${k}_${i}: number = v${k}_${i}.p${i}_a.p${i}_b.p${i}_c + ${i};\n`;
    }
    return s;
}
let id = 0;
ks.forEach((k, g) => {
    for (let j = 0; j < k; j++) {
        const name = `g${g + 1}/pad${id}.ts`;
        fs.mkdirSync(path.dirname(path.join(out, name)), { recursive: true });
        fs.writeFileSync(path.join(out, name), pad(id++));
        files.push(name);
    }
});
const base = coreCfg ? coreCfg.compilerOptions : { strict: true, noEmit: true, types: [] };
const extra = JSON.parse(opt("tsconfig", "{}"));
if (args.includes("--skipLib")) extra.skipLibCheck = true;
fs.writeFileSync(path.join(out, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...base, ...extra }, files }, null, 1));
console.log(`wrote ${out}: ${files.length} files`);

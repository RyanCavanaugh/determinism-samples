// node gen.js <outDir> --core <dirWithCoreFiles> [--pads 16] [--padSize 40] [--layout flat|split]
//   [--tsconfig '{"strict":true,...}'] [--order a.ts,b.ts]
// Copies the core files (the poison/victim files) into outDir and adds independent padding files that do real
// checking work, so that work stealing between checkers is a timing race.
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const out = path.resolve(args[0]);
function opt(n, d) { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; }
const core = path.resolve(opt("core"));
const pads = +opt("pads", "16");
const padSize = +opt("padSize", "40");
const layout = opt("layout", "flat");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const coreFiles = [];
(function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.name === "tsconfig.json") continue;
        const r = rel ? rel + "/" + e.name : e.name;
        if (e.isDirectory()) walk(path.join(d, e.name), r);
        else coreFiles.push(r);
    }
})(core, "");
for (const f of coreFiles) {
    fs.mkdirSync(path.dirname(path.join(out, f)), { recursive: true });
    fs.copyFileSync(path.join(core, f), path.join(out, f));
}
const coreCfg = fs.existsSync(path.join(core, "tsconfig.json")) ? JSON.parse(fs.readFileSync(path.join(core, "tsconfig.json"), "utf8")) : null;
const order = opt("order", "") ? opt("order").split(",") : coreCfg ? coreCfg.files : coreFiles.filter(f => /\.(m|c)?[tj]sx?$/.test(f));

function pad(k) {
    let s = `// padding ${k}\n`;
    for (let i = 0; i < padSize; i++) {
        s += `type P${k}_${i}<T> = { [K in keyof T as \`p${i}_\${K & string}\`]: T[K] extends object ? P${k}_${i}<T[K]> : T[K] };\n`;
        s += `declare const v${k}_${i}: P${k}_${i}<{ a: { b: { c: number, d: string }, e: boolean }, f: ${i} }>;\n`;
        s += `export const r${k}_${i}: number = v${k}_${i}.p${i}_a.p${i}_b.p${i}_c + ${i};\n`;
    }
    return s;
}
const padFiles = [];
for (let k = 0; k < pads; k++) {
    const name = layout === "split" ? `pads${k % 2}/pad${k}.ts` : `pad${k}.ts`;
    fs.mkdirSync(path.dirname(path.join(out, name)), { recursive: true });
    fs.writeFileSync(path.join(out, name), pad(k));
    padFiles.push(name);
}
const base = coreCfg ? coreCfg.compilerOptions : { strict: true, noEmit: true, target: "es2022", module: "esnext", moduleResolution: "bundler", types: [], skipLibCheck: true };
const extra = JSON.parse(opt("tsconfig", "{}"));
const pos = opt("padPos", "middle");
let files;
if (pos === "middle" && order.length >= 2) files = [order[0], ...padFiles, ...order.slice(1)];
else if (pos === "end") files = [...order, ...padFiles];
else files = [...padFiles, ...order];
fs.writeFileSync(path.join(out, "tsconfig.json"), JSON.stringify({ compilerOptions: { ...base, ...extra }, files }, null, 1));
console.log(`wrote ${out}: ${files.length} files`);

// node fromtest.js <test.ts> <outDir>  — converts a compiler test (// @option, // @filename) into a project.
const fs = require("fs");
const path = require("path");
const [src, outArg] = process.argv.slice(2);
const out = path.resolve(outArg);
const text = fs.readFileSync(src, "utf8");
const opts = {};
const files = [];
let cur = null;
const harnessOnly = new Set(["filename", "noimplicitreferences", "currentdirectory", "fullemitpaths", "nolib", "link", "libfiles", "notypesandsymbols", "symlink", "includebuiltfile"]);
for (const line of text.split(/\r?\n/)) {
    const m = /^\s*\/\/\s*@(\w+)\s*:\s*(.*?)\s*$/.exec(line);
    if (m) {
        const k = m[1].toLowerCase();
        if (k === "filename") { cur = { name: m[2].replace(/^\//, ""), lines: [] }; files.push(cur); continue; }
        if (!harnessOnly.has(k)) opts[m[1]] = m[2];
        if (!cur) continue;
    }
    if (!cur) { cur = { name: path.basename(src), lines: [] }; files.push(cur); }
    cur.lines.push(line);
}
const compilerOptions = { types: [], noEmit: true };
for (const [k, v] of Object.entries(opts)) {
    const val = v === "true" ? true : v === "false" ? false : /^\d+$/.test(v) ? +v : v.split(",")[0].trim();
    compilerOptions[k[0].toLowerCase() + k.slice(1)] = val;
}
if (compilerOptions.declaration || compilerOptions.outDir) { compilerOptions.noEmit = false; compilerOptions.outDir = compilerOptions.outDir ? "out" : "out"; }
fs.rmSync(out, { recursive: true, force: true });
for (const f of files) {
    const p = path.join(out, f.name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, f.lines.join("\n"));
}
fs.writeFileSync(path.join(out, "tsconfig.json"), JSON.stringify({ compilerOptions, files: files.map(f => f.name).filter(n => /\.[cm]?[jt]sx?$/.test(n)) }, null, 1));
console.log(out, JSON.stringify(compilerOptions));

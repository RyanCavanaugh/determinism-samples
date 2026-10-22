// Usage: node run.js <projectDir> [--runs N] [--checkers 1,2,4] [--mode steal|random|both|go]
//   [--args "--noEmit ..."] [--env K=V,K2=V2] [--show]
// Runs tsrs repeatedly and histograms the distinct outputs (stdout + exit code).
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const proj = path.resolve(args[0]);
function opt(name, def) {
    const i = args.indexOf("--" + name);
    return i >= 0 ? args[i + 1] : def;
}
const runs = +opt("runs", "20");
const checkers = opt("checkers", "1,2,4").split(",").map(Number);
const mode = opt("mode", "both");
const tsrs = opt("tsrs", "Q:\\tsrs-nondet\\tsrs\\target\\debug\\tsrs.exe");
const extra = opt("args", "").split(" ").filter(Boolean);
const extraEnv = Object.fromEntries(opt("env", "").split(",").filter(Boolean).map(kv => kv.split("=")));
const show = args.includes("--show");

const hist = new Map();
function record(label, n, assignment) {
    const env = { ...process.env, ...extraEnv };
    delete env.TSRS_CHECKER_ASSIGNMENT;
    if (assignment) env.TSRS_CHECKER_ASSIGNMENT = assignment;
    const r = spawnSync(tsrs, ["-p", proj, "--incremental", "false", "--pretty", "false", "--checkers", String(n), ...extra], {
        env, encoding: "utf8", cwd: proj, maxBuffer: 1 << 28,
    });
    let out = (r.stdout || "") + "\n#exit " + r.status;
    const outDir = path.join(proj, "out");
    if (fs.existsSync(outDir)) {
        const walk = d => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
        for (const f of walk(outDir)) out += `\n#file ${path.relative(outDir, f)}\n` + fs.readFileSync(f, "utf8");
        fs.rmSync(outDir, { recursive: true, force: true });
    }
    if (r.stderr && /panick/.test(r.stderr)) out += "\n#PANIC";
    const h = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
    if (!hist.has(h)) hist.set(h, { out, labels: [] });
    hist.get(h).labels.push(label);
}

for (const n of checkers) {
    if (mode === "steal" || mode === "both") for (let i = 0; i < runs; i++) record(`steal/N${n}`, n, null);
    if (mode === "random" || mode === "both") for (let s = 1; s <= runs; s++) record(`random:${s}/N${n}`, n, `random:${s}`);
    if (mode === "go") for (let i = 0; i < runs; i++) record(`go/N${n}`, n, "go");
    if (mode === "locality") record(`locality/N${n}`, n, "locality");
}

const total = [...hist.values()].reduce((a, v) => a + v.labels.length, 0);
console.log(`${path.basename(proj)}: ${hist.size} distinct output(s) over ${total} runs`);
for (const [h, v] of hist) {
    const counts = {};
    for (const l of v.labels) {
        const k = l.replace(/random:\d+/, "random");
        counts[k] = (counts[k] || 0) + 1;
    }
    console.log(`  [${h}] ${v.labels.length}x  ${JSON.stringify(counts)}  e.g. ${v.labels.slice(0, 4).join(" ")}`);
    if (show || hist.size > 1) console.log(v.out.split("\n").slice(0, +opt("lines", "25")).map(l => "      " + l).join("\n"));
}
const dump = opt("dump", null);
if (dump) {
    fs.mkdirSync(dump, { recursive: true });
    for (const [h, v] of hist) fs.writeFileSync(path.join(dump, `${h}-${v.labels.length}x.txt`), v.out);
}
process.exitCode = hist.size > 1 ? 1 : 0;

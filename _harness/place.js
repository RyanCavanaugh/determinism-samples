// node place.js <projectDir> <N> [runs=1]  -- prints checker index per file (completion order) for each run
const { spawnSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");
const [proj, n, runs = "1"] = process.argv.slice(2);
const t = path.join(os.tmpdir(), "ft-" + process.pid + ".txt");
for (let r = 0; r < +runs; r++) {
    fs.rmSync(t, { force: true });
    spawnSync("Q:\\tsrs-nondet\\tsrs\\target\\debug\\tsrs.exe", ["-p", proj, "--incremental", "false", "--pretty", "false", "--checkers", n],
        { env: { ...process.env, TSRS_FILE_TIMES: t, TSRS_CHECKER_ASSIGNMENT: undefined } });
    const lines = fs.readFileSync(t, "utf8").trim().split("\n").map(l => l.split("\t"));
    console.log(lines.map(c => `${c[0]}:${path.basename(c[6] || "?")}(${(+c[1] * 1000).toFixed(1)})`).join(" "));
}

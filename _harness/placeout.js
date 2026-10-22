// node placeout.js <projectDir> <N> <runs> [random]  -- per run: output hash + checker:file order (lib files hidden), completion order
// With "random", run r uses TSRS_CHECKER_ASSIGNMENT=random:<r+1>; otherwise default steal mode.
const { spawnSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto");
const [proj, n, runs = "1", mode = "steal"] = process.argv.slice(2);
const t = path.join(os.tmpdir(), "ft-" + process.pid + ".txt");
const extra = (process.env.PLACE_ARGS || "").split(" ").filter(Boolean);
for (let r = 0; r < +runs; r++) {
    fs.rmSync(t, { force: true });
    const env = { ...process.env, TSRS_FILE_TIMES: t };
    delete env.TSRS_CHECKER_ASSIGNMENT;
    if (mode === "random") env.TSRS_CHECKER_ASSIGNMENT = "random:" + (r + 1);
    const res = spawnSync("Q:\\tsrs-nondet\\tsrs\\target\\debug\\tsrs.exe", ["-p", proj, "--incremental", "false", "--pretty", "false", "--checkers", n, ...extra], { env, encoding: "utf8" });
    const h = crypto.createHash("sha1").update(res.stdout + res.status).digest("hex").slice(0, 6);
    const lines = fs.readFileSync(t, "utf8").trim().split("\n").map(l => l.split("\t"));
    const files = lines.filter(c => !/lib\.[\w.]*d\.ts$/.test(c[6] || ""));
    console.log(h + "  " + files.map(c => `${c[0]}:${path.basename(c[6] || "?")}(${(+c[1] * 1000).toFixed(1)})`).join(" "));
}

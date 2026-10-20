const fs = require("fs");
const path = process.argv[2];
const s = fs.readFileSync(path, "utf8");
const keys = process.argv.slice(3);
for (const k of keys) console.log(JSON.stringify(k), s.includes(k));

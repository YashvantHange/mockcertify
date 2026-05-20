import fs from "fs";
import path from "path";

const OPEN_WRONG = "<motion-card";
const OPEN_RIGHT = "<" + ["d", "i", "v"].join("");
const CLOSE_WRONG = "</motion-card>";
const CLOSE_RIGHT = "</" + ["d", "i", "v"].join("") + ">";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      let c = fs.readFileSync(p, "utf8");
      const orig = c;
      c = c.split(OPEN_WRONG).join(OPEN_RIGHT);
      c = c.split(CLOSE_WRONG).join(CLOSE_RIGHT);
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log("fixed", p);
      }
    }
  }
}
walk("apps/web/src");

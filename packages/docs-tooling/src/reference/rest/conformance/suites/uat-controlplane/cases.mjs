import fs from "node:fs"
import { buildControlSuite } from "../_shared/control-cases.mjs"

const overrides = JSON.parse(fs.readFileSync(new URL("./overrides.json", import.meta.url), "utf8"))

export default (ctx, call) => {
  const s = buildControlSuite(ctx, call)
  const all = [...(s.setupCases || []), ...(s.cases || [])]
  for (const c of all) {
    const o = overrides[c.id]
    if (o) Object.assign(c, o)
  }
  return s
}

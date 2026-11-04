// Suite wrapper: shared dataplane catalog + per-suite expectation overrides.
// Overrides are the ONLY place a suite may diverge from the shared catalog —
// every override is visible in git and reported in round results.
import fs from "node:fs"
import { buildSuite } from "./catalog.mjs"

const overrides = JSON.parse(fs.readFileSync(new URL("./overrides.json", import.meta.url), "utf8"))

export default (ctx, call) => {
  const s = buildSuite(ctx, call)
  const applied = []
  for (const c of s.cases) {
    const o = overrides[c.id]
    if (o) { Object.assign(c, o); applied.push(c.id) }
  }
  s.overridesApplied = applied
  return s
}

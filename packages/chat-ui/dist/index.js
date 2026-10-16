import { jsx as s, Fragment as B, jsxs as d } from "react/jsx-runtime";
import g, { forwardRef as w, createElement as _ } from "react";
import k from "react-markdown";
import C from "remark-gfm";
function v(t, e) {
  if (t && t !== "cloud-guides") return t;
  if (e) {
    if (/milvus\.io/i.test(e)) return "external-web";
    if (/github\.com/i.test(e)) return "external-github";
    if (/\/byoc[-/]/.test(e) || /docs-byoc/.test(e)) return "byoc-guides";
    if (/\/reference\//.test(e)) return "api-reference";
  }
  return t || "cloud-guides";
}
function x(t) {
  if (!t || t.startsWith("/")) return !1;
  try {
    return !new URL(t).hostname.endsWith("zilliz.com");
  } catch {
    return !1;
  }
}
const j = "_dot_4g0w8_1", A = {
  dot: j
}, M = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444"
}, $ = {
  high: "High confidence — answer directly supported by documentation",
  medium: "Medium confidence — partially supported by documentation",
  low: "Low confidence — limited documentation available"
};
function T({ level: t, labels: e }) {
  if (!t) return null;
  const n = (e == null ? void 0 : e[t]) ?? $[t];
  return /* @__PURE__ */ s(
    "span",
    {
      className: A.dot,
      style: { backgroundColor: M[t] },
      title: n,
      "aria-label": n
    }
  );
}
const I = "_tag_10jgb_1", H = "_tagByoc_10jgb_13", E = "_tagCloud_10jgb_18", U = "_tagApi_10jgb_23", S = "_tagExternal_10jgb_28", p = {
  tag: I,
  tagByoc: H,
  tagCloud: E,
  tagApi: U,
  tagExternal: S
}, P = {
  "byoc-guides": { label: "BYOC", className: p.tagByoc },
  "cloud-guides": { label: "CLOUD", className: p.tagCloud },
  "api-reference": { label: "API", className: p.tagApi },
  "external-web": { label: "EXT", className: p.tagExternal },
  "external-github": { label: "GITHUB", className: p.tagExternal }
};
function G({ section: t, url: e }) {
  const n = v(t, e), a = P[n];
  return a ? /* @__PURE__ */ s("span", { className: `${p.tag} ${a.className}`, children: a.label }) : null;
}
const R = "_citationSup_1i14i_1", q = "_citationLink_1i14i_9", W = "_citationGroup_1i14i_22", h = {
  citationSup: R,
  citationLink: q,
  citationGroup: W
};
function z(t) {
  const e = [];
  let n = "", a = !1;
  for (const i of t.split(`
`)) {
    if (i.trim().startsWith("```")) {
      a = !a, n += i + `
`;
      continue;
    }
    if (a) {
      n += i + `
`;
      continue;
    }
    i.trim() === "" && n.trim() ? (e.push(n.trim()), n = "") : n += i + `
`;
  }
  return n.trim() && e.push(n.trim()), e;
}
const m = {
  table: ({ children: t, ...e }) => {
    const n = g.Children.map(t, (a) => g.isValidElement(a) && a.type === "tr" ? /* @__PURE__ */ s("tbody", { children: a }) : a);
    return /* @__PURE__ */ s("table", { ...e, children: n });
  }
};
function O(t, e, n) {
  const a = t.map((r) => {
    var c, l;
    return /* @__PURE__ */ s("sup", { className: h.citationSup, children: /* @__PURE__ */ s(
      "a",
      {
        href: (c = e[r]) == null ? void 0 : c.url,
        className: h.citationLink,
        title: (l = e[r]) == null ? void 0 : l.title,
        onClick: () => {
          var u;
          return n == null ? void 0 : n(r, (u = e[r]) == null ? void 0 : u.url);
        },
        children: r + 1
      }
    ) }, `cite-${r}`);
  });
  return { ...m, p: ({ children: r, ...c }) => /* @__PURE__ */ d("p", { ...c, children: [
    r,
    /* @__PURE__ */ s("span", { className: h.citationGroup, children: a })
  ] }) };
}
function Z({ text: t, sources: e, grounding: n, onCitationClick: a }) {
  if (!n || !e || n.length === 0)
    return /* @__PURE__ */ s(k, { remarkPlugins: [C], components: m, children: t });
  const i = /* @__PURE__ */ new Map();
  for (const c of n)
    i.set(c.paragraphIndex, c.sourceIndices);
  const r = z(t);
  return /* @__PURE__ */ s(B, { children: r.map((c, l) => {
    const u = i.get(l), b = u && u.length > 0 ? O(u, e, a) : m;
    return /* @__PURE__ */ s(k, { remarkPlugins: [C], components: b, children: c }, l);
  }) });
}
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const y = (...t) => t.filter((e, n, a) => !!e && e.trim() !== "" && a.indexOf(e) === n).join(" ").trim();
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const D = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const V = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (e, n, a) => a ? a.toUpperCase() : n.toLowerCase()
);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const N = (t) => {
  const e = V(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
};
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var K = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const X = (t) => {
  for (const e in t)
    if (e.startsWith("aria-") || e === "role" || e === "title")
      return !0;
  return !1;
};
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Y = w(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: a,
    className: i = "",
    children: r,
    iconNode: c,
    ...l
  }, u) => _(
    "svg",
    {
      ref: u,
      ...K,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: a ? Number(n) * 24 / Number(e) : n,
      className: y("lucide", i),
      ...!r && !X(l) && { "aria-hidden": "true" },
      ...l
    },
    [
      ...c.map(([b, L]) => _(b, L)),
      ...Array.isArray(r) ? r : [r]
    ]
  )
);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const f = (t, e) => {
  const n = w(
    ({ className: a, ...i }, r) => _(Y, {
      ref: r,
      iconNode: e,
      className: y(
        `lucide-${D(N(t))}`,
        `lucide-${t}`,
        a
      ),
      ...i
    })
  );
  return n.displayName = N(t), n;
};
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const J = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
], Q = f("external-link", J);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const F = [
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ],
  ["path", { d: "M17 14V2", key: "8ymqnk" }]
], tt = f("thumbs-down", F);
/**
 * @license lucide-react v0.577.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const et = [
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ],
  ["path", { d: "M7 10v12", key: "1qc93n" }]
], nt = f("thumbs-up", et), at = "_userBubble_1pbjm_1", st = "_userLabel_1pbjm_8", ot = "_userText_1pbjm_17", rt = "_assistantBubble_1pbjm_25", ct = "_assistantHeader_1pbjm_33", it = "_assistantLabel_1pbjm_41", lt = "_assistantMeta_1pbjm_47", ut = "_assistantContent_1pbjm_55", dt = "_thinkingText_1pbjm_82", pt = "_sourcesSection_1pbjm_87", bt = "_sourcesLabel_1pbjm_91", ht = "_sourcesList_1pbjm_101", _t = "_sourceLink_1pbjm_110", mt = "_sourceIndex_1pbjm_128", ft = "_externalIcon_1pbjm_143", gt = "_feedbackRow_1pbjm_148", kt = "_feedbackBtn_1pbjm_155", Ct = "_feedbackBtnActive_1pbjm_173", o = {
  userBubble: at,
  userLabel: st,
  userText: ot,
  assistantBubble: rt,
  assistantHeader: ct,
  assistantLabel: it,
  assistantMeta: lt,
  assistantContent: ut,
  thinkingText: dt,
  sourcesSection: pt,
  sourcesLabel: bt,
  sourcesList: ht,
  sourceLink: _t,
  sourceIndex: mt,
  externalIcon: ft,
  feedbackRow: gt,
  feedbackBtn: kt,
  feedbackBtnActive: Ct
};
function Lt({
  message: t,
  isStreaming: e = !1,
  isLast: n = !1,
  onFeedback: a
}) {
  if (t.role === "user")
    return /* @__PURE__ */ d("div", { className: o.userBubble, children: [
      /* @__PURE__ */ s("div", { className: o.userLabel, children: "User" }),
      /* @__PURE__ */ s("div", { className: o.userText, children: t.text })
    ] });
  const r = e && n && !t.text;
  return /* @__PURE__ */ d("div", { className: o.assistantBubble, children: [
    /* @__PURE__ */ d("div", { className: o.assistantHeader, children: [
      /* @__PURE__ */ s("div", { className: o.assistantLabel, children: t.agent ? `Agent · ${t.agent}` : "Agent" }),
      /* @__PURE__ */ s("div", { className: o.assistantMeta, children: t.toolCallCount !== void 0 && e && n && /* @__PURE__ */ d("span", { children: [
        "searching docs (",
        t.toolCallCount,
        " tool call",
        t.toolCallCount > 1 ? "s" : "",
        ")..."
      ] }) })
    ] }),
    /* @__PURE__ */ s("div", { className: o.assistantContent, children: r ? /* @__PURE__ */ s("span", { className: o.thinkingText, children: t.toolCallCount ? `searching docs (${t.toolCallCount} tool call${t.toolCallCount > 1 ? "s" : ""})...` : "thinking..." }) : /* @__PURE__ */ s(
      Z,
      {
        text: t.text,
        sources: t.sources,
        grounding: t.grounding
      }
    ) }),
    t.sources && t.sources.length > 0 && /* @__PURE__ */ d("div", { className: o.sourcesSection, children: [
      /* @__PURE__ */ s("span", { className: o.sourcesLabel, children: "Sources" }),
      /* @__PURE__ */ s("ul", { className: o.sourcesList, children: t.sources.map((c, l) => /* @__PURE__ */ s("li", { children: /* @__PURE__ */ d(
        "a",
        {
          href: c.url,
          className: o.sourceLink,
          title: c.title,
          ...x(c.url) ? { target: "_blank", rel: "noopener noreferrer" } : {},
          children: [
            /* @__PURE__ */ s("span", { className: o.sourceIndex, children: l + 1 }),
            /* @__PURE__ */ s("span", { children: c.title }),
            /* @__PURE__ */ s(G, { section: c.section, url: c.url }),
            x(c.url) && /* @__PURE__ */ s(Q, { size: 12, className: o.externalIcon })
          ]
        }
      ) }, l)) })
    ] }),
    t.text && !e && a && /* @__PURE__ */ d("div", { className: o.feedbackRow, children: [
      /* @__PURE__ */ s(T, { level: t.confidence }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `${o.feedbackBtn} ${t.feedback === "up" ? o.feedbackBtnActive : ""}`,
          onClick: () => a("up"),
          "aria-label": "Helpful",
          title: "Helpful",
          children: /* @__PURE__ */ s(nt, { size: 12 })
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `${o.feedbackBtn} ${t.feedback === "down" ? o.feedbackBtnActive : ""}`,
          onClick: () => a("down"),
          "aria-label": "Not helpful",
          title: "Not helpful",
          children: /* @__PURE__ */ s(tt, { size: 12 })
        }
      )
    ] })
  ] });
}
export {
  Lt as ChatMessageBubble,
  T as ConfidenceDot,
  Z as GroundedMarkdown,
  G as SourceTag,
  x as isExternalUrl,
  v as resolveSection
};

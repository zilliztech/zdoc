# REST Upstream Pipeline v2 — Decisions-First 架构设计

日期：2026-10-29。状态：已实施（P1a 起逐 PR 落地；本稿为 decisions-first 流水线的验收锚点）。
前置：`tmp/2026-10-29-llm-structured-output-reliability-research.md`（调研 + PoC 结果）、`tmp/poc-decisions-assembler/`（可复跑原型）、`tmp/2026-10-28-rest-upstream-pipeline-design.md`（v1 设计，本文取代其 agent/apply 段）。
PoC 锚点：确定性链路 465/465 逐字段等价 + applied 字节一致；模型链路 id 零发明、立场一致 98.8%、applier 全闸一次绿。

## 0. 一句话架构

模型只对机器生成的候选行表态（adopt/skip/ledger），一切结构化字节（opPath/value/evidence）由确定性 assembler 从 diff 坐标 + fragment 形状推导，既有 applier 全闸零改动继续做防御纵深。九跑失败族（坏 opPath/丢成员/错下标/坏 boolean）在新架构下结构上不可能发生。

## 1. 流水线总览

```
lock(pinned 上游, 既有)
  → diff(既有)
  → 【新】candidates 生成器: diff → candidates.jsonl
      每行 {d: <diffEntryId>, c: "<opKey> scope branch field change before→after [requiresConfirmation=...]"}
      可表态类别全给(upstream-modified/unattributed/upstream-added/upstream-added-field/upstream-added-param/fragment-only)；
      其中 added-field/added-param/fragment-only 是规则 7 的"预期 omit"诱饵行（模型须显式回避），ledger-classified 与 zdoc-only 不过筛
  → 【新】分批模型调用: candidates → decisions.jsonl(按 fragment 分批, 每批独立重试)
      直连 API(DeepSeek 官方/网关, 复用既有回退链), temperature 0, response_format json_object
      容错解析(偶发多 JSON 对象: 提取首个完整对象/逐对象缝合, 失败重试)
      模型零文件访问、零仓库路径、零结构组装 —— 不再需要 codex/danger-full-access/staging 文件面
  → 【新】assembler: decisions + diff + staging fragments → change-set(v1 兼容形态)
      opPath/evidence 从 diff 坐标推导(x-tab-label 定位分支/#941 membership/#946 parameter 坐标)
      required 做 schema 级聚合推导(同 schema 多条变更一次 membership 变换)
      skip 行不产条目; 未知 id fail-closed
  → applier(既有, 零改动): schema 校验 + 绑定/确认/走私闸 + normalizations
  → 既有门禁链: receipt v2/T4 accounting/lifecycle-track/migration/#931 inventory
  → PR(既有 body 总预算) + 人审(采纳/分歧/skip 理由/ledger 提案/normalizations)
```

## 2. 关键设计决策

**D1 agent runner：codex agentic turn → 直连 API 分批调用**（取代旧 R1/R4 的大半）
PoC 实证 23 批分批调用稳定。收益：单批小、独立重试（45min 大单块 timeout 问题消解）；模型零文件访问（隔离扫描/路径注入面消失，#746 P1 教训的整个类别不复存在）；不再需要 codex-sdk/bwrap/danger-full-access。代价：失去 agentic 多步推理——对"纯表态"任务是过度配置，明确放弃。批界=fragment（条目独立表态无跨条目依赖；同 schema 多 required 的关联在 assembler 聚合，不在模型层）。

**D2 change-set 保持 v1 形态，applier 零改动**
PoC 的 assembler 产 v1 兼容条目（opPath/value 齐全），85+ 既有测试、全部闸、normalizations 语义原样保值。旧规划 R2（schema 收窄 discriminated union）的动机是"帮 agent 写对"——agent 不再写 change-set 后该动机消失，降级为 P4 远期防御纵深（assembler 产物过收窄 schema），不阻塞主线。

**D3 候选生成器 = 模型唯一输入面**
一行一候选（id + 机器摘要 + requiresConfirmation 标志）。规则边界从 PoC 校准定稿：①description/summary→adopt；②标量 constraint→adopt；③required 增强→adopt；④required 放宽：带 requiresConfirmation 标志一律 omit，无标志且无歧义才 adopt；⑤unattributed(operation 级)→ledger 提案；⑥upstream-added(新操作)→ledger；⑦upstream-added-field/param→omit（字段归属是人工内容决策，ledgerDraft 闸只认 operation 级——PoC 真闸实证）；⑧id 逐字抄，禁止发明。

**D4 decisions 契约四形态**（contracts/rest-upstream-decisions.schema.json）
`{d, a:"adopt"}` / `{d, a:"skip", reason}` / `{d, a:"ledger", classification, reason, fragment?}` / `{d, a:"adopt", override:true, overrideReason}`（放宽走人工 override 的通道保留）。omit=默认 skip-for-review。逐行校验、逐行报错。

**D5 旧规划处置**：R1（staging 自检包）消解——模型不写文件，自检对象不存在；assembler 是确定性代码，失败即 bug 走测试而非运行时自检。R4（repair turn）缩为批级重试（幂等、带容错解析），无 agentic 回喂。R3a/R3b 被本设计吸收为主线。

**D6 secrets/vars 复用既有布局**：调用器读 `AGENTIC_PROVIDER_API_KEY||DEEPSEEK_API_KEY` + `REST_UPSTREAM_AGENT_BASE_URL||AGENTIC_BASE_URL||DEEPSEEK_BASE_URL` + `REST_UPSTREAM_AGENT_MODEL||AGENTIC_TRANSLATION_MODEL`（ed6f8238e9 回退链原样，只是不再包 codex 层）。PoC 实测网关虚拟 token 失效、DeepSeek 官方 key 可用——生产以官方为主、网关为备，切换零代码（换 vars）。

**D7 人审面升级（PR body）**：在既有 summary/checklist/overrides/normalizations/ledgerDrafts 之外新增**分歧清单**——模型 decisions 与"全 adopt 基线"的差集（哪些 skip 了、为什么），把 required 放宽等模糊判断区显式呈现给评审。PoC 数据：519 候选 464 表态，分歧面天然小且集中。

## 3. PR 规划（取代旧 R1-R4）

| PR | 内容 | 依赖 | 验收锚点 | 规模 |
|---|---|---|---|---|
| **P1a 契约+核心模块** | decisions 契约 schema；`upstreamDiff/candidates.js`+`assembler.js`+CLI；单测覆盖 PoC 全部分支（operation deprecated/parameter(name:in 定位+boolean)/requestBody+response schema/branch 定位/required 两 scope 聚合/skip/ledger/prose override/未知 id fail-closed） | #946 已合（worktree 即此分支） | 从 run6/run9 artifact 摘录的小 fixture 回放：assembler 输出与 PoC 逐字节一致；矩阵登记新路径 | 中 |
| **P1b 调用器** | `scripts/rest-upstream/decide-batches.js`：分批、批级重试、json_object 容错解析（多对象提取）、decisions 汇总落盘；**后置校验——发明 id 行拒收并记录、重复行去重、批级覆盖率闸（分母=stance-expected 基线：候选减去规则 5 flagged 与规则 7 预期 omit 类，分子只数基内表态；默认下限 0.5——闸抓 33 批 4.7% 那种退化批而非强制完备，0.8 会误杀网关 v4.1-flash 真实的 66.7% 保守表态）**；system prompt=D3 规则；单测注入模拟 fetch（含多对象/坏 id/超时/低覆盖） | P1a | PoC 的 candidates-25 fixture 端到端绿；矩阵登记 | 中 |
| **P2 workflow 切换** | `rest-upstream-refresh.yml`：agent 步骤（codex thread）→ candidates 生成 + decide-batches + assembler；applier/门禁链/land 步骤零改动；`codex-rest-refresh-agent.md` 退役；prepare 增产 candidates.jsonl（staging 仍产 diff/fragments/meta 供 assembler/applier）；agent timeout 语义改批级 | P1a+P1b | dispatch 一次真实 refresh（预期=首次全绿生产 run）；docs-tooling 调用清单登记核对 | 中 |
| **P3 人审面** | PR body 增分歧清单（decisions vs 全 adopt 基线）；unaddressed 报告对齐 decisions 语义（omitted=skip-for-review + reason 汇总） | P2 | refresh PR body 预算内呈现全量分歧；workflow-policy/contract 测试绿 | 小 |
| **P4（远期，可选）** | change-set v2 收窄 schema 作 assembler 输出的防御纵深；applier 对 assembler 产物的信任度提升（normalizations 语义精化） | P2 稳定后 | — | 小 |

顺序：P1a → P1b → P2 → P3（→ P4 远期）。每 PR 义务照旧：`pnpm test:for-change -- <paths>` 全量、rest-upstream 契约测试、矩阵零 unmapped、README/watchdog 段同步。

**与 #946/第十跑的衔接**：#946 仍合并（applier 侧独立加固，decisions 架构的 parameter required 落库仍走它）。第十跑（旧架构）可选——若 P1/P2 开发周期内上游有新漂移，跑一次拿新鲜 staging 做额外 fixture；否则直接等 P2 的首次生产 run 当"新十跑"。

## 4. 风险与开放问题

- **决策规则漂移**：新漂移形态（新 change kind/新 scope）出现时，候选行照产、模型按通则表态、assembler 对未知形状 fail-closed 拦下——失败面收敛为"补一条 assembler 分支 + 一条规则文案"，不再是九跑式的提示词打磨死路。
- **候选量爆炸**：漂移 10 倍时分批线性扩展（~5000 行/百批），时长/成本上升但 refresh 是人工 dispatch，可接受；必要时加候选行数熔断（超阈值 fail 早、报人工）。
- **模型输出解析**：PoC 23 批见 2 次多对象输出，容错+重试实证够用；若持续失败可换纯 JSONL 逐行约定（无 response_format 依赖）。
- **开放**：①生产模型定官方 flash 还是网关——**网关 v4.1-flash 复跑数据已给答案：首发官方 flash**（98.8% 一致+零发明 vs 网关 91.3%+发明 id+33 批 4.7% 覆盖率；架构闸下两者都安全，只影响人工处理量），网关留备用（vars 一换即切）；②分歧基线固定"全 adopt"（无状态、简单）还是引入历史行为参考——建议先全 adopt；③run6/run9 fixture 摘录范围（建议每个分支形态 1-2 条，控制 fixture 体积）。

## 5. 评审修正案（10-30，code-review needs-changes 全项闭环）

1. **P1 矩阵缺口**：删除的 `.github/prompts/codex-rest-refresh-agent.md` 仍须留在矩阵 paths（全量 diff selector 会走已删路径）；已重加映射。
2. **P1 lifecycle 锚点**：schema 级 required 漂移的 lifecycle 叶子必须锚在 schema 对象（applier 把 required 引用条目绑到"声明该字段的 schema 的 .properties"，字段对象不是合法 locus）；parameter/operation/constraint 漂移仍锚在漂移对象。milvus `--lifecycle-track` 全链 e2e（skeleton→diff→candidates→decisions→assemble→apply）锁定。
3. **P1 coverage 基线**：规则 7 类别（added-field/added-param/fragment-only）从 stance-expected 基线剔除（candidates 记录带 stanceExpected 位），分子只数基内表态（对 flagged 行表态不得掩盖基内遗漏）。
4. **P2 branch-N**：assembler 复刻 applier branchLabelAt 的位置回退（未标 x-tab-label 的 oneOf/anyOf 成员按 branch-N 1 基解析，且要求目标成员仍无标签）。
5. **P2 copyIndex**：参数字段 `name:in#N`（diff 对重复参数的 0 基副本号）按 N 取第 N 次出现，applier 同款剥 # 后缀语义。
6. **P2 越界表态降级**：新增 `stanceError(decision, entry)`（diff-only 可组装性子集），decide-batches 逐行拒收并记录；assembler 自身闸保持 fail-closed 不变。
7. 文档/实现分歧（候选类别、80%→0.5）随本节一并修正；排序改字节稳定 plain `<`（pipeline 其余处同规）。

# 翻译 Agent 效率与稳定性优化:实验报告

> 日期:2026-08-21
> 状态:四项优化已落地,`agentRunner.test.js` 通过
> 实验脚本:`scripts/translation/ab-tool-feedback.js`(throwaway,本地 head-to-head)

## 0. 摘要

现状翻译流水线(`scripts/translation/agentRunner.js`)在 deepseek-v4 上存在严重效率问题:单文件翻译实测 **21.7 分钟**、输出 token 中 **81% 是 reasoning 思考内容**而非译文。通过本地 head-to-head 实验 + provider 能力探测,定位四个根因并落地四项优化。全部结论基于实测,非推测。

## 1. 根因诊断(全部实测)

| # | 根因 | 证据 |
|---|---|---|
| 1 | **reasoning 浪费**:deepseek-v4 默认 `thinking=enabled, effort=high`,翻译 80%+ 输出 token 是"思考" | 单次翻译 completion 32611 token 中 25973 是 reasoning |
| 2 | **temperature 在思考模式下不生效**:思考模式下 `temperature/top_p` 被忽略(官方文档确认),现状 `temperature:0.1` 未起作用,随机性全来自 reasoning → content 偶发为空 | 实测 content 长度/有无随机波动 |
| 3 | **盲发 review/correct 低效**:review 模型盲评 + correction 盲修在确定性质量上无增量,但慢 5.4×、贵 7× | head-to-head 见 §2 |
| 4 | **结构化输出配置错误**:`response_format: json_schema` 被 provider 拒(400),只有 `json_object` 可用 | 探测 HTTP 400 |

## 2. 实证数据

### 2.1 Head-to-head(相同预处理+分块,只变反馈机制)

单文件 `Vector-search.md` ja-JP:

| 指标 | baseline(盲发 review/correct) | tool-assisted(确定性校验自修) | 差异 |
|---|---|---|---|
| 墙钟 | 1304s(21.7min) | 240s(4.0min) | **5.4× 更快** |
| 调用次数 | 14 | 2 | **7× 更少** |
| 输入 token | 139,376 | 18,976 | **7.3× 更少** |
| 输出 token | 101,790 | 35,580 | **2.9× 更少** |
| MDX 错误 | 0 | 0 | 相同 |

调用明细:baseline = `translation×3`(content 空重试)+ `review×9`(pro 反复 500)+ `correction×2`;tool-assisted = `translation×1` + `correction×1`。

### 2.2 thinking 开关对比(翻译,deepseek-v4-flash)

| 配置 | 耗时 | 输出 token | reasoning token | content |
|---|---|---|---|---|
| **`thinking:{type:"disabled"}` + temp 0** | **38s** | **7,949** | **0** | 19,000(完整稳定) |
| thinking enabled + effort low | 185s | 37,393 | 30,612 | 15,784 |
| 默认(无 thinking)+ temp 0.1 | 160s | 32,611 | 25,973 | 15,567 |

关键:`reasoning_effort: low` 无效(仍 30K reasoning),**真正关闭思考只能靠 `disabled`**。

### 2.3 Provider 能力探测(`token.zasdas.com` 代理,deepseek 后端)

| 能力 | 结论 |
|---|---|
| function calling(`tools`) | ✅ 返回 tool_calls |
| `response_format: json_object` | ✅ |
| `response_format: json_schema`(strict) | ❌ 400 |
| prompt caching(自动前缀缓存) | ✅ 命中后 miss 3697→114 |

## 3. 落地方案(四项,已实现)

| # | 改动 | 位置 | 预期收益 |
|---|---|---|---|
| 1 | translation/correction/review 加 `thinking:{type:"disabled"}`(env 可覆盖),`temperature` 统一 0 | `createProviderCall` + `loadAgentConfigsFromEnv` | 输出 4.1×↓、耗时 4.2×↓、content 稳定 |
| 2 | review 的 `response_format` 从 `json_schema` 改 `json_object`(prompt 已要求 JSON,无需额外指令) | `createProviderCall` | 消除 400/卡住 |
| 3 | 加 `TRANSLATION_SKIP_BLIND_REVIEW=true` 开关:开启后 review 环节只用 `deterministicSemanticIssues`,不调 review 模型 | review loop | 快 5×、省 7× token |
| 4 | locale contract 挪到 system prompt 最前,translate/review/correct 共享稳定前缀 | `loadSystemPrompt` | 跨 agent 命中 KVCache |

说明:
- 第 1、2、4 条默认生效(零风险纯参数/前缀改动)。
- 第 3 条默认**关闭**(`TRANSLATION_SKIP_BLIND_REVIEW` 未设为 true 时保持现状),因为它去掉 review 模型的**语义盲评**(术语一致性/漏译/风格),而本实验的质量指标只有 MDX 确定性校验——语义质量增量未量化,需生产 A/B 验证后再默认开启。

## 4. 验证

- `node --test scripts/translation/agentRunner.test.js` → **pass,0 fail**。
- 更新了 `testProviderStructuredOutputIsCapabilityGated` 的断言(`json_schema` → `json_object`)。

## 5. 后续建议

1. **语义质量验证**:head-to-head 只测了 MDX 确定性质量。补一次人评或 LLM-as-judge 对比「盲发 review」vs「工具自校验」的术语一致性/漏译/流畅度,再决定第 3 条默认值。
2. **生产 A/B**:在真实 guides 批次上对比 `TRANSLATION_SKIP_BLIND_REVIEW` 开/关的吞吐、失败率、人评质量。
3. **thinking 细调**:翻译/review 用 `disabled` 已实测最优;若某些场景需要推理,可用 `enabled` + 单独评估 `reasoning_effort`(但实测 low 档不降 reasoning)。
4. **翻译档模型升级**:关掉 thinking 后,同样的 token 预算可换更强模型做翻译,而非烧在思考上。

## 6. 相关文件

- `scripts/translation/agentRunner.js` — 四项改动落点
- `scripts/translation/ab-tool-feedback.js` — 本地 head-to-head 实验脚本(throwaway)
- `scripts/translation/agentRunner.test.js` — 测试 + 断言更新

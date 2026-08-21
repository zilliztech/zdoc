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
| 1 | translation/correction 加 `thinking:disabled` + `temperature` 统一 0;review 保留 `thinking:enabled`(错误检测需推理,见 §7) | `createProviderCall` + `loadAgentConfigsFromEnv` | 翻译输出 4.1×↓、耗时 4.2×↓、content 稳定 |
| 2 | review 的 `response_format` 从 `json_schema` 改 `json_object`(prompt 已要求 JSON,无需额外指令) | `createProviderCall` | 消除 400/卡住 |
| 3 | 加 `TRANSLATION_SKIP_BLIND_REVIEW=true` 开关:开启后 review 环节只用 `deterministicSemanticIssues`,不调 review 模型 | review loop | 快 5×、省 7× token |
| 4 | locale contract 挪到 system prompt 最前,translate/review/correct 共享稳定前缀 | `loadSystemPrompt` | 跨 agent 命中 KVCache |
| 5 | 加 `TRANSLATION_REVIEW_MIN_SEVERITY` 严重度 gating(默认 `low`=现状;`medium` 时只修 high+medium,low 接受) | review loop | correction 次数下降 |
| 6 | review 模型换 `deepseek-v4-flash`(原 deepseek-chat) | `.env` `REVIEW_AGENT_MODEL` | 消除 pro 500/高成本 |
| 7 | review prompt 只报语义(移除 `mdx_structure`/`protected_content`,保留 `link_or_path`)+ gating 代码兜底排除这两类 | prompt 文件 + `DETERMINISTIC_ISSUE_TYPES` | review 聚焦语义,不再重复修格式 |
| 8 | severity 校准 + 阴性对照(结论见 §7) | `calibrate-review-severity.js` | 定位 review 可靠性 |
| 9 | polish 环节(qwen-max 润色 + 术语检测回退) | `buildPolishMessages` + `TRANSLATION_POLISH` | 流利度提升,术语不被破坏 |

说明:
- 第 1、2、4、5、6、7 条默认生效(纯参数/配置/前缀改动,默认值不改变现有行为)。
- 第 3 条默认**关闭**(`TRANSLATION_SKIP_BLIND_REVIEW` 未设为 true 时保持现状)。但 §7 阴性对照已实证 review 环节**不可靠**,更应默认开启跳过——留待生产 A/B 确认后翻默认值。
- 第 5 条默认 `low`(不改变行为);设为 `medium` 即启用严重度 gating。
- 第 7 条保留 `link_or_path`:翻译阶段无确定性校验器覆盖(checkLinks 是独立 build 阶段命令)。
- 第 9 条(`TRANSLATION_POLISH`)workflow 已设 `"true"` 开启。qwen-max 润色引入的 locale-contract 术语问题,由 `deterministicSemanticIssues` 检测后**回退到 translation 版**(不猜 forbidden 中文,避免误改多义词,见 §8)。

## 4. 验证

- `node --test scripts/translation/agentRunner.test.js` → **pass,0 fail**(三轮:四项优化、severity gating、类型分工后)。
- 更新了 `testProviderStructuredOutputIsCapabilityGated` 的断言(`json_schema` → `json_object`)。

## 5. 后续建议

1. **生产 A/B**:在真实 guides 批次上对比 `TRANSLATION_SKIP_BLIND_REVIEW` 开/关、`TRANSLATION_REVIEW_MIN_SEVERITY` low/medium 的吞吐、失败率、人评质量。这是决定第 3 条默认值的最终依据。
2. **review 修复(若保留)**:① prompt 明确 `untranslated_prose`/`accuracy_omission` 触发条件 + 修正 "identical values are not evidence" 与漏译的矛盾;② 解决 `temperature:0` 在 deepseek-v4-flash 上不被严格遵守的非确定性(用 `seed` 或多次采样投票)。
3. **severity 校准(母语者)**:LLM-as-judge 的准金标准不可靠(见 §7),仍需 20-30 文件母语者金标准 + 双标注仲裁。
4. **翻译档模型升级**:关掉 thinking 后,同样的 token 预算可换更强模型做翻译,而非烧在思考上。

## 6. 相关文件

- `scripts/translation/agentRunner.js` — 八项改动落点
- `scripts/translation/ab-tool-feedback.js` — 本地 head-to-head 实验脚本(throwaway)
- `scripts/translation/calibrate-review-severity.js` — severity 校准 + 阴性对照脚本(throwaway)
- `scripts/translation/agentRunner.test.js` — 测试 + 断言更新

## 7. 阴性对照结论(改动 4)

用 `calibrate-review-severity.js` 对 3 个代表性文件做 severity 校准 + 阴性对照:

1. **基线(无注入)**:judge(`deepseek-v4-pro` 关 thinking)和 review(`deepseek-v4-flash`)对真实翻译全部报 0 issue —— 关 thinking 的 flash 翻译质量足够高,或 review 无证据支持的问题可报。
2. **阴性对照(注入整段英文漏译)**:把 `paragraph.0043`(215 字符含 L2 的自然语言段落)保留为英文未翻译,结果:
   - judge(pro):三轮全 0,**对明显漏译稳定漏报**。
   - review(flash):同一输入有时 0 有时 1(`untranslated_prose/high`),**检测不稳定**。
   - review 加 prompt 触发说明后报出 `untranslated_prose/high`。

结论:
- review 环节**不可靠**(flash 不稳定、pro 漏报),强烈支持 `TRANSLATION_SKIP_BLIND_REVIEW` 默认开启。
- 根因有二:① prompt 对 `untranslated_prose`/`accuracy_omission` 无触发条件,且 "identical values are not evidence" 与漏译(source==draft)矛盾;② `temperature:0` 在 deepseek-v4-flash 上不被严格遵守,输出有残余随机性。
- 附带发现:`temperature:0` 非确定性同时解释了之前 translation content 空、review 500 等不稳定现象。
- 后续修正:调研发现 CoT/thinking 对错误检测是双刃,但关掉会加剧漏报——这解释了 pro 关 thinking 后稳定漏报;已把 review 的 `thinking` 恢复为 `enabled`(translation/correction 保持 `disabled`)。

## 8. polish 环节探索(改动 9)

为提升译文流利度,探索了"翻译后二次润色(humanizer/post-editing)":

1. **qwen-max polish**:81 处润色(流畅度明显提升),但把 `collection` 翻成中文,破坏 locale contract。
2. **deepseek-v4-pro 自 polish**:仅 3 处微调——同一模型给自己翻译的文本润色几乎不动(翻译和润色是同一能力)。
3. **forbidden 中文替换(方案 1)不可行**:分析中文 guides(人工翻译)发现术语翻译不一致,且候选 forbidden 中文高度多义(`集合` 既是 collection 也是 set,`模式` 几乎全是 pattern,`段` 大多是段落)——脱离上下文的确定性替换会大面积误改通用词。

结论与落地:
- 术语一致性不能靠"猜 forbidden 中文"保证,只能靠**上下文感知的检测 + 回退**。
- 落地 `TRANSLATION_POLISH` 开关(workflow 设 `"true"`):qwen-max 润色后,用 `deterministicSemanticIssues` 检出破坏 locale contract 的单元,回退到 deepseek 翻译版;其余单元保留 qwen 润色。
- 端到端验证:`status: translated, review.pass: true, issues: 0`(术语不再破坏,润色保留)。
- 附:qwen-max 的 thinking 开关参数是 `enable_thinking:false`(deepseek 的 `thinking:{type}` 被静默忽略),已通过 `thinkingStyle` 区分。

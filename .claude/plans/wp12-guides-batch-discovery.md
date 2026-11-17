# WP12 Guides Batch Discovery Implementation Plan

Approved source: design PR94 at 4d6e225adcf8ca53161f66724b9f10d0140a69af. Overall design approved by user.

## Global Constraints

Only the first read-only discovery/report slice is authorized. All outputs remain writeEligible:false and pending-collector. No production workflow, lock, profile, worker/Python, existing discover/prepare/write or formal-validation changes. No upstream PR, merge, Check/content-PR writes, manual workflow dispatch/rerun. Normal fork PR CI follows existing triggers. Preserve unrelated untracked files.

This temporary fork-only plan records the approved handoff. Remove it by normal commit before final product review; retain plan/commit history and PR body.


> **For agentic workers:** 按 `executing-plans` 逐任务实施；如执行端选用 subagent-driven-development，则沿用任务审查与代码审查两阶段。主会话已完成本计划，自检后交执行 Agent；无需重新提出同一套总体设计。任何越过本片只读边界的变更先交主审。

**Goal:** 提供一个独立、可运行的只读入口，扫描已激活 Guides，按真实上游提交区间与 PR 关联给出批次报告，用 #3848 复现直接映射和待验证依赖。

**Architecture:** core 只做确定性分组；adapters 从固定 M/D 的原始 Git 对象、独立 GitHub refs 和源 Git 历史组装观察。CLI 只落本地报告，observed 与 replay 严格分开，全部报告显式不可写，真实 collector 闭包留到第二片验证；不接现有生产 discover/prepare/write。

**Tech Stack:** TypeScript、现有 Zod/canonical 工具、只读 Git 对象读取、现有固定 TLS GitHub transport、Node ESM CLI、Vitest 与 node:test。

**基线和 PR。** 当前产品 master 是 `4492793f78d6761d042dbef8099007e27c08ddd7`，启动时重新核实；若前进，列出新 SHA 与本片有关的差异并以真实最新 master 为 base。在 fork `liyun95/zdoc` 建立 `review-base/wp12-guides-batch-discovery` 与 `feat/wp12-guides-batch-discovery`，Draft PR 的 base 精确指向所选产品基线，避免用滞后的 fork master。先将本卡对应的短计划写入 Draft PR 正文，随后实施；没有范围变化就直接完成并交回主审，不增加一轮同义计划等待。主审前不提上游、不合并、不手动发起或重跑 workflow；正常 PR CI 沿用仓库既有触发。

**文件职责与边界。** 下列为本片拟用准确路径（包内前缀为 `packages/docs-tooling/src/shared-docs/`）；若拆分调整，交回时解释职责，不能借机重构生产入口。

| 文件 | 职责 |
|---|---|
| `core/updates/batch-discovery.ts`（新） | 报告输入/输出 schema 与确定性分组，不导入网络、fs 或 writer |
| `adapters/updates/batch-discovery.ts`（新） | 组装 M/D 库存、固定 refs、源区间、关联和完整性；所有不完整观察保留 held |
| `adapters/updates/batch-source.ts`（新） | 从已有本地 Git store 读取原始 committed 对象/区间，复用现有读取基础；不 fetch/checkout，不执行源代码 |
| `adapters/updates/batch-github.ts`（新） | 固定仓库的 ref/提交关联/PR identity/files，只做 GET，分页、身份和预算明确 |
| `adapters/updates/remote-github.ts`（视实际需要修改） | 仅为上述固定 Milvus 端点增加精确 allowlist；不扩大方法/host/任意 URL 权限 |
| `testing/updates/batch-discovery.test.ts`、`batch-source.test.ts`、`batch-github.test.ts`（新） | core、真实 Git 和 transport seam 的行为回归；若改 transport，补原有 `remote-github.test.ts` |
| `testing/updates/fixtures/upstream-batch-3848.json`（新） | 固定样本的完整 22 路径/状态、实际 12 页映射与证据来源；开放 PR 保持 replay 标签 |
| `scripts/docs-workflow/shared-guides-update/batch-report.mjs`、`batch-report.test.mjs`、`batch-contract.ts`（新） | 独立 CLI、真实 CLI 测试和最小只读 bundle 导出；不从 writer-contract 导入 mutation 工厂 |

沿用 `parsePageConfig`/`parseSourceConfig`、lock parser、`validateActiveState`/`validateSharedSnapshotRecord` 与既有 repo-path/canonical 校验；先核对签名，不另写宽松解析器。`readSharedDocs` 是配置读取参考，不能直接读未绑定的工作树文件替代 M。源读取参考 `adapters/git-milvus-docs-reader.ts`、`adapters/updates/git.ts` 和 `guides-read-session.ts`；后者的 cache/历史行为不是新的认证能力。禁止将 trim 后的 Git 文本冒充原始 blob 或 NUL 清单。

**报告契约。** 新的只读 schema/domain 与冻结 UpdateUnitPlan、proof、producer envelope 分开。至少包含下面字段，使用严格 schema、规范排序和 canonical JSON；示例仅固定值语义，完整类型在本片 core 定义并由所有消费者复用：

```ts
type BatchDiscoveryReport = {
  schema: 'guides-batch-discovery-v1'
  observation: 'observed' | 'replay'
  status: 'provisional' | 'held'
  writeEligible: false
  tools: string // CLI 自身固定工具提交，与数据 M 分别记录
  pins: { master: string; dev: string; source: string }
  inventory: { configured: number; active: number; published: number }
  groups: {
    id: string // 本只读 domain 的摘要；不是生产 unitKey 或授权
    pageIds: string[]
    seedKeys: string[] // pr:<number> 或已证实的 commit:<oid>
    closure: 'pending-collector'
    reasons: string[]
  }[]
  reasons: string[]
}
```

同时保留逐页 source file、配置目标、current/oldNext/T、原始变化区间/路径和 source/PR 证据引用；完整未映射、删除、重命名、公共片段及依赖线索清单必须可从报告查到。计数从输入计算，不写死 93/12。组 ID 对完整 pins、排序后的成员/种子及其区间证据摘要做 domain-separated digest；改变 M/D/T 或成员必须改变 ID。顺序变化不应改变 canonical 结果。没有直接变化可说明为 NO_DIRECT_SOURCE_CHANGE，但不称为合格 noop；本片没有资格认证或最终独立性结论。

### Task 1: core 和固定样本。

- [ ] 先提交失败测试，涵盖同 PR 两页合组、共享一页的两个 PR 合组、独立 PR 可区分、显式依赖线索保守合组、输入顺序无关、共同 T 不一致拒绝、未知关联保留 held；任何正例仍为 `writeEligible: false` 和 `pending-collector`。
- [ ] 实现 `discoverBatches(input)`（core 导出），以 page↔seed 的连通分量做确定性分组；未知闭包不能变成独立性证明，不能调用 `computeUpdateUnits` 造假 adoption edge。验证重复页/冲突 pin/重复或不存在 seed 等不一致输入，不静默丢行。
- [ ] 样本冻结 base `5479f04fcf7c379ede9548be1d917795eb4646b3`、head `0115d5854c81f35e43d869955a00371501aa8e19`，保留完整 22 路径与 12 页实际配置映射；将四个公共片段和无映射改动列出，标签明确 `replay`/`upstream-unmerged`，不得为了正例将 merged 改成 true。
- [ ] 运行 `pnpm vitest run packages/docs-tooling/src/shared-docs/testing/updates/batch-discovery.test.ts`，先证明失败，再证明行为通过，提交 core/fixture。测试要实际比较 groups、变更 ID 和 held 原因，而不是只断言配置常量。

核心断言应具有以下可读形状（fixture helper 与函数在同一任务内实现，不依赖未交付类型）：

```ts
const result = discoverBatches(twoPagesInOnePullFixture())
expect(result.groups.map(group => group.pageIds)).toEqual([['page-a', 'page-b']])
expect(result.writeEligible).toBe(false)
expect(result.groups[0].closure).toBe('pending-collector')
expect(discoverBatches(reverseFixtureInput()).groups).toEqual(result.groups)
```

### Task 2: 独立观察与有界读取。

- [ ] 先建真实临时 Git 仓库测试，再实现 `collectBatchDiscovery`（adapter 导出）及 source reader：原始对象证明 oldNext→T，检测根文件与片段差异，完整绑定 before/after 路径和 blob OID；覆盖 merge DAG 与不同旧 next，不能仅沿第一父节点漏掉合入分支。metadata 伪造、对象缺失、浅历史/grafts/replace、目录/链接异常、非祖先和长历史停止。禁止以 GitHub compare 返回的有限 files 列表代替完整原始区间。
- [ ] observed 的 M/D/T 来自固定 GitHub 仓库/ref 的独立读取；工具代码的提交另列 tools，配置/锁只读 committed M，active/snapshot 只读 committed D。源数据路径只是本地 Git 对象来源，不能覆盖 GitHub 仓库 ID、分支或观测 T；入口不接受 caller-supplied SHA 伪装 live。缺对象报告 held，不在 CLI 内补 fetch。
- [ ] 使用 `createRemoteTransport`。只读身份为 zdoc ID `660446555`、Milvus ID `267273319`/track `v3.0.x`；新增精确 GET `/repos/milvus-io/milvus-docs/commits/<40hex>/pulls` 与 `/pulls/<positive>/files`（以及必要的固定仓库 identity/ref/PR GET）。拒绝任意 repo/URL/method/重定向/不允许参数。提交关联会包含非默认分支上的开放 PR，必须核对 merged、base 仓库/track 与已入 T 的原始历史；开放 #3848 不能作为 live 种子。参考 [GitHub commit association](https://docs.github.com/en/rest/commits/commits#list-pull-requests-associated-with-a-commit) 和 [PR files](https://docs.github.com/en/rest/pulls/pulls#list-pull-requests-files)。
- [ ] API 复用 `REMOTE_IO_LIMITS`：jsonBytes 1 MiB、pageSize 100、pages 20、calls 512、request 30 秒、inspection 120 秒；本片 API 累计 body 另限 16 MiB（取现有 expandedBytes 值），原始 Git 累计 stdout 另限 64 MiB（取现有 objectBytes 值）。整次 source/metadata 观察同时计入截止，跨页不得重置。PR files 以 changed_files 与去重全量计数核对，超过当前 20 页容量即 held，不能宣称覆盖 API 的 3,000 文件上限。空关联只有完整成功查询才能记直接提交；失败/歧义/截断分别保留固定原因。Git 读取沿用现有单次字节/时间与 50,000 遍历边界，不扩通用 reader allowlist。
- [ ] 观察后重读 M/D/T；变动则报告 held，旧数据可保留用于诊断，但不可被标为 fresh。只保留安全固定原因，不写 token、签名 URL、环境、原始异常或本机绝对路径。通过真实 Git 与 HTTP seam 的新增测试后提交 adapter/transport。

### Task 3: 可运行 CLI 和报告。

- [ ] observed 形状固定为 `node scripts/docs-workflow/shared-guides-update/batch-report.mjs --source-repo <existing-local-store> --out <empty-directory>`；replay 为 `node scripts/docs-workflow/shared-guides-update/batch-report.mjs --replay <fixture-json> --out <empty-directory>`。严格参数匹配，非法形状在 bundling/联网前 exit 2；GH_TOKEN/GITHUB_TOKEN 只用于 observed GET，不写报告。
- [ ] module-relative 定位工具入口与本机 esbuild，生成最小只读 bundle；从外来 cwd 调用结果一致。out 必须 absent/empty 的安全目录，写入本地 `batch-report.json` 与 `batch-report.md`；拒绝覆盖既有内容及链接路径。replay 输入同 fd 有界普通文件读取，拒绝 FIFO/链接/超限，输入至多 1 MiB；输出各至多 16 MiB，超限不能输出截断的“成功”报告。
- [ ] provisional（含完整 replay）exit 0；数据/观察不完整且能生成完整 held 报告时 exit 1；参数错误 exit 2；无法安全写输出或工具构建失败为非零 stderr 固定错误，不能伪造业务报告。JSON 必须一直显式 `writeEligible:false`，Markdown 顶部说明直接映射/待验证依赖、observed/replay 和限制，不能输出 ready/candidate/accepted 结论。
- [ ] node:test 必须启动真实 CLI（包括 foreign cwd、错误参数、FIFO、超限和输出冲突）；临时 Git + HTTP fixture 驱动 adapter 生成一份 observed 模式测试报告，明确网络/仓库为 fixture。完成 #3848 replay，保留 JSON/Markdown 两份 artifact。通过 `node --test scripts/docs-workflow/shared-guides-update/batch-report.test.mjs` 后提交 CLI。

### Task 4: 最终集成与交回。

- [ ] 用最终 base/head 运行 `pnpm test:for-change -- --base review-base/wp12-guides-batch-discovery --head HEAD`。所有新路径必须被发现；core/adapter 对应 `test:shared-docs`，脚本对应 `test:shared-guides-update`。检查分组 discovery.json 确实含新 Vitest 文件。
- [ ] 运行 selector 的全部命令：至少 `pnpm test:shared-docs`、`pnpm test:shared-guides-update`、`pnpm typecheck`、`pnpm test:workflow-matrix`、`git diff --check`；若实时 selector 要求 policy 等一并完成。遵循既有 Linux capture 拒绝和环境资格，不用新增 skip/超时放宽取得绿色。失败/取消与最终通过分开留证。
- [ ] 自查仅新增只读入口，无 `.github/workflows`、真实 lock、profile-v1/v2、生产 discover/prepare/write、formal-validation、凭据权限或调度改动；本片不能以“缺激活”为由隐藏未实现的 observed/CLI 读取路径。生产明晚 Fetch 不应调用本片入口，产品 CI 可以按既有规则执行新增测试。
- [ ] 更新 fork Draft PR 正文，交回准确 base/head、最终文件清单、selector、测试及 artifacts。附 #3848 原始 22 路径与 12 页映射、每个组的种子与待采集依赖、所有未映射/删除项目；若有真实 observed 实跑，注明观察时间和 pins。网络/权限/缺对象使 observed held 时如实报告，不能只交 replay 却写 observed 已通过。
- [ ] 停在主会话主审，不自动转 Ready、提上游、合并、建内容 PR、写 Check 或手动发起/重跑 workflow（包括 Fetch/Translation）；正常 PR CI 沿用仓库触发。主会话先审设计符合性和行为，再决定上游工具 PR；第二片 profile/collector 另按已确认总体设计补精确实施卡。


# 发布证据链统一规格与开发计划

## 背景与目标

仓库内各发布路径的证据链现状不一致。按业务等价类划分为三组,组内证据链必须一致:

- **拉取组(fetch)**:zh-CN Guides、en Guides、en SDK Reference(python/java/node/go/cli;cpp 尚未发布)。三者均从飞书拉取,证据必须以飞书对象(token、revision)为锚点,绑定到发布内容 hash。
- **导出组(spec-derived)**:en REST、zh-CN REST、ja-JP REST。三者均由 `packages/docs-tooling/src/reference/rest/meta/openapi/` OpenAPI fragment 经 `refGen.js` 导出,不参与翻译流程,证据必须绑定 fragment 集 hash 与生成工具 SHA。
- **翻译组(translation)**:zh-CN Reference、ja-JP Guides、ja-JP SDK Reference。三者均由英文源翻译产出。语义要求:英文源发生变化时允许翻译不全(可检漂移、失败关闭),翻译完成后要求源与译文按 hash 一致。

当前仓库内并存至少五种 manifest 形态(lark-revisions、reference.json、reference-translations.json、.translation-cache/ja-JP.json、guides-source-publication.json),另有 tools-translations.json(无 commit 绑定)与 import.json(records 为空的壳文件)。本规格定义统一目标形态、现状差距与分阶段收敛计划。

## 统一目标形态

### 拉取组记录(五元组)

每个发布文件一条记录:

```json
{
  "manual": "python",
  "contentPath": "content/en/reference/api/python/python/embedding-models.md",
  "docToken": "DOUxxxxxxxx",
  "sourceHash": "<sha256-of-published-file>",
  "revisionId": "<lark-revision-id>"
}
```

锚点是飞书 doc token + revision,hash 是发布产物的 sha256。en 与 zh-CN Guides 使用同一 schema(en Guides 的 manual 为 guides/guides-byoc;zh Guides 为同一飞书源发布的中文站点文件)。

### 导出组记录

每个 locale 一份导出清单,例如 `generated/<locale>/manifests/rest-derivation.json`:

```json
{
  "schemaVersion": 1,
  "locale": "ja-JP",
  "fragmentHashes": {"01-basic-v2.json": "<sha256>"},
  "toolingSha": "<40-hex>",
  "generatedAt": "<utc>"
}
```

记录本 locale 导出所依据的完整 OpenAPI fragment 文件集与 hash、生成工具 commit。三个 locale 使用同一 schema;en 的 fragment 集即权威源本身。REST 永不进入翻译 manifest;已退役的 `translation/ja-JP/rest` 与 `translation/zh-CN-reference/rest` 单元保持退役。

### 翻译组记录(五元组 + 状态机)

每个翻译文件一条记录,统一采用现有 `generated/zh-CN/manifests/reference-translations.json` 的记录形态并扩展至 ja-JP:

| 字段 | 含义 |
 | --- | --- |
| manual | 所属手册/组(guides 或 SDK 组) |
| sourcePath / targetPath | 英文源与译文路径 |
| sourceCommit | 源提交(40-hex) |
| sourceHash / targetHash | 双边 sha256 |
| status | translated \| unchanged \| retired |

状态机语义(三语言路径共用):

- `translated`:sourceHash 与 targetHash 双边一致,翻译完成。
- `unchanged`:源已变、译文未跟上,允许的中间态,validation 必须可检出。
- `retired`:英文源已删除/退役,译文按 retirement registry 处理。

`unchanged` 允许存在,但 build/发布门禁必须显式报告漂移计数;不允许出现"源已变而证据链显示 translated"。

### 分组判定的唯一权威

等价类分组本身必须有代码化的权威定义(新增 `packages/docs-tooling/src/publication/evidenceGroups.ts`),按 manual 注册表 + targets.ts 映射派生三组路径集合。fastpath、selector、validation 一律消费该定义,不得各自硬编码。

## 现状差距(经实际检视确认)

| 路径 | 现有证据 | 缺口 |
| --- | --- | --- |
| en SDK Reference | lark-revisions/<manual>.json + reference.json(manual+sourcePath+sourceHash,顶层 sourceCommit) | lark-revisions 为 clean-room-seed 占位,revisionId/run 绑定全 null |
| en Guides | lark-revisions/guides.json(同上) | 同上 |
| zh-CN Guides | guides-source-publication.json 仅路径数组 | 无 hash、无 token、无 revision;快照候选(guides-source-snapshot-candidate.json)已有 doc_token+source_hash 但未带入发布 manifest |
| en/zh/ja REST | refGen.js + build-provenance.json | 无 per-locale 导出清单;ja 无生产单元(build:en 连带) |
| zh-CN Reference | reference-translations.json(完整五元组) | 基准,无缺口 |
| ja-JP Guides/SDK | .translation-cache/ja-JP.json(sourceHash+translatedAt) | 无 sourceCommit、无 status、无 generated/ja-JP manifest、无 validate CLI |
| zh tools | tools-translations.json(sourceHash,无 commit) | schema 与翻译组不一致 |
| import.json | site+sourceCommit,records 空 | 空壳,需定死去留 |
| SDK landing(英文) | python/nodejs/cpp/cli Overview + en home 为 masterAuthoritativePaths(preservedFiles 机制);**java/go 为 dev-owned fetch 产出,master 副本已过期** | java/go 英文 landing 无法在 master 合法编辑 |
| SDK landing(中文) | reference-translations.json 已覆盖 python/java/nodejs/go/cli/cpp;`origin/dev` 自 `f27f2ed1dc` 起已有 cpp 中文手册与根 landing,共 135 个文件 | cpp 内容断点已解除;后续只需按既有翻译 manifest 门禁持续校验 |
| SDK landing(日文) | 仅 python/nodejs/cli 搭各自 SDK 组的车(cache 记录);java/go/cpp 无文件、无 cache 记录、无检测 | reference-landings 组被硬编码为 zh-only(selection.js targetsFor + manifest.js forced-paths 守卫) |
| guides home(中文/日文) | zh home 走飞书中文拉取且 master 上有未认领的遗留副本;ja home 走翻译(guides 单元) | 双轨残留需清理;zh home 路线归属需定 |

## 开发计划

### Phase 1:拉取组拉齐(纯 master 工具 PR,不碰 dev 发布状态)

1. 新增统一拉取 manifest writer:把 guides-source-snapshot-candidate.json 的 doc_token/source_hash 逐文件写入 zh Guides 发布 manifest(schema 用上面拉取组五元组);en Guides/en SDK 同步迁移到该 schema。guides-source-publication.json 旧路径清单格式废弃,由新 manifest 取代。
2. lark-revisions 真实化:sourceRunId 写入真实 run id(保留 clean-room-seed 历史值兼容读取),记录填 revisionId/contentPath/objectToken/objectEditTime。
3. `docs-tooling n --site en` 校验扩展到 zh-CN Guides 清单(hash 逐文件比对)。
4. 测试:manifest writer 单测 + n --site 扩展用例 + clean-room-seed 兼容读取用例。矩阵条目同步 scripts/docs-workflow/test-matrix.json,并运行 selector、workflow-matrix、workflow-policy、git diff --check。

### Phase 2:landing 路线统一(英文 master 可编辑,中文/日文走翻译)

目标契约:所有 landing page(含 Guides home)的英文版本在 master 上自由编辑(preservedFiles + masterAuthoritativePaths);英文 Fetch 直接恢复 master 版本,中文与日文一律走翻译流程,证据进入翻译组 manifest。

1. java/go 英文 landing 升格为 master-authoritative:registry 两条补 `preservedFiles` 声明;`masterAuthoritativePaths` 补 `content/en/reference/api/java/java/java.md` 与 `content/en/reference/api/go/go/go.md`;preserved-files-gate 自然覆盖。**升格前必须先把 dev 上的当前内容带回 master 作为基线**(master 现有副本已过期,直接升格会让 fetch 用旧内容覆盖 dev);升格后 fetch 从 MASTER_SHA 恢复这两个文件,不再消费飞书侧产出,需用一次真实 fetch 重放验证恢复行为。
2. ja SDK landing 翻译单元补齐:`reference-landings` 组扩展到 ja-JP——放开 scripts/translation/selection.js `targetsFor` 的 zh-only 硬编码、放开 scripts/translation/manifest.js 的 forced-paths 守卫、TRANSLATION_UNIT_ORDER 增加 `translation/ja-JP/reference-landings`;java/go/cpp 的 ja 缺失从此以 `missing_target` 形式可检,而非静默空洞。保留单元 ID `reference-landings` 以兼容既有 workflow/artifact,但业务范围在条目 4 扩展为全部 landing pages。
3. cpp 中文 landing 断点已解除:`origin/dev` 的 `f27f2ed1dc` 已通过 `zh-CN-reference` Translation 发布 cpp 中文手册和根 landing,并写入 `generated/zh-CN/manifests/reference-translations.json`;不得重复发布或新增豁免,沿用现有翻译证据链校验。
4. Guides home 统一 landing 路线:`content/en/guides/tutorials/home.md` 保持 `preservedFiles + masterAuthoritativePaths`,英文 Fetch 从 `MASTER_SHA` 直接恢复;`content/zh-CN/guides/tutorials/home.md` 与日文对应路径均由 `reference-landings` 翻译单元生成。中文 Guides Fetch 不得再把 home 声明为自身 `preservedFiles` 或发布证据记录。由于该单元跨 `content/en/reference` 与 `content/en/guides` 两个源根,实现必须把 manifest/validation 从单根假设泛化为显式路径映射,并继续使用现有单元 ID 以兼容 workflow/artifact。
5. 测试:preserved-files-gate 对新增路径的用例、selection/manifest/TRANSLATION_UNIT_ORDER 的双 locale landing 用例、Guides home 的跨根映射及 publication ownership 用例、中文 Guides Fetch 不拥有 home 的负向用例、master 基线带回的 diff 校验。矩阵同步。

### Phase 3:翻译组拉齐(ja manifest 化及跨根 landing manifest)

1. 新增 `generated/ja-JP/manifests/reference-translations.json`(含 Guides 与 SDK),由 .translation-cache/ja-JP.json 的 sourceHash 派生五元组记录;sourceCommit 取翻译发布时的英文源 commit。
2. `reference-manifest` CLI 增加 ja 源/目标根支持(source: content/en/reference + content/en/guides|byoc, target: i18n/ja-JP/...);`validate-reference --site` 增加 ja-JP 分支,复用 `unchanged` 状态机;sidebar derivation 与 navigation validation 补 ja。
3. translation targets.ts 的 ja 状态由 cache 型改为 manifest 型;cache 继续作为翻译过程输入,不再作为发布证据。
4. "允许不全、完成后一致"的门禁:validation 显式输出 pending/stale_source 漂移计数;漂移不阻塞证据链生成(允许不全)。`unchanged` 保留现有共同语义,仅表示源文与目标文件内容相同且两侧 hash 相等;英文源变而译文未跟上时,记录继续锚定上次翻译的历史 `sourceCommit/sourceHash`,并通过与当前英文源比较报告 `stale_source`,不得把过期译文误标为 `translated` 到当前源提交。build 门禁按现状策略处理漂移计数。
5. 测试:ja manifest 派生单测、validate ja 用例、漂移用例(源变译文未跟上 => 历史翻译记录 + `stale_source` 可检)、状态机共用用例。矩阵同步。

### Phase 4:导出组拉齐(REST 导出清单)

迁移采用 producer-first 两步,避免在 `dev` 尚无清单时先启用 build consumer 导致所有构建失败。Phase 4A 先让 en REST lane 原子发布 en/ja-JP 清单、zh-CN REST lane 原子发布 zh-CN 清单,并在 Fetch validate/publish 边界逐文件复核 fragment hash。三份真实清单通过 master-to-dev sync 后的 REST publication 生成并进入 `dev`,不得在 master 手写。Phase 4B 再把已存在的清单接入 build provenance 强制消费,同时完成 import/tools 治理。

1. refGen.js 输出 per-locale rest-derivation.json(fragment hashes + toolingSha);三个 locale 同 schema。en 的清单作为后续生成校验的锚。
2. build/provenance 消费该清单:校验 fragment 集 hash 未被未声明地改动。
3. ja REST 证据路径明确为 build:en 连带的导出校验,不新增翻译单元。
4. import.json 与 tools-translations.json 治理决策落地:import.json 定为废弃(或补真实 records,二选一在本 Phase PR 内定死);tools-translations.json 迁移到翻译组 schema(补 sourceCommit/status)或明确标注为非发布证据。决策已定死:`generated/zh-CN/manifests/import.json` 定为 deprecated(空壳、无 producer/consumer,不得再填充或作为证据消费),`generated/zh-CN/manifests/tools-translations.json` 定为 not-publication-evidence(退役 zh-CN-tools 流程遗留,同名目标路径已由 zh Guides 飞书拉取 manifest 逐文件锚定)。两者登记于 `packages/docs-tooling/src/publication/retiredManifests.ts` 注册表;zh Guides 发布 manifest 写入与 build provenance 输入两侧均按注册表失败关闭。
5. 测试:导出清单生成/校验用例、三 locale schema 一致性用例、import/tools 治理用例。矩阵同步。

### Phase 5:fastpath 与 selector 对齐

1. 新增 evidenceGroups.ts 分组权威;fastpath spec(2026-09-03)按分组修订:ja Reference 放行前置条件 = Phase 3 完成;ja REST 走导出组校验;zh Guides 放行前置条件 = Phase 1 完成。已落地:`packages/docs-tooling/src/publication/evidenceGroups.ts` 按 manual 注册表(sourceType:wiki/drive/onePager => fetch;rest => spec-derived + localizedRestTargets)与 translation targets 派生三组路径集合;退役治理 manifest 不属于任何组。fastpath spec 已修订为 Phase 2 版本(按分组判定范围,状态码 5 更名 UNSUPPORTED_EVIDENCE_PATH)。
2. test-matrix 为三组分别加专属条目(替代当前双语全量 build 的粗粒度 fallback)。已落地 `evidence-fetch-publication`、`evidence-rest-derivation`、`evidence-translation-publication` 三条目;`scripts/docs-workflow/evidence-groups-contract.test.js` 强制矩阵模式与权威派生集合一致(在盘路径必须映射,矩阵模式不得越组)。注意:selector 为并集语义,粗粒度 `published-content-and-generated-state` 兜底条目保留为未分组 dev 状态的安全网,分组条目在其上叠加组专属 focused 校验(validate-revision-inventory --site zh-CN、test:rest-publication-contract、test:translation);validate-reference 依赖 dev 源快照,不能作为 master CI 门禁,由 fastpath 在 dev 基线候选上执行。
3. fastpath 实现按修订后 spec 执行,状态码语义随分组权威更新。已落地 `scripts/translation/fastpath-precheck.js`(依赖注入、失败关闭):分组范围判定、selector 并集执行、zh reference-manifest --write、rest-derivation 导出组校验、inventory 预检恢复、dev 漂移检测、`tmp/translation-fastpath/<run>/` 报告;测试覆盖全部状态码与新放行路径。

### 顺序与依赖

Phase 1 → Phase 2 → Phase 3 → Phase 4 可独立 PR;Phase 5 依赖前四者的分组权威与矩阵条目。Phase 2 的条目 1(升格)与条目 2(ja 单元补齐)可拆两个 PR,升格依赖一次 dev→master 基线带回。每个 Phase 单独走 master PR,矩阵与 workflow-policy 同步更新,不混入发布状态改动。任何 Phase 不得修改 devOwnedPaths(新增 masterAuthoritativePaths 例外声明除外,且必须伴随 preservedFiles 与 gate 用例)、不得绕过 master-to-dev sync、不得改变 docs-production-dev 队列语义。

## 验收标准

1. 拉取组三条路径的发布 manifest 同 schema、同校验入口(`n --site` 覆盖 zh Guides)。
2. 翻译组三路径同 schema、同状态机;英文源变更后未翻译的文件保留历史源锚并可由 CLI 检出为 `stale_source`;真正的 `unchanged` 记录必须满足 sourceHash=targetHash;翻译完成文件的历史 sourceHash/targetHash 双边证据及 sourceCommit provenance 校验通过。
3. 导出组三 locale 同 schema 导出清单,fragment 集 hash 校验纳入 build。
4. evidenceGroups.ts 为唯一分组权威,fastpath/selector/validation 无各自的路径硬编码分组。
5. 每个改动路径在 test-matrix.json 有映射;selector、workflow-matrix、workflow-policy、git diff --check 全绿。
6. 全部 landing page(python/java/nodejs/go/cpp/cli Overview、guides home)的英文版本可在 master 合法编辑(preservedFiles + masterAuthoritativePaths + gate 三者一致);中文与日文 landing 均走翻译流程并进入翻译组证据,ja reference-landings 单元存在且 java/go/cpp 的缺失可检为 missing_target。

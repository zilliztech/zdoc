# ACTIVATE_CHECK_FAILED 收尾修复方案(7 页 → 0)

日期:2026-11-07 · 证据:run **42328325076**(11-07 02:15Z)artifact `guides-sources-en-42328325076` bundle.json + 7 篇旧飞书文档 block 实拉 + milvus-docs pinned 源 heading 集预校验(脚本 /private/tmp/actcheck-scripts/)。

## 机制(代码定论,sharedPageFetch.js:247-284)

首次激活收集**入站锚点引用**(其他源页内链 `extractContentLinks` + Base ref 行,本次 7 页全部来自**内链/mention,无 Base ref 行**),要求每个 anchor block_id 满足两半:
1. **stage 1**(`:264-266`):在旧飞书文档当前 block 列表中存在且为 heading 块 → 否则 `Missing current heading block`
2. **stage 2**(`:273-275`):旧 heading 文本经 writer slug 后必须出现在新输出(milvus-docs pinned + overlay transforms)的 heading 集中 → 否则 `Missing Git anchor`

`reason` 只报**第一个**失败引用;修复必须覆盖全部带 anchor 引用,否则修一条还挂下一条。anchor=null 的引用被 `:263` 跳过,永不阻塞。

## 预校验结论(全量 40 个带 anchor 引用)

- 全部 LIVE 引用(两半校验)**均 OK**——含 single-vector-search 的 `Use Level`/`Get Recall Rate`(overlay 以 `add position: after` 追加 cloud-use-level.md / cloud-get-recall-rate.md,输出中存在)。
- 每页唯一阻塞 = 下表 1 组死锚;**修引用方即可,无需动 milvus-docs 内容、无需 re-pin lock**。
- 81 页已激活成功,7 页卡 fallback(冻结语义:飞书侧编辑发不出、激活成功后被 milvus-docs 版覆盖)。

## 修复清单:9 条死链 / 10 个引用实例 / 6 篇引用方文档

重指目标已逐个验证:旧文档当前存在该 heading 块,且 slug ∈ 新输出 heading 集。

| # | 引用方文档(wiki token) | 引用 block(block_type) | 死锚 → 重指目标 |
|---|---|---|---|
| 1 | May 2026 Release Notes `NRF1wGr3AiWWC1kVfWucZD6Xneb` | `HK2Ad5eZoo0Li8xBN59c2MS2nCh`(text,一个 bullet 含 3 个 mention) | el1 `Basic Vector Search` → single-vector-search `#J302dXJq8oDOOdxA9EYc86Kmnof`(标题已改名)**→ `#CduodT384oDTX7x2IWqcjZv9nSg` `Single-Vector Search`** |
| 2 | 同上 | 同 block el3 | `Grouping Search` → grouping-search `#Ijm0dJ8Y0o1pZWxOX3UcVzhMnVf` **→ `#HoVld8em1oN0mcx5h6VcAKBrnQc` `Perform Grouping Search`** |
| 3 | 同上 | 同 block el5 | `Query` → get-and-scalar-query `#VhCFdfqkooVQMHxxVTyceCyKngg` **→ `#GY2udOT2cohyD4xAXK1cS6xRnQb` `Use Query`** |
| 4 | 同上 | `Hbp1dnESToQaiTxBxeecuQDAnme`(bullet el1) | `Set Collection TTL` → set-collection-ttl `#GfP0dKAmyolahMxQkg7canKKnsb.`(**锚带句点**且块已不存在)**→ `#LFQRdfkNRo8jxvxeq5Jco3aRnSR` `Overview`** |
| 5 | January 2026 Release Notes `ZBEiwpvlbijhYDkmnNScc7zyn5d` | `Gfs6dn34Po8rftxhsiAceFQunVX`(bullet el5) | `Modify Collection` → modify-collections `#share-RspvdjdanoUqAMxRiiJcMcWcnTe`(synced-block 实例锚,**永远非 heading,必死**)**→ `#WvwXdNCwhoRvoMxPVCvcj3aqnJg` `Rename Collection`**(或按 2026-01 发布内容择 `#Bs06diKs4oS5wzxpDaacYt6JnIf` `Example 6: Enable allow_insert_auto_id`,均已验) |
| 6 | Elasticsearch Queries to Milvus `OFl9wHXpriM8aEkoONScpU1lnIf` | `TJEadIRJoo21GZxJ9suc3hLsnkg`(text el3) | `Range operators` → basic-filtering-operators `#RBJCdavN9ooCOfxw2eXcjdtrnlg`(同文本 heading 已换块 id)**→ `#doxcnYhE9SC9LbRqC2Mnl1MjYQb` `Range operators`** |
| 7 | 同上 | `SWCcdOBe2ofrkIxjh1zcOrFPnMf`(text el3) | 同上同目标 |
| 8 | Migrate from Qdrant `LqMIw1DXyiHUjAk9TEAcqHp6nDd` | `WPD8dBA71ofg82xAdSccBzAznQe`(bullet el2) | `Default values` → nullable-fields `#LuoQdz5asouWjbxkKbscpywSnaf`(标题已并入)**→ `#G6Pld95sqoN2aFxdQBPcVGLJnre` `Insert behavior with missing or NULL values`** |
| 9 | Migrate from Pinecone `R33EwQchxiO3HKk4vPnce6vkntc` | `FXujdE3FToDlyTxEVxTcnKzun7e`(bullet el2) | 同上同目标 |
| 10 | Migrate from Tencent Cloud `SwgXwdHG6iqpbUknXrHcOPd7nRe` | `Tx8qdBfrXoO3Xrx8CY4ceoowngg`(bullet el2) | 同上同目标 |

注:旧文档(旧 token)清单 = single-vector-search `BaGlwzDmyiyVvVk6NurcFclInCd`、grouping-search `JWZGw89MBiUDBNkhtGfcyyUcnsd`、get-and-scalar-query `R7F7wY8pCiJ5Q4kbntxcMsE6nLf`、basic-filtering-operators `LBbUwOGcwi1UMak3eE2cM1gvnUe`、modify-collections `WMh8w3tbKiBhukk3ICMc4ctznEg`、set-collection-ttl `GthGwnrpEiGpClkV5JXcgWUgn8c`、nullable-fields `DjROwgK6ziCf7Rkoji6ccyEUnsg`。

## 执行台账(2026-11-07 已修,不等 liyun95)

- **10 处补丁全部落上并回读验证 OK**(lark-cli raw API PATCH update_text_elements,备份在 /private/tmp/actcheck-42328325076/backups/)。
- **关键执行发现:mention_doc 的 url 不可经 API 修改**(服务端按 token 重推导,echo 恒为存量 URL)→ 5 个 mention 元素**转换为带锚 href text_run**(链接文本=wiki 现标题,均与原名一致:'Basic Vector Search'/'Grouping Search'/'Query'/'Set Collection TTL'/'Modify Collection');5 个 href 直接换锚。
- **Modify Collection 重指定案**:January 2026 公告上下文="Collection TTL and **AutoID** Settings" → 指向 `Example 6: Enable allow_insert_auto_id` `#Bs06diKs4oS5wzxpDaacYt6JnIf`(非 Rename Collection)。
- **终验全绿**:6 篇引用方文档死链 sweep=0;7 个新锚点在旧文档全部 LIVE 且 slug 已验 ∈ 新输出 heading 集;两半校验预通过。
- **port 检查(11-07 已完成盘点,产物=milvus-docs PR #3822)**:修订级 diff(onboarding-era revision vs HEAD,blocks API document_revision_id)证明 **6 篇旧文档冻结期编辑全部是 SDK 代码示例刷新,零散文改动**。port 台账:
  - **已 port** → [milvus-docs #3822](https://github.com/milvus-io/milvus-docs/pull/3822)(base v3.0.x,commit cc7e7ac8):set-collection-ttl 两处 **csharp optional backfill 补齐**(Enable-on-existing 的 Step 3 / Switch-modes 的 Step 4;上游 python/java/go/rust/js/bash 全有、唯 csharp 缺;+20 行纯插入)。上游合并后 zdoc 须推 lock(next pin)才进 scheduled fetch。
  - **跳过=云专属(禁上游)**:single-vector-search 12 块(`level`/`enable_recall_calculation` search 参数、REST 版、`zilliz vector search` CLI 版)+ grouping-search 4 块(project-endpoint session API / cluster_id)——OSS 边界 + 用户拍板。
  - **跳过=上游模板约定**:全部 `{{var.example_endpoint}}/{{var.example_token}}` → 字面量 `localhost:19530/root:Milvus` 连接行内联(上游 milvus-docs 用模板变量)。
  - **跳过=SDK 事实待核**:go `client/v2→client/v3` import 改写(**与 zdoc 自己的 go 参考页矛盾——content/en/reference/api/go 64 处 client/v2**);java AggDirection/OrderByField/BaseVector import 增补(v3 SDK aggregation 上游未跟进);basic-filtering go filter `embedding IS NULL`→`category IS NULL`+Expected [3]→[2](无 ground truth);node 引号风格。
  - **误配对澄清**:nullable-fields node "is_primary_key 丢失/ageField 改写"=best-similarity 跨语言误配(node 块被配上 java 块),node 新块语法正确,无需修。
  - 后续建议:SDK 示例刷新整体是云侧文档团队的 campaign,剩余项建议由他们自己的上游 PR 收编(避免撞车);本次只取无争议增量。
- **生产验证**:下一班 02:15Z Fetch 应收 7→0(bundle ACTIVATE_CHECK_FAILED 归零,success 81→88)。

## 执行要点

1. **编辑方式**:mention 元素(URL fragment 变更)与 text_run link 走 docx 原生 PATCH(update_text_elements 支持 mention_doc);bullet 子块不要用 lark block_replace(会扁平化 li 子块,见 broken-link-cleanup 配方)。或 UI 内重新复制目标标题块链接重插。
2. **port 检查(激活前必做)**:激活成功后 milvus-docs 版覆盖发布,冻结期飞书侧编辑会丢。本轮已核对 **heading 层零漂移**(7 页旧文档 vs 冻结 fallback 逐 heading 一致;差异均为渲染伪影);**正文级 diff 仍需过一遍**(lark-cli `docs +history-list` 查 onboarding(11-03/04 各批次)之后的修订,有编辑则 port 进 milvus-docs PR)。**例外(用户 11-07 拍板):`Use Level`/`Get Recall Rate` 仅用于云,不 port 上游**——它们经 overlay `add` 追加(cloud-use-level.md / cloud-get-recall-rate.md)就是正解;若冻结期旧文档对这两节有编辑,port 目标是这两个 overlay 文件(master PR),不是 milvus-docs。
3. **验证闭环**:改完后下一班 02:15Z Fetch → bundle.json 中 ACTIVATE_CHECK_FAILED 归零(81→88 success);watchdog 日报 fallback_count=0。可先本地预验:重拉 6 篇引用方文档跑 `/private/tmp/actcheck-scripts/sweep_referrers.py`(死链清零即通过 stage 1;stage 2 已预验全绿)。
4. **不阻塞项**:anchor=null 的引用(Release Notes 等)不走校验;zh 侧无 shared onboarding,不受影响。

## 本轮修正两个旧结论

- "modify-collections 的 `share-` 引用方是 shared 快照记录"——**不对**:引用方是 January 2026 Release Notes(普通飞书文档),`share-` 前缀的是**锚点本身**(旧文档里的 synced-block 实例 id),永远不可能是 heading。
- single-vector-search 的 `Use Level`/`Get Recall Rate` 并非 Git-anchor 死局——overlay 已追加这两节(cloud-use-level.md / cloud-get-recall-rate.md),只是 TOC(cloud-toc.md)里是无链接占位文本。**用户拍板(11-07):这两节仅用于云,overlay 追加为最终形态,不 port 上游 milvus-docs**;TOC 占位是否改实链仍留给内容 Owner(改了也安全,输出含对应 heading)。

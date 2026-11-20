# 修订计划:跨集群 External Collection(miluvs:// 外表)三篇文档 + REST 片段

日期:2026-11-06(实测闭环 + PM 口径拍板收敛版) · 依据:三篇内部文档 + UAT 端到端实测 + 11-06 PM 五条澄清
内部输入:Spec `Iv1BwBSJhi4at9kHjx6cW9Rtn4d`、PRD 评审纪要 `ZvrSdkG25obepYxjfGEct8dVnvg`、UAT 测试说明 `EOLYwIL7XiEmIWkke74cyk7jnZb`

**PM 拍板(2026-11-06,已收敛进本计划):**
1. Snapshot 为 ON REQUEST 特性,不对用户开放 → 旧自管 snapshot 页**先行退休**
2. 按 Spec 收敛为**不暴露 Snapshot**口径(describe 不文档化 snapshot_name/snapshot_id)
3. GA 云厂商 = **AWS + Azure**;阿里云、腾讯云测试中,预期全地域支持
4. 内部已知问题(refresh ~10s 窗口、快照存储占用)**不进公开文档**
5. 生产所有 3.0 集群默认已开 useLoonFFI → 用户文档前置条件**只需写「源为 Milvus 3.0」**,不提 useLoonFFI/StorageV3 开关

待修订源文档(均在 en guides 飞书源树):

| 源 token | 页面 | slug | 处置 |
|---|---|---|---|
| `RsGAwmgAYiE6fgkOiokcijsBnEg` | Create an External Collection | /create-external-collection | 修订 |
| `JfJvwdGz0iD9LpkrCMccZ2ypn0g` | Use Snapshot as Data Source | /use-milvus-snapshot-as-data-source | **退休**(拍板 #1) |
| `P9HuwHZyXilwRTkVoDBcjAMlnrb` | External Collection Limits | /external-collection-limits | 修订 |

---

## 一、实测结论(证据库;标注【公开】=写入用户文档,【内部】=仅研发反馈,不进文档)

| # | 事实 | 文档口径 |
|---|---|---|
| V1 | scheme=`milvus://<instance_id>/<db_name>/<collection_name>`;小写;严格三段;末尾可多 `/`;云上合法 scheme 仅 `volume://` 与 `milvus://` | 【公开】 |
| V2 | 目标=on-demand compute database;REST 走项目 endpoint;数据面操作必须带查询集群 ID(SDK `option.cluster_id`;REST 不带报 cluster_id not found);控制类调用不需要 | 【公开】 |
| V3 | 必须用 API key;`user:password` 被拒 | 【公开】 |
| V4 | 用户可达错误消息:坏 URI / 实例不存在或无权限 / 源集合不存在 / format 冲突(逐字:`external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"`)/ 非外表 refresh(code 1100)/ 并发拒绝(逐字) | 【公开】(错误对照表只收用户可行动的) |
| V4b | 内核级失败签名:2.6 源 `UNIMPLEMENTED: CreateSnapshot`;3.0 未开 Loon `storagev2_manifest_list` 缺失;跨 org 96012 | 【内部】生产 3.0 默认开 Loon(拍板 #5),用户只会遇到"源须 3.0"这一层;签名仅作研发定位参考 |
| V5 | 校验顺序:URI→源可达→先建快照→格式校验 | 【内部】 |
| V6 | describe 返回:externalSource 原样回显;externalSpec 含 format=miluvs-table + cloud_extra{source_instance_id, source_db, source_collection, source_collection_id, source_uri, **snapshot_name, snapshot_id**};preserve_field_ids=true;无凭证/extfs | 【公开=收敛口径】:文档只写源绑定信息(external_source 回显 + 源实例/库/集合),**snapshot_name/snapshot_id 不文档化**,并作为实现收敛项反馈研发(拍板 #2) |
| V7 | refresh 状态机实际为 `RefreshInProgress(0)→RefreshCompleted(100)`(测试说明的 RefreshPending 不存在) | 【公开】按实测命名 |
| V8 | 并发 refresh 拒绝:`Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | 【公开】 |
| V9 | refresh 省略 external_source = 受理但不生效(hook 不处理、无新快照);REST 片段"复用持久源"表述错误 | 【公开】必须写明 |
| V10 | 增量同步闭环(源 50→55,带源 refresh 后目标 55) | 【内部】(作为修订依据,不单独立文) |
| V11 | 换源 refresh 无拦截,直接改绑(TC-14 已定义);文档表述为「refresh 按传入的 external_source 重新绑定源」即可,不展开孤儿快照 GC | 【公开】(轻描) |
| V12 | StorageV3 本质是数据格式要求;生产 3.0 集群默认已开(拍板 #5) | 【内部】文档前置只写「源为 Milvus 3.0 上的普通集合」 |
| V13 | DB 属性 useLoonFFI 只存元数据不生效 | 【内部】 |
| V14 | VectorLake create 后即 LoadStateLoaded | 【内部】 |
| V15 | 错误消息引导 useLoonFFI 开通,但用户无通路执行——生产默认开启后暴露面收窄,降级为低优反馈 | 【内部】低优反馈研发 |

---

## 二、文档 1:Create an External Collection(`RsGAwmgAYiE6fgkOiokcijsBnEg`)

| 位置 | 动作 | 内容 |
|---|---|---|
| Overview | 保留 | on-demand only 声明不变 |
| Step 1 › Preparation | **改** | 前置条件按来源类型分组。跨集群源新增块:① 源为**同一项目、同一 region** 下 **Milvus 3.0** 集群上的普通集合(不能是另一张外表);② 目标=on-demand compute database(Enterprise 及以上套餐口径随产品确认);③ 使用 **API key**(目标读写+源读);④ 第一期仅 SDK/REST,Console 不支持;⑤ 云厂商:**GA 支持 AWS、Azure;阿里云、腾讯云即将支持(测试中)** |
| Step 1 › Support data sources | **改** | `milvus-table` 行改为跨集群形式:`external_source` 传 `milvus://<instance_id>/<db_name>/<collection_name>`(V1 格式 + 合法 scheme 说明),链接到新的跨集群来源页;旧"snapshot metadata JSON 路径"引用删除(旧页退休) |
| Step 1 › Set up schema | **改** | externalSpec 参数表:miluvs:// 源 `format` 可省略(默认 milvus-table);不适用 snapshot_id/extfs |
| Step 2 › Add fields | 保留 | external_field 映射必填 |
| Step 3 › Create a collection | 小改 | SDK 示例确认带 cluster_id 连接示例(V2);cURL/REST 示例按片段 example 6 形状 |
| Step 5 › Refresh data | **重写** | ① **refresh 必须传 external_source,省略不生效**(V9);② 语义=按传入 external_source 重新绑定源并同步数据(V11 一句话覆盖换源行为);③ 状态:`RefreshInProgress → RefreshCompleted`(V7);④ 并发 refresh 会被拒绝(V8);⑤ 云上 refresh 需等待索引构建,耗时取决于数据量(与 OSS 秒级差异);⑥ 进度查询三件套(get_refresh_external_collection_progress / REST job describe / job list) |
| 错误对照(新增小节) | **新增** | 只收【公开】级错误(V4),每条:场景+错误原文+用户应对 |

## 三、文档 2:Use Snapshot as Data Source(`JfJvwdGz0iD9LpkrCMccZ2ypn0g`)→ **退休 + 新页**

**拍板 #1:旧页先行退休。** 执行:
1. 旧页 frontmatter `deprecate_since` 置为当前日期(en 源树;该页 beta: PUBLIC → 随退休流程走下架/提示)
2. 旧 slug `/use-milvus-snapshot-as-data-source` 配 nginx 301 → 新页 slug(重定向基建走现行 conf 流程)
3. ja 侧该页同步退休(i18n 生成,随 en 源)
4. zh 无此页,无需处理

**新页:Use a Collection from Another Cluster as Data Source**(跨集群来源页,en+zh 同步建):

| 位置 | 内容 |
|---|---|
| 标题/intro | external_source 传 `milvus://` URI;平台自动建管快照,Snapshot 不对用户暴露(拍板 #2 口径) |
| Before you start | 源:同项目同 region、Milvus 3.0 普通集合(非外表);目标:on-demand compute database + 查询集群;API key;仅 SDK/REST;云厂商矩阵(同文档 1) |
| 创建步骤 | schema 用 external_field 映射源字段;external_source 传 URI;externalSpec 可省略;SDK 全语言 + REST(cURL 按片段 example 6 形状);**SDK 连接带 cluster_id**(V2) |
| describe(新增一节) | external_source 原样回显;external_spec 含 format 与**源绑定信息**(源实例/库/集合/URI);`preserve_field_ids=true`;**不返回可操作的 Snapshot 信息**(拍板 #2) |
| Refresh | 指回文档 1 Step 5(含"必须带 external_source") |

## 四、文档 3:External Collection Limits(`P9HuwHZyXilwRTkVoDBcjAMlnrb`)

| 位置 | 动作 |
|---|---|
| 限制条目 | 新增跨集群源限制:① 同项目同 region;② 源为 Milvus 3.0 普通集合(非外表);③ 必须 API key;④ 第一期仅 SDK/REST;⑤ 云厂商矩阵(AWS/Azure GA;阿里云、腾讯云即将支持) |
| 限制条目 | 新增 refresh 约束:**必须带 external_source 否则不生效**(V9);并发 refresh 拒绝(V8);refresh 按传入源重新绑定(V11 轻描) |
| ~~snapshot 生命周期条目~~ | **不加**(拍板 #4:内部问题不进公开文档;快照整体不对用户暴露,无用户可见行为可写) |
| 操作对比表 | 表结构不动 |

## 五、附带:REST 片段 `packages/docs-tooling/src/reference/rest/meta/openapi/05-collection-operations-v2.json`

| 位置 | 现状(错误) | 改为 |
|---|---|---|
| `CollectionSchema.externalSource` description | "(e.g., \"mysql\")" | 两种 scheme 定义(V1) |
| `RefreshExternalCollectionRequest.externalSource` description | "When omitted, the collection's persisted source is reused" | **省略时刷新不生效,必须提供**(V9 实测);zh 版删"仅适用于 Iceberg 表" |
| `ExternalSetupCollection.schema.required` | externalSpec 必填 | externalSpec 可选(milvus:// 源默认 milvus-table) |
| describe 响应 schema/examples | 无源绑定结构 | 补 format + source 绑定字段;**snapshot_name/snapshot_id 不写进文档示例**,是否从响应收敛由研发定(拍板 #2 联动反馈) |

无新增操作,不动 `titles.json`;改完跑 `pnpm test:for-change -- <路径>` + `pnpm test:rest-publication-contract` + 三语种生成 diff。

## 六、发布机制与顺序

1. **先行退休旧页**(拍板 #1:en 源 deprecate_since + nginx 301;ja 随 i18n)——可与新页写作并行,先于功能 GA
2. 新页(文档 2)+ 文档 1/3 修订在 en/zh 源树写作 → Fetch 落 dev(dev-owned,禁止 master 直编);byoc 管线派生;ja 走 i18n
3. REST 片段走 master PR → sync(sync 候选树自动重生成)
4. 上线与 GA 对齐(beta 徽章按现行机制);GA 前在正式版本复测错误消息全集
5. 旧 slug 301 与 nginx 重定向走现行 conf 流程(注意 conf 双源一致性)

## 七、剩余待办(已无阻塞性拍板)

- [ ] 反馈研发(低优,随修订计划一并提):① describe 的 cloud_extra 仍含 snapshot_name/snapshot_id,按"不暴露 Snapshot"口径实现收敛(V6/拍板 #2);② 错误消息引导 useLoonFFI 开通无用户通路(V15,生产默认开启后暴露面小)
- [ ] on-demand compute 套餐门槛(Enterprise 及以上)在正式文档的准确措辞与产品页对齐
- [ ] GA 前错误消息全集在正式版本复测
- [ ] 旧 org(proj-40c503b4...)遗留资源用旧 key 清理(查询集群 in07-85f0、2.6 实例 in01-8ffa;in01-f93145 已恢复 suspend)

---

## 九、origin/dev 全量扫描清单(2026-11-06 第二轮,含 reference)

> byoc 与 ja(i18n)为派生镜像,随 en/zh 源修订自动走;zh guides 为独立源文档,按下表同步。本节只列**因本特性需要动作**的文档,纯概念页/无关页已排除。

### A. guides(en 源;zh 独立源同步;ja/byoc 派生)

| 文档(en 路径相对 content/en/guides/tutorials/) | 状态 | 动作 | 优先级 |
|---|---|---|---|
| development/collection/create-external-collection/create-external-collection.md | 旧模型(volume:// 单一视角) | 计划内·文档 1 | P0 |
| development/collection/create-external-collection/use-milvus-snapshot-as-data-source.md | 旧自管流程 | 计划内·退休+新页 | P0 |
| development/collection/external-collection-limits.md | 缺跨集群限制 | 计划内·文档 3 | P0 |
| development/collection/collection-on-console/manage-external-collections-console.md | **新发现**:Console 有建外表章节 | 注明跨集群 milvus:// 源第一期仅 SDK/REST(或列 Console 支持的源类型) | P1 |
| get-started/feature-availability.md:77 | **新发现**:Azure 外表/外挂卷挂在 **Private preview** | 拍板 #3:Azure 升 GA;GA 时加跨集群外表条目 | P1 |
| development/snapshots/snapshots.md(beta ON REQUEST):97 | **新发现**:已提 milvus-table + StorageV3 要求 | 旧快照流程退休后重写/移除该段(与拍板 #1 联动) | P1 |
| development/collection/load-release-collections.md:30 | "sub-second refresh…volume" 为 volume 语境 | 可选:跨集群源 refresh 耗时不同(秒~小时),一句话区分 | P2 |
| get-started/quickstarts/quick-start-to-external-data-lake-search.md | volume 源快速开始 | 可选:GA 时加跨集群小节 | P2 |
| get-started/release-notes/changelogs.md | — | GA 发布动作:新增条目 | GA 时 |
| get-started/release-notes/release-notes-2170.md | 历史版本说明 | 不动 | — |
| drop-collection.md / alter-external-collection-schema.md / dql-sessions-external-collection.md / development/database/on-demand-database.md / database-concept.md / volume/*(4 篇) / quick-start-to-on-demand-search.md(cluster_id 模式已正确) | 检查通过 | 不动 | — |

### B. SDK 参考(en+zh 镜像各一份;同族问题 ×5 语言)

**共同病灶**:external_source 描述只写 `volume://`/S3 path;format 列表缺 `milvus-table`;缺 milvus:// URI 语法;refresh 语义未写"必须带 source"(V9)。

| 语言 | 文件 | 病灶确认 | 优先级 |
|---|---|---|---|
| python | Collections-create_collection.md(create_schema/CollectionSchema 同族) | 示例仅 volume:// | P1 |
| python | Collections-refresh_external_collection.md | **external_source="should be a volume:// URI";format 列表 parquet/vortex/lance/iceberg 缺 milvus-table** | P1 |
| python | Collections-get_refresh_external_collection_progress.md:83、Collections-list_refresh_external_collection_jobs.md:81 | 状态枚举列 RefreshPending(实测流转为 RefreshInProgress;枚举本身可能含 Pending,保留但按实测描述流转) | P2 |
| nodejs | createCollection / describeCollection / refreshExternalCollection / getRefreshExternalCollectionProgress:87 / listRefreshExternalCollectionJobs | 同族 | P1 |
| java | CreateSchema / CollectionSchema 族(addField/getField/getFieldSchemaList)/ FieldSchema / addCollectionField / Management-refreshExternalCollection / getProgress / listJobs | 同族 | P1 |
| go | Schema / Field / RefreshExternalCollection(**WithExternalSource="similar to AWS S3 path"**)/ JobInfo / State(RefreshStatePending) / GetProgress / ListJobs | 同族 | P1 |
| cpp | DescribeCollection / BatchDescribeCollections / Management-RefreshExternalCollection / GetProgress / ListJobs | 同族 | P1 |

### C. CLI 参考(en+zh 镜像)

| 文件 | 病灶 | 优先级 |
|---|---|---|
| ExternalCollectionRefresh-trigger.md | **"--external-source Overrides the external source (optional)" 与 V9 冲突**(milvus:// 源省略=不生效);option 描述补 milvus:// 语法 | P1 |
| ExternalCollectionRefresh-describe.md / -list.md | 未见病灶;随语义复核 | P2 |

### D. REST 参考(spec 生成,en+zh 镜像;走片段→生成)

| 页面 | 病灶(实测对照) | 优先级 |
|---|---|---|
| refresh-external-collection-v2.mdx:7,29 | **"persisted source and spec are reused" 两处,被 V9 直接推翻** | P0(计划第五节已列) |
| describe-external-collection-refresh-job-v2.mdx:29 | specs 状态枚举含 RefreshPending;按 V7 校准 | P1 |
| list-external-collection-refresh-jobs-v2.mdx:29 | 同上 | P1 |
| describe-collection-v2.mdx | externalSource 示例仅 volume://volume-vdc/demo_lance/;补 milvus:// 示例 | P1 |
| create-collection-v2.mdx | externalSource 描述需加 scheme 定义(计划第五节) | P1 |
| add-collection-field-v2 / add-function-field-to-collection-v2 | 提及 external collection 限制;复核是否需 milvus-table 语境 | P2 |

### E. 缺页/覆盖缺口

- **zh**:create-external-collection 为扁平页(无子页结构),无 use-milvus-snapshot 页 → 新跨集群页 en+zh 同建,zh 不补旧页(已在计划)
- **guides 无 connect-for-on-demand-search 页**(byoc 特有,含 cluster_id 连接法)→ 新页必须自带 cluster_id 连接说明(V2),不能依赖互链
- ja:retirement+新页随 en i18n 生成;ja byoc 的 on-demand cluster 管理两页与本特性无关,不动

---

## 十、按编辑源分类与执行规划(2026-11-06 第三轮)

**判定依据(已核实)**:guides 注册 Base=`Ac7xbs2k1ad7bjsCXr0ccHe9nMh`(Development=tblWv7PjNDsexddH / Get Started=tbl9BeCMjBmalJVb / Management 等 9 表);Placement Type ∈ {canonical, section, link, ref};Progress ∈ {Draft, …published};Release Channel ∈ {current, next, **retire-in-next**(=退役机制)};Base 行 Docs 指向 zilliverse.feishu.cn=飞书源,指向 github.com/zilliztech/zdoc/tree/master/shared-docs/**=shared-page(上游 milvus-docs,zdoc 侧 overlay=shared-docs/guides/pages/<slug>/page.yaml transforms)。参考文档上游=milvus-io/web-content(`API_Reference/{pymilvus,milvus-sdk-java,milvus-sdk-go,milvus-sdk-node,milvus-sdk-cpp,milvus-sdk-csharp,milvus-sdk-rust,milvus-restful}/v3.0.x/...`),zdoc 暂仍从飞书拉取→双写。REST 参考=zdoc OpenAPI 片段权威,直接提 PR。

### 分类 1:飞书文档直接改(canonical 行;Base Ac7xbs2k1ad7bjsCXr0ccHe9nMh)

| 文档 | Base 表 | 行状态(已核实) | 动作 |
|---|---|---|---|
| Create an External Collection(`RsGAwmgAYiE6fgkOiokcijsBnEg`) | Development | canonical/Draft | 计划·文档 1 修订 |
| External Collection Limits(`P9HuwHZyXilwRTkVoDBcjAMlnrb`) | Development | canonical/Draft | 计划·文档 3 修订 |
| Use Snapshot as Data Source(`JfJvwdGz0iD9LpkrCMccZ2ypn0g`) | Development | canonical/Draft | **退休:Base 行 Release Channel→retire-in-next + 页首退休说明 + zdoc 侧 nginx 301**(拍板 #1) |
| Manage External Collections (Console)(`W...`,执行时取全 token) | Development | canonical/Draft | P1:注明跨集群源第一期仅 SDK/REST |
| Snapshots(`XC1ow3jGBi7hVvkINtBcXhQ6n8g`) | Development | canonical/Draft | P1::97 milvus-table 段随退休改写 |
| Feature Availability(`HpbSwzS6kiW9gikHpQ...`) | Get Started | canonical/Draft | P1:Azure 外表/外挂卷 Private preview→GA(拍板 #3);GA 时加跨集群条目 |
| Changelogs(`MUL3wkn7Yi3YoFkYk59csf8bnNc`) | Get Started | canonical/Draft | GA 发布动作 |
| Quickstart to External Data Lake Search | Get Started | canonical/Draft | P2 可选:加跨集群小节 |
| zh 对应页(zh create-external-collection=`Ksgpw0XJqibTvnkMlPwcHtKinBc` 等,zh Base 另查) | zh Base | 执行时按 zh Base 复核 canonical | 与 en 同步修订/同建新页 |

### 分类 2:shared-docs(milvus-docs 改源 + zdoc overlay)

| 文档 | 上游(milvus-docs) | zdoc overlay | 动作 |
|---|---|---|---|
| load-release-collections(P2 可选) | `site/en/userGuide/collections/load-and-release.md` | `shared-docs/guides/pages/load-release-collections/page.yaml`(已有 load-prerequisites replace overlay) | refresh 耗时区分(跨集群秒~小时 vs volume 秒级):上游加一句,overlay 若无需差异则不加 |
| drop-collection | 同机制 | — | 检查通过,不动(备用:未来改动走本路) |

### 分类 3:参考文档 = web-content PR + 飞书双写

| 组 | web-content 路径(API_Reference/…/v3.0.x/) | 飞书源(zdoc 拉取侧,en token 见 dev frontmatter;zh 对应 zh 源) | 动作 |
|---|---|---|---|
| pymilvus | pymilvus/v3.0.x/MilvusClient/Collections/{create_collection, refresh_external_collection, get_refresh_external_collection_progress, list_refresh_external_collection_jobs}.md + MilvusClient-CollectionSchema + create_schema | 对应飞书页 | 同族修订(计划第九节 B):external_source 补 milvus:// 语法、format 补 milvus-table、refresh 语义 V9、状态枚举按 V7 校准 |
| milvus-sdk-java / go / node / cpp(+/csharp、rust 若有同族页) | 各 SDK v3.0.x 对应页 | 对应飞书页 | 同上 |
| CLI(zilliz CLI 3 页) | **待确认**:milvus.io 不托管 zilliz CLI,web-content 可能无对应目录 | 飞书 CLI 源 3 页(token ApSLdblNKo7ru0xGTqbconxBnSh 等) | 若 web-content 无对应→仅改飞书;执行时先查 |
| 说明 | 参考 Base 注册多为 `ref` 行(canonical 限制针对 guides Base 的发布页);双写规则=web-content 为权威上游,飞书侧同步保 fetch 一致,直至 zdoc 切源 | | |

### 分类 4:REST 参考 = zdoc 直接 PR

- `packages/docs-tooling/src/reference/rest/meta/openapi/05-collection-operations-v2.json`(计划第五节四处)+ describe/list job 页状态枚举校准(V7)
- 流程:master 分支 PR → `pnpm test:for-change` + REST 生成三闸 + 三语种生成 diff → 合并后 sync 候选树重生成
- 双站注意:片段内 cloud 特定描述用 `<include target="zilliz">` 包裹,milvus 侧语义不动(该片段同时投影 milvus.io,上游 track 不受影响——本轮改动均为 zilliz 侧描述)

### 执行顺序与依赖

```
Phase 1  cat4 REST zdoc PR        ——无依赖,先行(片段→三闸→PR)
Phase 2  cat1 飞书 guides          ——与 Phase 1 并行;退休行(Retire-in-next)先行;
                                     en 改完→zh Base 对应页;等 Fetch 落 dev
Phase 3  cat3 参考双写            ——等 Phase 2 文案定稿(套用统一措辞);web-content PR 与飞书同步同一批
Phase 4  cat2 shared(load-release P2)+ GA 时 changelogs/feature-availability 收尾
验收     Fetch 落 dev 后 git diff 复核;REST 三闸;pnpm test:for-change 全覆盖;nginx 301 上线后线上验证
```

### 十·补:zh guides Base 与 SDK 参考源核实(2026-11-06 第四轮)

**zh guides Base** = `I6YUb1M0JajHrqsJGcLcZNh7neP`(wiki 空间 `XyeFwdx6kiK9A6kq3yIcLNdEnDd`;registry.ts L377)。受影响 zh 文档行(**全部 canonical/飞书**,取自 guides-zh-CN-uat-last-success 快照 425 行;执行时以实时 Base 为准):

| zh slug | zh 飞书 doc_token | Base 表 |
|---|---|---|
| create-external-collection | `Ksgpw0XJqibTvnkMlPwcHtKinBc` | 开发指南 tblYpqCgevikMomb |
| external-collection-limits | `HjpBwVmBiiyz1tkcLxCcyXbvn7g` | 同上 |
| manage-external-collections-console | `EWblwBycHiR65UkifyDcJaCwnye` | 同上 |
| dql-sessions-external-collection | `H877wYI5hiZybfknCX4c9MBvnNb` | 同上 |
| alter-external-collection-schema | `Jr3ew8nk2i5u0SkXWmJcyyLfnMh` | 同上 |
| snapshots / manage-snapshots | `Km9nwfLWti2GZNkLtbnc8fcVnId` / `Xq0owDgEpiD2aDkfYBGcxt1ZnNe` | 同上 |
| on-demand-database / database-concept | `CV70wkhwiiBsplkxFJicEbgEnab` / `HOk4wsRngiiDEVkMuF4c4487nxb` | 同上 |
| feature-availability / changelogs / quick-start-to-external-data-lake-search | `EZ2jwCJD7iazqKkmSGRcBfjWnCh` / `JziCwn071iCV1tkX4NZcwGSDnmc` / `XweAwx0lriFJXhkMyb1c40v9nNh` | 从这里开始 tblsw6S3J0ekcgNB |
| **zh 特例 ①**:load-release-collections = **飞书文档** `G7jYwhWH4iVtGakm2BHcGuzIn3f`(非 shared!与 en 架构不同)→ P2 微调直接改 zh 飞书,归分类 1 | | |
| **zh 特例 ②**:zh 有 `connect-for-on-demand-search` 页(`Mj2bw4KFYikkOJkLCOtcDQn0nph`,en guides 无)→ cluster_id 连接说明 zh 侧已有落点,en 新页需自带 | | |

**SDK 参考源 = Drive 目录(非多维表格)**,注册于 `packages/docs-tooling/src/manuals/registry.ts`(`remote('drive', space, folderId, ...)`),现行 v3.0.x active:

| SDK | 飞书 Drive 目录(v3.0.x) | zh 侧 |
|---|---|---|
| python | `UxyTfjS3wl0TF8dn9tZcRT39nUe` 空间内 folder `Hk05b5eI6aXXSSsd6j9cqwwMn5a` | **本地翻译** `chineseTranslation: local('content/zh-CN/reference/api/python/python')`——zh 不走飞书,随翻译管线更新 |
| java | folder `AOFDbSmwma9XrNsLa8KcQgt9ngc`(java/v3.0.x/v2) | 同上(本地翻译) |
| go | folder `KQT5bV62QaioKisKZT0crwZDnke` | 同上 |
| node | folder `LlrPbysPZau2dGsSVuicHmvCn0e` | 同上 |
| cpp | folder `QdLkbfmnFatl4TsThKDc5Dobn5g` | 同上 |
| cli | 飞书 docx 源(token 如 `ApSLdblNKo7ru0xGTqbconxBnSh`),web-content 无对应目录待执行时终确认 | 同上 |

→ **分类 3 双写结论修正**:SDK 参考的"飞书侧"是 **Drive 目录下的 docx 文件**(改 web-content + 改对应 Drive docx),没有 Base 行要动;zh 参考无需双写(翻译管线自愈)。

---

## 十一、旧页退休收尾台账(2026-11-06 执行记录,WP14 交接用)

已落(本轮):退休横幅(doc rev 220)+ Base 行 recvoFM08mWjNS Release Channel→RETIRE-IN-NEXT(rev 1907)+ **Beta PUBLIC→ON REQUEST**(rev 1908,协调者拍板:对齐 PM 口径"snapshot 为 on request"与快照主页一致,消除与横幅"on request only"的徽章冲突);行/文档均未删(软退休)。snapshots 页 StorageV3/useLoonFFI/VectorLake 字样清零(rev 2811);console 页加 SDK/REST-only Note(doc W04nwxHqNiqyrykxMZOcu4ianle,rev 211)。

**301 重定向(WP14 后执行,现在禁止)**:配置=deploy/en/nginx.conf(master 侧,master-tooling sync 上线;检查集 containers/retirement/workflow-matrix/typecheck)。顺序硬约束(runbook/release-channel-gating.md §3):**先删 Base 行→删除随 Fetch 部署→再上 301**;提前上会盖掉在线页,且 RETIRE-IN-NEXT 会在 next 渠道部署自动生成同路径 404 规则,与 301 精确匹配冲突(nginx 拒启)。规则文本(挂 # Retired page: 段,约 L3290-3297,zh 站无此页不用改):
```nginx
    # Retired page: /docs/use-milvus-snapshot-as-data-source (self-managed snapshot source) folds into Create an External Collection.
    location = /docs/use-milvus-snapshot-as-data-source { return 301 /docs/create-external-collection; }
    location = /ja-JP/docs/use-milvus-snapshot-as-data-source { return 301 /ja-JP/docs/create-external-collection; }
    location = /docs/byoc/use-milvus-snapshot-as-data-source { return 301 /docs/byoc/create-external-collection; }
    location = /ja-JP/docs/byoc/use-milvus-snapshot-as-data-source { return 301 /ja-JP/docs/byoc/create-external-collection; }
```
另:计划 §3 原"deprecate_since 置当天"不可执行——Base 无 Deprecated Since 字段,frontmatter 由 Base 生成;软退休以 Channel+横幅为机制,该步作废。

---

## 十二、执行总账(2026-11-06 六路并行,全部完成)

**用户拍板**:公开页新增内容随定时 Fetch 照发(不做 indev 包裹);新页 WIP 闸门到 GA。

| 路 | 交付 | 标识 |
|---|---|---|
| A REST | PR **#1143**(OPEN,2 commits f9e19df20+a7ca1ddeef):五处修订+分域修正轮;74/74+contract+projection+matrix 全绿;lifecycle hash 经支持工具刷新;证据评论已挂 | worktree .claude/worktrees/rest-extcoll(保留至合并) |
| B en guides | create 页 rev 6914(三轮),limits 页 rev 418;sync 块零改动;新页引用已换 wiki mention | docx 双挂 RsGA…+FwSV… |
| C 退休 | 横幅 rev 220 + Base recvoFM08mWjNS→RETIRE-IN-NEXT+Beta ON REQUEST(rev 1908);snapshots rev 2811;console(=W04nwxHqNiqyrykxMZOcu4ianle) rev 211;301 转 WP14(§11) | — |
| D 新页 | en node AzxFwQpn4iRElfkDrbVcorGqnYd/docx MzIVdo6zLoeJPmxFLMOcqO2Cn2g/行 reczz28WMex1Nyk4(Seq222,Parent=create 行 recvlPs65wqwyk 顶替退休页位);zh node YVhZw2z0AiuNNnkruztcOAfMnmg/docx HmGadx5hVoQkgcxR7FmcTBAUnZO/行 reczz28WMfBWbUhp;**Progress=WIP+Beta=ON REQUEST(发布闸门;Draft 即可发布!)** | — |
| E zh | create rev 512、limits rev 149、snapshots rev 28、console rev 109(三轮);zh 无旧页退休 | — |
| F 参考双写 | **web-content PR #1269**(24 文件/7 SDK,OPEN);飞书 en 13 页+CLI 2 页(trigger rev 33/describe rev 14);CLI 无 web-content 镜像确认;分域已吸收+OSS 佐证(proxy impl.go 成对规则);顺修三处上游事实错误(Java 枚举/pymilvus 示例态/三 SDK source 称谓) | 快照 /tmp/extcoll-ref/ |

**分域一致性(全局复核)**:refresh"必须传"表述现仅存在于 milvus:// 语境,覆盖 #1143/en/zh/web-content/飞书 SDK/CLI 全部落点;volume:// 分支=OSS 源码实证的同传同省+复用。禁词(VectorLake/snapshot_name/useLoonFFI/GCP)各路自查清零。

**遗留清单(按序)**:①GA 动作=新页两行 Progress→Draft+Beta→PUBLIC(与 create 页修订同批或先于)+feature-availability(en EZ2jw…/zh)Azure 升 GA&加跨集群条目+changelogs(en JziCw…/zh);②PR #1143 合并→sync 重生成 REST;③web-content #1269 合并(上游 owner);④WP14:删退休行→Fetch 部署删除→上 §11 的 301;⑤Java/C++ refresh 示例仍传 "s3"(需分站变体+编译检查,PR 描述已挂);⑥CLI list 示例 {"jobs":[]} 疑与 REST records 不符,待实测;⑦Python 飞书参数 bullets 双份扁平拷贝(zdoc 侧 external_source 显示两次)结构性清理;⑧cluster_id 示例三写法统一(option=/session()/cluster=);⑨create 页评论 c4 可关;⑩load-release P2(上游 milvus-docs 一句)仍缓;⑪GA 前错误消息全集复测;⑫旧 org 资源清理(用户侧旧 key)。

---

## 十三、评审修复轮总账(2026-11-06 深夜,用户 6 条意见全局落地)

**评论→修复对照**(8 条评论归 6 主题;评论均未自动解决,待用户在飞书标记):

| 意见 | 落点 |
|---|---|
| ①Preparation 不分组 | en create rev 6933(单列表 4 条,链接保留);zh create rev 527(镜像) |
| ②milvus-table saas-only | 两页条目块级标签段包裹;**裁定扩展**:Step5 段/Troubleshooting/Set-up-schema 补注/limits 两 bullets/console Note(en rev 212/zh rev 111)一并 saas 化 |
| ③删平台快照句 | en/zh create + 新页 en(zh)intro&Refresh 全删;REST/web-content 实测本就 0 |
| ④术语 compatible with Milvus v3.0.x | 全部落点替换;REST #1143 第三 commit cffa83477(三语);web-content 0 |
| ⑤厂商句分家 | EN 全部只留 "AWS and Azure are supported.";ZH 全部只留「阿里云、腾讯云即将支持」 |
| ⑥Refresh 两段式+删错误原文 | 基线 §2 重写;en/zh create + 新页对齐;错误原文仅存 Troubleshooting 表 |

**本轮沉淀的机制结论**:①li 级 saas 包裹必须块级标签段(行内整项包裹 BYOC 残留空 `- `;B/C/E 三路用真实 larkDocWriter 双 target 离线验证);②嵌套 include 可行(resolveIncludeSpans 配平);③参考面(SDK/CLI/REST)单份 zilliz 发布无 BYOC 副本,**严禁 saas include**(zilliz target 下会删内容);④整页 SaaS-only 优先 Base 行 Targets 收敛;⑤Iceberg snapshot_id=公开参数保留(禁的是 cloud_extra 快照标识)。

**评审轮交付状态**:REST PR #1143 3 commits(cffa83477 术语)全绿;web-content #1269 未动(三查全零)+PR 描述删 snapshot 句(66 字符精确);en create 6933/limits 420;zh create 527/limits 151/console 111;console en 212;新页 en rev 11/zh rev 7 + Targets SaaS-only。

**待用户**:①8 条评论标记解决;②en 新页行 19:22 被用户账号改为 Draft/PUBLIC/**NEXT 渠道**(今晚 Fetch 发布到 NEXT,CURRENT 不可见)——zh 行仍 WIP,如非有意可回改;③新页 Refresh 用 §2 全文版(D 的取舍,可回一句话摘要);④en create Preparation 第 2 条两行 For details 可选合并。

**新发现既有问题(非本轮引入,挂账)**:zh 限制页「也不支持 Partition Key 和 。」残句(milvus include 剥 Clustering Key 所致,dev 线上已存在)。

---

## 十四、去 Zilliz 化 + NextChannel 轮总账(2026-11-06 深夜第二轮)

**拍板**:①web-content(milvus.io)只收 OSS 有效内容,milvus:///volume:///云侧句式禁入,Zilliz 专属内容只活飞书侧 zilliz span;②NextChannel 闸门仅套 SDK/CLI 参考页(guides 公开页维持照发)。

**#1269 终态**:单 commit `c461f759`(压前 diff sha256 逐字节一致),22 文件 +50/-50,新增行 milvus:///volume:///Zilliz/zillizcloud/milvus-table 全零;保留五类 OSS 修正(URI 称谓/Java 枚举/示例态/流转句/成对规则)+ OSS 卫生(volume:// 三处清理,create_collection 例换 s3://+本地端点)。OPEN 待上游 lgtm。

**NextChannel 机制档案**(F 查证,file:line 在 F 报告):`<NextChannel action="include">`=仅 next 部署可见(exclude 反之);禁嵌套;**NEXT/RETIRE-IN-NEXT 页禁用**;代码块内用 `# next-channel-start/end`;翻译校验查标签配对;⚠️ `URI<NextChannel` 紧贴会被 validate.cjs:422 转义致 CURRENT 泄漏(已拦截,标签前留空格)。分层结构=OSS 裸句 + `<include target="zilliz"><NextChannel action="include">` 云侧全文。

**飞书面**:12 页加闸门/拆视图(rev 见 F 报告);py progress 同步块 Gy5o 根因修复(volume:// 样例 target milvus→zilliz)——副作用:下次 Fetch 后 py progress/listjobs 在云站两渠道多出 volume:// 样例(此前被错标隐藏,恢复属正确)。CURRENT 渲染云侧字样 0(含静态 .md);milvus 投影与 web-content 逐段对齐。

**裁定遗留**:①GitHub 旧痕迹(旧 SHA/renamed 事件/描述编辑史)接受现状不处理——无敏感信息,仅措辞不当,合并后 master 历史干净即达标;②飞书 py create_collection 代码块同类根因(云端点+volume:// 无 target 区分)**缓办**(refresh-sdk-docs workflow 已禁用无回流风险,修前需查 web-content writer 对代码指令的处理);③web-content 用户指南 create-an-external-collection.md:502/801 两处 volume://(OSS 跑不通)建议另开 PR。
**观察项**(下次 Fetch 后 UAT 目检):参考页首用 NextChannel/列表项行内闸门的渲染;仅含闸门段落的 NEXT 间距;闸门文字会进生产 JS chunk(不出 HTML/.md/llms)。

---

## 十五、milvus-table 双轨澄清轮总账(2026-11-06 深夜第三轮)

**澄清**:milvus-table OSS 与云都支持——OSS=snapshot metadata JSON 路径(自管快照);云=仅 milvus://。**用户增量拍板:顺手补 milvus.io 的 OSS 文档;OSS 句只进 milvus 投影**(F 中途提问用户直答,云站不显示 s3 快照路径——与退休口径一致,已记基线)。

**重大事件**:#1143 于 12:34Z 被用户账号合并(仅 3 commits,泄漏仍在 master)→ 修复在 **PR #1145**(单 commit 64d91b80f,六处修复=协调方点名 4 处+externalSource refresh 描述+术语再对齐;投影清零三 token=0 有镜像 hygiene 检查证据;**待合并——下次 master→dev sync 前必须合**,否则泄漏进生产派生树;web-content REST 页下次同步也会带上,F 独立发现同一问题佐证)。

| 面 | 终态 |
|---|---|
| REST #1145 | OPEN 待合并(六处 include 分域+milvus-table 双轨;全测试绿) |
| web-content #1269 | 单 commit eb16cdb3(tree 与压前相同,diff sha256 逐字节一致),25 文件 +55/-55;15 行 milvus-table OSS 句(参数名按 SDK);新增行 milvus:///volume:///Zilliz 仍 0 |
| 飞书 SDK 11 页 | 闸门句纠错("used with the milvus:// scheme");format 行双 include(zilliz=四值,milvus=五值+OSS 句);三投影验证:CURRENT 零变化、NEXT 仅闸门句、milvus 仅 format 行 |
| en create 页 | rev 6939:OSS 句落位 milvus-only 参数表 format 行(结构 C;**纠正评估错误前提**:milvus 投影从无 Support data sources 节,整段在页级 zilliz include 内,milvus.io 同构) |
| serving 对齐轮 | B 已落地(rev 6934-6938),协调者抽查确认 |

**新挂账**:milvus 投影 format 行 "refer to Support data sources" 悬空链接(既有问题;修复需先确认 vortex/lance-table OSS 有效性;refresh 已禁用无再生成风险)。前轮三遗留(GitHub 痕迹/py create_collection 根因/userGuide volume://)维持挂账。

---

## 十六、quickstart 小节 NextChannel 补闸轮(2026-11-08)

**起因**:用户要求"将昨天增补的内容打上 NextChannel 标记"。全量审计实证:①SDK/CLI 参考 12 页的 NextChannel 闸门已于 11-06 深夜轮落地、随 11-07 11:12 UTC Fetch 生效(CURRENT 视图模拟云侧字样零残留;CLI milvus:// 示例走 `# next-channel-start/end` 代码指令;§14 保存时点的"尚未落地"注记已被同节总账覆盖);②REST 参考走 `zilliz` include(生成面正确机制);③guides create/limits/console 的 saas 包裹在 Fetch 时解析(dev 内容无标签属预期,BYOC 镜像已正确剔除);**④唯一未闸 = quickstart en/zh 的「Serving 集群 Collection 作数据源」小节**(11-06 22:37 Beijing 增补,dev 显示无任何标签——上轮记忆中"整节 saas 包裹"的断言与源不符,飞书源里 saas 块级标签段在,但从未加过渠道闸门)。

**用户拍板**:quickstart en+zh 两节打 NextChannel(en=saas 外层内再包 NextChannel;zh=仅 NextChannel)。

**执行**(lark-cli 原生 docx API,`--as user`):
- en docx `LscJdLlM6oicevx3mofcPW58nxf`(wiki 节点 KdwFwQnDNisT4skHH6Hc16uInji):root index 20(saas-open 后)插 `<NextChannel action="include">` 段、index 35(`</include>` 前)插 `</NextChannel>` 段。
- zh docx `Qb0VdGLmToPQFmxLAZNcmhdInhe`(wiki 节点 XweAwx0lriFJXhkMyb1c40v9nNh):root index 23(小节 h3 前)插开标签段、index 38(Step 4 标题前)插闭标签段。

**验证**:①两文档回读,删去 4 个标签段后与改前快照逐字节一致;②标签嵌套顺序 saas→NextChannel→节→/NextChannel→/include 实证;③离线 LarkDocWriter 多 target 断言 23/23——EN:saas 视图配对 1/1+CURRENT 模拟小节隐藏/milvus://=0+NEXT 模拟完整可见,paas/milvus 视图整节随 saas span 剔除零残留;ZH:三 target 均配对 1/1+CURRENT 隐藏/NEXT 可见;④writer 内建 `__validate_next_channel_tags`(配对/禁嵌套/action 精确匹配/页面须 CURRENT 渠道)全过。

**机制注记**:guides 面的 include 投影标签在 Fetch/派生期解析(dev 内容无标签),NextChannel 是渠道闸门须存活到渲染期(next-channel-view.js)——两者正交,`<include target="saas"><NextChannel action="include">` 分层是标准结构。下次 Fetch 后观察项:quickstart 两页 dev 内容应出现字面 NextChannel 标签对;CURRENT 构建两页小节消失、NEXT 构建可见。

---

## 十七、guides 家族 NextChannel 全量打闸轮(2026-11-08,发版驱动)

**拍板**:用户 11-08 发布当日要求"发一版不带跨集群需求的文档"→ 推翻 create/limits/console 的"照发"拍板,quickstart 同模式全家族打闸(基线 §0 例外已扩写)。

**执行**(en create rev 6941 基础上;全部 `--as user`):
- **块级 24 段**:en create 5 saas span ×2(Preparation 条目/milvus-table 行/schema 补注/Step5 refresh/Troubleshooting);zh create 4 root span ×2 + 斜杠说明 callout 内 span ×2;limits en/zh 各 1 span ×2;console en/zh 的 callout 内 span ×2(Note 的 saas 包裹在 callout children 层,根级扫描不可见——漏检教训)。
- **行内 3 处**:create_en/zh API key bullet 的行内 saas 短语(`(read/write...cross-cluster sources)`/`（跨集群源：对目标读写、对源只读）`)内层嵌 NC。

**事故与修复(str_replace 教训)**:初次用 `docs +update str_replace` 插行内 NC 时,pattern/content 里的裸 `<include target="saas">` 被**当 XML 元素解析**,两个 bullet 的 saas 文本标签被吞(短语瞬时全 target 裸露)。修复=用 XML 转义形式(`&lt;include target="saas"&gt;`)重插字面标签,** lessons:字面投影标签在 str_replace 中必须写转义形式;写完必须回读 run 级结构**。修复后两 bullet run 级结构实证正确。

**验证**:①结构 diff=仅页块 children 增长+callout children 增长+2 bullet run 变更,零删块零意外新增;②LarkDocWriter 多 target 断言 6 页 ×3 target 全过——saas 视图 NC 配对(en/zh create 6 对、limits/console 各 1 对)、CURRENT 模拟六页 milvus://=0 且跨集群 mark 全隐、NEXT 模拟 mark 全显、paas/milvus 视图零残留;③writer 内建 NextChannel 校验(配对/禁嵌套/action/页面渠道)全过。

**⚠️ 发版时序**:闸门在飞书源已生效,但 dev 要等下个定时 Fetch(18:00 UTC=11-09 02:00 Beijing)拾取;**今天(11-08)白天构建的镜像不带闸门**。若发版窗口早于该 Fetch,需先手动触发 Fetch 或调整发版时间。

**既有内容核实为非跨集群(不打闸)**:create 页 indev 段("both the serving cluster and"已被 indev 全 target 隐藏)、limits 对比表 "Serving Cluster" 列(既有 managed collection 语义)、console Note 前两条 on-demand bullets(既有内容)。

# 产品线 IA 调整方案（Vector Database / Vector Lakebase / AgentBase）

日期：2026-11-15
状态：调研完成，待拍板
输入：origin/dev IA 实测盘点（`generated/en|zh-CN/sidebars/guides.sidebar.js`、392 个 guides md、REST sidebar、product-names.yaml）+ 9 家友商文档 IA 实抓调研

## 1. 新产品架构与现有内容的映射

| 新产品 | 场景定位 | 现有 IA 对应物 | 现状散布位置 |
| --- | --- | --- | --- |
| **Vector Database** | 低时延 | Dedicated serving cluster | Development 大部分章节（Search & Query / Schema / Index / Insert & Delete / Function / Analyzer…，以 Dedicated 为主场景靠 inline 说明区分）+ Management > Clusters > Dedicated Cluster + REST Cluster Operations |
| **Vector Lakebase** | 时延不敏感、查询量特别大 | On-Demand search + external collection + external volume + batch jobs | **5 处散点**：Connect for On-Demand Search、Database for On-Demand Search、Collection > External Collection（28 文件）、Volume > External Volumes/Storage Integration（19 文件）、Batch Jobs + Management > On-Demand Cluster + REST 的 On-Demand Compute/On-Demand Cluster/Batch Job/Storage Integration/Volume Operations |
| **AgentBase** | 大 agent app 多租 | Free & Serverless cluster + 多租指南 | 仅 1 页（Management > Clusters > Free & Serverless Clusters）+ Architecture > Best Practices > Implement Multi-tenancy（database-level 策略现标注 "only available to Dedicated clusters"） |
| 共享底座 | — | 组织/项目/安全/计费/SDK/CLI/Tools/AI Models | Management 其余 + Client Libraries + Tools，保持共享 |

量化耦合（392 个 guides md，有重叠）：Serverless 56 / On-Demand 51 / External Collection 28 / Serving Cluster 37 / External Volume 19 / Global Cluster 21。

## 2. 友商结论（实抓核实）

**湖仓/分析平台**（Databricks、Snowflake、BigQuery/BigLake）：
- 一致模式：**不拆站、不拆侧栏**；顶层导航按内容类型（Get started / Guides / Develop / Reference / Release notes）而非按产品；子产品 = 一个统一骨架的 landing hub（Databricks Lakebase=`/oltp/`、BigLake=BigQuery 文档内"外部数据源"章节）；形态/edition 差异 = 集中对比页 + 页内标注（Snowflake `/user-guide/intro-editions`）；共享底座（IAM/计费/SDK reference）单点维护。
- BigLake 与 Zilliz Lakebase 场景同构（查询外部数据湖），Google 的处理是主体内章节 + 特性对比表，不是独立树。

**向量库/Agent 基础设施**（Pinecone、MongoDB Atlas、Weaviate、Qdrant、Neon、Chroma）：
- 形态表达三种范式：① 矩阵页 + 责任对比（Qdrant deploy-intro 最完整）② 功能分类内嵌 + Legacy 沉降（Pinecone：serverless 为默认基线，dedicated/BYOC 内嵌小节，pod-based 沉 Legacy）③ 独立文档单元（Weaviate/MongoDB，成本最高）。
- Reference（REST/SDK/CLI）六家均独立一层，与 guides 分离。
- Agent 产品两条路：产品级顶级单元（仅 Weaviate Engram/Query Agent）、顶级指南节（Neon AI & Agents）。**没有厂商为多租户开顶级节**——收在 namespace/branching 指南或架构中心。
- Mongo App Services EOL 案例值得参考：退役产品降为 deprecation 专页移出主导航。

## 3. 推荐方案：单站单侧栏 + 三产品 landing hub（路线 A+）

**方案定位（用户定论 2026-11-16）**：三产品是**共享内核的形态分体**，类比 **Qdrant 的 Edge vs Server**（同一引擎、不同部署拓扑），而非 Pinecone（Database/Assistant/Nexus）或 Weaviate（Database/Query Agent/Engram）那种**无交集产品线**拆分——那两家的独立产品单元各有独立 API 面，才撑得起全套独立文档。实抓调研中 9 家多产品线厂商"内容层独立"= 0/9、"站点层独立" = 0/9，共享内核形态分体连导航层都不拆（Databricks 为证）。

与 Qdrant 模式的差异（我们更复杂的一层）：Qdrant 的变体**功能可见面 100% 相同**，差异纯在"谁运维/资源在哪"；我们三产品除部署拓扑外**功能可见面有真实交集差**——External Collection/External Volume/Batch Jobs 仅 Lakebase、多租仅 AgentBase、endpoint 模式两种（cluster/project）。因此文档模式 = **Qdrant 骨架（矩阵页 + 共享开发文档主体 + 每形态 landing）+ 少量 Pinecone 式形态专属章节**，形态差异标注用 Snowflake edition 式"页内标注"。

**不建议**三产品拆独立侧栏/子站（路线 B）：友商里只有场景完全独立的 Weaviate/MongoDB 这么做；本仓三产品共享同一 SDK 面（Milvus SDK）和大部分数据面 API，拆树会造成三处重复维护；且飞书源树、翻译管线、URL/301 的改造成本数倍于路线 A。REST API 已按产品分组的事实说明**产品轴的收敛应发生在"章节 + landing + 矩阵"层，而非站点层**。

### 3.1 目标 IA（en，zh/ja 对齐翻译）

```
Get Started
  Create Your Account
  Quickstarts                     # 按产品分四条入口（现状已具备雏形）
    Quickstart to Vector Database        (原 Quickstart to Serving Cluster)
    Quickstart to Vector Lakebase        (原 On-Demand Search + External Data Lake Search 两篇合并)
    Quickstart to AgentBase              (新)
    Quickstart to CLI & Agent Integration
  Products                        # 新增分类，取代 Cluster Types 的选型职责
    Choose the Right Product              # Qdrant 式决策矩阵页（时延/QPS/数据量/多租四轴）
    Vector Database                       # landing hub：是什么/适用/Quickstart/核心特性/下一步
    Vector Lakebase                       # landing hub
    AgentBase                             # landing hub
    Plan Comparison / Cloud Providers & Regions / Feature Availability
  FAQs / Release notes

Development
  Connect                         # 共享章节：cluster endpoint vs project endpoint 对照，按产品标注
  Vector Database                 # 现 Search & Query / Schema / Index / Insert & Delete / Function / Analyzer 主体归此
  Vector Lakebase                 # 收敛 5 处散点：
    #   概念（Lakebase Explained：on-demand compute + external collection + external volume 三件套）
    #   External Collection、External Volume & Storage Integration、Data Import、Batch Jobs
  AgentBase                       # 新章节：
    #   AgentBase Explained（多租模型、租户隔离、配额）
    #   Tenant Lifecycle（创建/扩缩/回收）
    #   Multi-tenancy Strategies（自 Architecture > Best Practices 升级迁移）
  Cross-product References        # Schema 基础、Metric Types、Consistency Level 等真正跨产品的概念页

Management
  Organizations / Projects        # 共享
  Vector Database Clusters        # 原 Dedicated Cluster
  Vector Lakebase                 # 原 On-Demand Cluster + Volume + Storage Integration + Batch Jobs 管理
  AgentBase                       # 原 Free & Serverless 演化
  Global Cluster                  # 归属待拍板
  Backup & Restore / Migrations / Metrics & Alerts / 安全族 / 计费族 / Limits   # 共享

Client Libraries / Tools / AI Models / Architecture / Solution   # 共享，结构不动
```

### 3.2 关键迁移映射

| 现页面 | 去向 | 说明 |
| --- | --- | --- |
| `get-started/cu-types-explained`（Cluster Types） | 改造为 `Products > Choose the Right Product` | CU 类型（Performance/Capacity/Tiered）内容并入各产品 landing/性能章节 |
| `get-started/quickstarts/quick-start`（Serving Cluster） | Quickstart to Vector Database | |
| `quick-start-to-on-demand-search` + `quick-start-to-external-data-lake-search` | Quickstart to Vector Lakebase | 两篇合一 |
| `development/connect-to-serving-cluster` + `connect-for-on-demand-search` | Development > Connect（共享） | endpoint 对照保留，术语换产品名 |
| `development/database/database-concept`（两种 database model） | 三产品数据模型对照 | AgentBase 落地后补第三种模型 |
| `development/collection/external-collection/*`（28 文件） | Development > Vector Lakebase | |
| `development/volume/external-volumes` + `storage-integration` | Development > Vector Lakebase | |
| `development/data-import/batch-jobs/*` | Development > Vector Lakebase | 批量任务属时延不敏感场景 |
| `management/clusters/dedicated-cluster/*` | Management > Vector Database Clusters | |
| `management/clusters/on-demand-compute/*` + `management/volume/*` | Management > Vector Lakebase | |
| `management/clusters/free-and-serverless-clusters` | Management > AgentBase | Free cluster 归属待拍板 |
| `architecture/best-practices/multi-tenancy` | Development > AgentBase | database-level "only Dedicated" 表述需随 AgentBase 落地重写 |
| Feature Availability 矩阵列轴 | cluster type → 产品名 | |

**URL 策略：保持扁平 slug**（如 `/cu-types-explained`）。侧栏重排与页面改名不动 slug = 零 301、零 SEO 损失；仅 quickstart 合并等少数情况走既有 nginx 301 基建。除非未来要 `/docs/<product>/` 前缀（成本高，不推荐现在做）。

## 4. 落地阶段与管线约束

### Phase 1（概念层，零结构风险）
1. `Products` 三 landing hub + 决策矩阵页（新页，不迁移旧页）
2. 术语决策：产品名↔cluster type 的对照规范（详见 §5 待拍板）
3. `product-names.yaml` 的 check/allow 更新准备（全站 Milvus 禁词闸不变，与"底层都是 Milvus"定位兼容；allow 列表里大量 "Dedicated Clusters compatible with Milvus v3.0.x…not yet available on On-Demand" 句式要随术语迁移统一翻新）

### Phase 2（导航层）
4. 侧栏树重排（§3.1）——**飞书源 wiki 目录重排 → Fetch → generated sidebars → zh/ja 翻译管线**，这是本方案最大的工作量与风险点：
   - guides 侧栏树由飞书目录结构 + manifest 生成（`scripts/docs-workflow/generate-guides-sidebars.js`），改侧栏 = 改飞书源结构
   - zh-CN `tools.sidebar.js` 从 guides sidebar 抽取（`category:tutorials/tools` key），飞书侧 tools 目录不可挪
   - 三语 label 词典同步（zh "Serving 集群/按需搜索"、ja 对应词）
   - shared-docs 93 页中含产品名引用的页面同步修订（check 闸兜底）
5. Release notes/FAQ/changelogs 中历史 cluster 术语**不改写**（历史记录保持原文），只在导航与新内容用新术语——避免翻译回翻与历史失真

### Phase 3（内容层）
6. Feature Availability 矩阵列轴迁移 + 正文 inline 可用性声明批量翻新（x-added-at/next-channel/x-beta 三标记正交模型不变）
7. multi-tenancy 升级为 AgentBase 产品文档；AgentBase REST 面就位后 titles.json + 片段 tag 按现有生成通路接入
8. Global Cluster / BYOC 章节按拍板结果归位

### 全程护栏
- 每步跑 `pnpm test:for-change -- <changed-path>`、`pnpm test:workflow-policy`、双语 `build:en`/`build:zh-CN`
- 飞书源改动走 edit-docs 四通道路由；产品名批量替换前先在 `product-names.yaml` allow 列表补过渡期双写句式
- watchdog（site-validation / broken-links / GA4 404）兜底断链与校验回归

## 5. 待拍板问题

1. **Global Cluster 与 BYOC 归属**：新架构未提及。Global（跨区容灾）倾向归 Vector Database 的能力面；BYOC 是部署形态不是产品，倾向保留为 Plan Comparison 维度（Snowflake edition 模式）。
2. **Free cluster 归属**：跟 AgentBase（免费试用入口）还是保留独立"Free"档位？影响 AgentBase quickstart 与计费文档。
3. **"Serving cluster" 术语存废**：Dedicated→VDB、Serverless→AgentBase 后，serving cluster 作为统称是否退役？涉及 37 个文件 + product-names.yaml allow 句式 + zh/ja 词典。
4. **对外时间表**：产品名公布前文档是否先行（x-beta/preview 标记可用），还是同步发布？决定 Phase 1 能否先做。
5. **AgentBase 的 endpoint/SDK 面**：若 AgentBase 复用 serving endpoint + Milvus SDK，Connect 共享章节成立；若引入新 endpoint（多租路由），需要新 Connect 页与 REST 组。
6. **Lakebase 是否保留 on-demand cluster 概念**：用户视角 Lakebase 应该是"数据+查询"而非"集群"；若产品侧想隐藏 cluster 概念，Management > Vector Lakebase 的集群生命周期文档要重写成"计算资源"视角。

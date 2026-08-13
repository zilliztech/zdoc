---
title: "版本说明书（2026/05） | Cloud"
slug: /release-notes-2605
sidebar_label: "2026/05"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: A2JWwWmori22ZMkvZfEch3wZn5e
sidebar_position: 4
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/05）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-05-13**

    </div>

    <div>

        ## [BYOC] 多数据平面支持\{#byoc}

        Zilliz Cloud BYOC 现已支持在单个项目中配置多个数据平面。一个 BYOC 项目现在可以跨多个区域部署，其中每个数据平面代表一个区域级基础设施单元。

        - 单个 BYOC 项目下可配置**多个数据平面**，并新增了用于数据平面管理的**数据平面页面**。

        - 在项目内创建集群时，可按目标区域/数据平面进行选择。

        现有 BYOC 项目保持兼容，无需迁移数据。当前 BYOC 项目会继续以“单数据平面项目”的方式正常运行。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase 进入公测版（Public Preview）\{#vector-lakebase-public-preview}

        在这次重要发布中，Zilliz Cloud 从“向量数据库产品”进化为“Vector Lakebase 平台”。

        升级后，原有向量数据库服务成为面向低时延关键负载的实时服务层；同时平台整体扩展了数据与计算能力，以更好支持现代 AI 与 Agent 应用所需的语义搜索与分析闭环。

        Vector Lakebase 基于 S3 的统一数据底座，通过三种访问模式支撑 AI 与 Agent 负载：

        - **实时检索（Real-time Retrieval）**：用于低时延生产服务；

        - **迭代探索（Iterative Discovery）**：用于交互式与多步骤探索；

        - **批处理分析（Batch Analytics）**：用于离线挖掘与数据集优化。

        Vector Lakebase 采用完全解耦的存储-计算架构。数据存储在“数据库（Databases）”中——这是项目级向量存储，独立于任何计算集群——团队可在其中存储无限量向量，以及文本、JSON、标签、地理空间数据和其他属性类型。

        尤其值得关注的是，Zilliz Vector Lakebase 引入了以下关键能力：

        **按需搜索（On-Demand Search）**

        交互式探索与批处理分析通常运行在比在线服务大 1 到 3 个数量级的数据集上，包含反馈数据、日志、Agent 笔记和爬取语料等。这类负载通常是任务驱动而非持续运行，计算资源有超过 97% 的时间处于空闲状态。因此，从成本角度看，使用长期常开的超大向量数据库集群往往难以合理化。

        Zilliz On-Demand Search 直接按对象存储与按需计算计费——类似 AWS Lambda，费用主要由分配资源规模和执行时间决定，同时存储成本基本贴近底层 S3 成本。

        对于这类非持续在线负载，On-Demand Search 与 Serverless 都采用按量付费模型。但实验显示：在 10 亿向量规模、每月累计 10 小时活跃计算的场景下，On-Demand Search 总成本仅约为 Serverless 的 1/15（318 美元 vs. 4,937 美元）。

        详情请参考 [快速开始：按需搜索](./quick-start-to-on-demand-search) 与 [按需计算费用](./on-demand-compute-cost)。

        **外部数据湖搜索（External Data Lake Search）**

        Zilliz Vector Lakebase 提供全托管存储与查询计算，同时也支持已具备自有数据湖基础设施与治理流水线的客户。

        对于 AI 负载，关键挑战在于如何直接在湖数据之上实现高效检索与语义探索。传统系统如 Spark、Ray 更擅长全量扫描与 Map-Reduce 计算，而非基于索引加速的语义检索。

        为此，Zilliz 提供了 External Collection 模式——对客户自有湖表进行零拷贝逻辑映射，并在其上构建高性能索引与全谱搜索能力。

        了解如何为现有数据湖建立索引与加速，请参见 [快速开始：External Data Lake Search](./quick-start-to-external-data-lake-search)。

        Vector Lakebase 可通过 Zilliz Cloud 控制台、REST API、PyMilvus 与 Zilliz CLI 访问。其引入了基于使用量的计费模型，覆盖计算、存储与存储请求，包括 Query CU、Indexing CU、Project Database Storage 与 Storage Requests。

        ## Milvus 3.0 公测预览（Public Preview）\{#milvus-30-public-preview}

        随着 Vector Lakebase 发布，Zilliz 同步推出 Milvus 3.0 公测预览。该版本中，Milvus 通过开放数据格式及与现有数据湖和大规模数据处理引擎的更广泛集成，将向量数据库能力扩展到 AI 数据基础设施栈。

        <Admonition type="info" icon="📘" title="说明">

        本次发布中，Milvus 3.0 能力仅支持 On-demand Clusters，尚不支持 Serving Clusters。

        </Admonition>

        **外部数据与存储格式**

        - **External Collection** —— 可直接引用对象存储中的数据（Parquet、Lance、Vortex、Iceberg），无需先拷贝到 Milvus。Milvus 仅管理 schema、索引与查询执行。通过增量 Refresh 可保持与源文件变更同步，同一数据集也可被多个实例同时服务。        详情请参见 [创建 External Collection](./create-external-collection)。

        - **External Backfill** *（内测版）* —— 可在不停机的情况下为在线集合升级 embedding 模型。先通过 `AddCollectionField` 添加新向量字段，用 Snapshot 冻结一致性起点，离线运行 embedding 任务，再通过常规写入路径回填数据。新列完成索引后，应用即可切换。

            *如需加入 External Backfill 内测，[请联系我们](https://zilliz.com.cn/contact-sales)。*

        **Schema 与数据建模**

        - **Null Vector** —— 允许所有六类向量字段支持可空。搜索时会自动跳过 NULL 行，不影响召回质量，且 NULL 向量几乎不占存储。现有集合也可通过 `AddCollectionField` 在线新增可空向量列，无需重建。

            详情请参见 [Nullable 属性](./nullable-fields)与[默认值](./default-fields)。

        - **EmbList + DiskANN** —— 每个实体可存储变长向量列表，并通过 DiskANN 在磁盘侧建立索引。适用于长文档、ColBERT 等晚交互模型和多模态实体，在大规模语料下有助于控制内存占用。

            详情请参见 [StructArray 概述](./use-array-of-structs)与 [StructArray 操作符](./struct-array-filtering)。

        - **MinHash DIDO（Doc-in, Doc-out）** —— 为 MINHASH_LSH 增加服务端 MinHash 函数。Milvus 在插入、批量插入和搜索时可自动计算签名，无需应用侧预处理，适用于去重、指纹比对和抄袭检测等流程。

            详情请参见 [MinHash Function](./minhash-function)。

        **搜索与排序控制**

        - **Query / Search Order By** —— 支持多字段排序及每字段 ASC / DESC，并下推到内核执行。无需再为复合排序进行 over-fetch 与客户端二次重排。

            详情请参见 [基本 Vector Search](./single-vector-search)、[Grouping Search](./grouping-search) 和 [Query](./get-and-scalar-query#aggregate-query-results)。

        **数据生命周期与运维**

        - **Snapshot** —— 集合的时间点只读视图，引用现有 segment 而不复制数据。批任务可在类 MVCC 隔离下运行，在线集合仍可持续写入；适用于 A/B 评估、去重和回填验证。

            详情请参见[Snapshot](./snapshots)与[管理 Snapshot](./manage-snapshots)。

        - **Entity TTL（行级 TTL）** —— 通过 `Timestamptz` TTL 字段按行过期。过期行自动回收，覆盖保留期合规、会话数据、对话历史等场景，无需应用侧清理。

            详情请参见 [设置 Collection 生存时间](./set-collection-ttl#enable-entity-ttl-on-a-new-collection)。

        - **Force Merge** —— 可在低峰窗口显式触发 segment compaction（同步或异步），降低分片碎片化带来的查询时延抖动和存储开销。

        **文本与 Spark 驱动的数据处理**

        - **自定义词典与分词器** *（内测版）* —— 可通过 FileResource 机制注册自定义分词词典、同义词表、停用词表与拆词规则，并统一作用于 BM25、分析器与 Text Match，实现集中版本管理而非散落在应用代码中。

        - **Spark Semantic Dedup** *（内测版）* —— 支持大规模 Spark 数据处理中的语义去重。

        - **Spark Abnormal Detection** *（内测版）* —— 在基于 Spark 的数据处理中识别异常记录或模式。

            *如需加入上述任一能力的私测，[请联系我们](https://zilliz.com.cn/contact-sales)。*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud 除 Managed Volumes 外，现已支持 External Volumes。External Volume 是指向您自有云对象存储桶或路径的只读引用，使 Zilliz Cloud 能在原位读取源数据以用于导入、迁移与外部集合流程——无需先将数据拷贝到 Zilliz Cloud。

        - **数据就地使用** —— 可将 External Volume 指向 AWS S3 或 Google Cloud Storage 路径。数据保留在您的存储桶中；Zilliz Cloud 仅在需要时读取。

        - **可控的区域化访问** —— 访问通过 Storage Integration 与 Zilliz Cloud RBAC 管理，确保仅授权项目用户可以创建或管理 External Volumes。

        详情请参见 [External Volume](./external-volume)。

        ## Large TopK\{#large-topk}

        现已在集合级支持 Large TopK，将启用集合的最大返回实体数从 16,384 扩展到 1,000,000。该能力同时适用于 Serving Cluster 与 On-demand Compute，尤其适合数据挖掘和批量分析场景，可为候选生成、模型评估与大规模相似性搜索提供更广的候选召回范围。

        详情请参见[使用大 TopK](./use-large-topk)。

        ## 功能增强（Enhancements）\{#enhancements}

        - **区域感知的项目治理** —— 项目现已纳入区域约束，帮助企业管理数据驻留并使区域数据平面访问边界更清晰。该区域模型已同步体现在 Zilliz Cloud 控制台与 API 中。

        - **Zilliz CLI 更新** —— Zilliz CLI 已完成与本次发布的能力对齐，覆盖 Lakebase、External Volumes、区域感知操作及定价相关更新。详情请查看 [Zilliz CLI](https://github.com/zilliztech/zilliz-cli)。

    </div>

</Grid>


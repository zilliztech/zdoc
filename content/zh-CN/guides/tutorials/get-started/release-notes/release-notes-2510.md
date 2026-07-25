---
title: "版本说明书（2025/10） | Cloud"
slug: /release-notes-2510
sidebar_key: release-notes-2510
sidebar_label: "2025/10"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2025/10） | Cloud"
type: origin
token: T9nXwdrWqinfgCk4BFDcDhf8nOe
sidebar_position: 7
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2025/10）

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025-10-09**

    </div>

    <div>

        ## Milvus 2.6 开始公测\{#milvus-v26x-public-preview}

        随着本次发布，Milvus v2.6.x 集群现已在 Zilliz Cloud 上进入**公测**阶段，具备多项增强和优化功能，可提升稳定性、效率和灵活性。

        - **支持不停机添加 Collection 字段** - 无须重建 Schema 和 Collection 即可即时在 Collection 中添加新字段。更多内容，可参考[向 Collection 添加字段](./add-fields-to-an-existing-collection)。

        - **全文检索能力再增强** - 比 Elasticsearch 快四倍，提供多语言检测和短语匹配功能。更多内容可参考[多语言 Analyzer](./multi-language-analyzers)、[Phrase Match](./phrase-match) 和[最佳实践：如何选择合适的 Analyzer](./choose-the-right-analyzer-for-your-use-case)。

        - **JSON 过滤再加速** - 使用 JSON 索引和 Shredding，加速结构复杂、多重嵌套的元数据过滤能力，**性能提升 100 倍**。更多内容可参考 [JSON 索引](./json-indexing)和 [JSON Shredding](./json-shredding)。

        - **全新重排 Function** - **Boost Ranker** 和 **Decay Ranker** 将语义检索和上下文关联相结合，提供更有意义的搜索结果。更多内容，可参考 [Boost Ranker](./boost-ranker) 和 [Decay Ranker](./decay-ranker)。

        - **支持 INT8_VECTOR 数据类型** - 存储量化向量数据，提供更加轻量化的深度学习推理。更多内容，可参考[稠密向量](./use-dense-vector)。

        - **MINHASH_LSH 索引类型** - 借助 MinHash 和局部敏感哈希 （LSH）技术，执行高效的大规模消重和相似性检查。该特性为**内测版**特性。如果您想试用该特性，可以联系我们。更多内容，可参考 [MINHASH_LSH](https://milvus.io/docs/zh/minhash-lsh.md)。

        - **部分 Upsert** - 无须重写整条记录即可刷新指定字段的值。更多内容，可参考[在合并模式下进行 Upsert](./upsert-entities)。

        如需启用公测版特性，可以登录 Zilliz Cloud 控制台，在**集群详情**页面单击**试用测试特性**将您的集群升级到 Milvus v2.6.x。升级后，所有 Milvus v2.5.x 相关能力仍旧可用。

        ## 分层存储升级\{#tiered-storage-upgrade}

        Zilliz Cloud 的分层存储进行了重大升级，将所有分层存储型集群迁移到冷热温三层新架构，平衡了性能和成本效益。主要改进包括：

        - **智能数据管理**：根据访问模式自动在热（内存）、温（SSD）和冷（对象存储）三种存储层之间移动数据，提升性能并降低成本。

        - **更高的缓存命中率**：缓存命中率超过90%，大部分查询从更快速的存储层获取数据。

        - **大幅成本降低**：计算成本降低了25%，存储成本从每GB每月 ¥1.2 降至 ¥0.5，下降幅度达到87%。以10TB数据集为例，月存储费用从 ¥12000 降至 ¥5000，同时保持高性能。

        ## 跨地域备份\{#cross-region-backup}

        Zilliz Cloud 现已支持为 Dedicated 集群提供跨地域备份，增强了灾难恢复能力。此功能通过自动将备份复制到其他区域，确保在云区域故障时的业务连续性。

        关键能力

        - **自动复制**：只需配置一次备份策略，Zilliz Cloud 即可自动处理向所选目标地域的持续复制。

        - **地理冗余**：通过将备份副本存储在与原始备份物理上不同的地域，防范地域故障。

        - **快速恢复**：快速将数据从跨地域备份恢复到新集群，最大限度减少停机时间，显著改善恢复时间目标（RTO）。

        更多内容，可参考[跨地域备份](./backup-to-other-regions)。

        ## Index Build Level\{#index-build-level}

        借助 Milvus 2.6.x 和我们的下一代量化引擎，您可以根据应用需求微调搜索准确性（召回率）和数据容量之间的平衡。Zilliz Cloud 新增的索引构建级别功能使您可以控制向量搜索性能，在创建索引时提供三种选择：

        - **精度优先**：最大化搜索准确性，适用于精准要求高的关键应用。

        - **平衡型**（默认）：适用于大多数场景，提供召回、性能和容量的理想平衡。

        - **容量优先**：优化数据密度，降低查询召回率，但允许您以更低预算存储更多向量。

        更多内容，可参考[调整索引构建级别](./tune-index-build-level)。

        ## 更多增强\{#enhancements}

        - 现在，您可以使用 **Anlayzer 设置界面**快速配置**特定语言的 Analyzer 模板**，并**测试结果**。这有助于用户了解其 Analyzer 配置如何影响分词，以及最终如何影响 Full-Text Search 结果。如需演示，请查看[Analyzer 概述](./analyzer-overview#example-use-on-the-zilliz-cloud-console)。

        - 在数据迁移前，更清晰的错误信息和增强的体验**有助于用户诊断连接问题**，更轻松地设置源数据库以进行迁移。

        - 在克隆无数据的 Collection 时，您可以编辑 Schema 并修改 Collection设置。

        ## 弃用特性公告\{#deprecation-notice}

        - Pipeline 功能已弃用并下线。

    </div>

</Grid>


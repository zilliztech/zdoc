---
title: "版本说明书（2026/01） | Cloud"
slug: /release-notes-2601
sidebar_key: release-notes-2601
sidebar_label: "2026/01"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "版本说明书（2026/01） | Cloud"
type: origin
token: QIEew7qWOiHucGkw1qicgPUjnsc
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 版本说明书（2026/01）

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026 年 1 月 29 日**

    </div>

    <div>

        ## Milvus 2.6 新功能\{#another-milvus-v2.6.x-new-feature}

        - **主键搜索**：直接基于**主键**（Primary Key）来发起 ANN 搜索，省去了搜索前检索原始向量的步骤。更多内容，可参考[Primary Key Search](./primary-key-search)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026 年 1 月 23 日**

    </div>

    <div>

        ## Milvus 2.6 新功能\{#milvus-v2.6.x-new-feature}

        - **基于查询语义的文本高亮（Semantic Highlighter）**：根据查询意图（而非关键词匹配）自动识别并高亮搜索结果中最相关的文本片段，提升搜索结果的可解释性。

        - 该功能基于 Zilliz 近期开源的语义高亮模型（[zilliz/semantic-highlight-bilingual-v1](https://huggingface.co/zilliz/semantic-highlight-bilingual-v1)），并通过 Zilliz 托管模型服务（详见 [托管模型](./hosted-models)）提供开箱即用的推理支持。

        更多详情，可参考 [Semantic Highlighter](./semantic-highlighter)。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026 年 1 月 15 日**

    </div>

    <div>

        ## Milvus 2.6 新功能\{#milvus-v2.6.x-new-features}

        - **时区感知时间戳**（Time-zone-aware Timestamp Support)  — 支持 `TIMESTAMPTZ` 数据类型，用于存储、比较和过滤全球一致的时间戳，无需手动处理时区问题。更多内容，可参考 [TIMESTAMPTZ 类型](./use-timestamptz-field)。

        - **Highlighter** — 通过可自定义的标签和片段级上下文对匹配词进行标注，使全文检索结果更易理解和调试。更多内容，可参考 [Lexical Highlighter](./text-highlighter)。

        ## Function & 模型推理\{#function-and-model-inference}

        Zilliz Cloud 正式推出“基于模型的向量生成与重排能力”的公测版，以及 Zilliz 托管模型（Zilliz Hosted Models）的内测版。

        本次更新大幅简化了 AI 应用的开发流程。现在，用户可以直接向 Zilliz Cloud 写入原始文本数据，系统将自动完成向量生成（Embedding）与结果重排（Reranking），确保返回最相关的搜索结果。

        你可以选择来自第三方模型厂商（如硅基流动），也可以将自己的模型直接托管在 Zilliz Cloud 上运行。

        核心能力：

        - **基于模型的向量生成（Model-Based Embedding）**
在创建集合时即可定义文本向量生成函数。配置完成后，只需通过 `Insert`、`Upsert` 或 `Import` 写入原始文本，Zilliz Cloud 会自动完成向量生成与存储；在查询阶段，系统会将输入文本实时转换为稠密向量并执行高效的 ANN 搜索。
更多内容，可参考[Model-based Function](./model-based-functions)。

        - **基于模型的结果重排（Model-Based Reranking）**
可根据具体业务场景选择最合适的重排模型，对搜索结果进行二次排序，确保最相关内容优先返回。
更多内容，可参考 [Model Ranker](./model-ranker)。

        - **Zilliz 托管模型（内测版）**
可直接在 Zilliz 基础设施上部署全托管模型实例，实现稳定、高性能的推理能力，并且免数据传输费用。模型运行在 Zilliz Cloud 内部网络中，数据始终处于私有网络环境，兼顾更高安全性与超低延迟。
更多内容，可参考 [托管模型](./hosted-models)。

        此外，为了进一步简化与第三方模型的集成流程，我们新增了 **第三方模型提供商集成** 功能。该功能支持在 Zilliz Cloud 内集中管理 AI 模型的访问凭证，并可随时轮换 API Key，无需修改应用代码，帮助你实现更灵活、更安全的模型集成。
        更多内容，可参考 [模型供应商](./integrate-with-model-providers)。

        ## Replica 动态扩缩容\{#dynamic-replica-autoscaling}

        我们推出了智能 Replica 动态扩缩容方案。这是一项专门为高 QPS、需求波动较大的环境设计的关键特性，可以帮助您的集群根据实时流量模式自动调整 Replica 数量。

        - **负载自适应扩缩容**：Zilliz Cloud 会根据访问流量的大小，自动调整集群 Replica 的数量，保障业务性能和成本间的平衡。

        - **零接触配置**：通过简单的资源上下限配置，Zilliz Cloud 可以根据负载自动处理突出流量，无须人工介入，即可保证性能体验。

        更多内容，可参考 [Replica 扩缩容](./manage-replica#dynamic-scaling)。

        ## 基于 Cron 设置的高级定时扩缩容\{#advanced-scheduled-scaling-with-cron}

        我们已经升级了调度引擎，以编排复杂、可预测的业务周期。现在，您可以使用行业标准的 Cron 表达式自动执行针对 CU 和 Replica 的精确扩缩容策略。

        - **灵活调度策略**：由简单的基于日期的调度升级成使用 Cron 表达式（如 `0 9 * * * 1-5`）的精细化调度规则。您可以根据业务诉求自行定制扩缩容策略。

        - **多级调度逻辑**：您可以为您的集群配置互相独立、分层执行的调度规则，确保您的集群可在工作日流量高峰时获得足够的资源，并在平峰的周末释放冗余资源，从而根据业务实际需要优化集群的资源配置。

        更多内容，可参考 [Replica 扩缩容](./manage-replica#scheduled-scaling)和 [Query CU 扩缩容](./scale-query-cu#scheduled-scaling)。

        ## BYOC - 完整的自动扩缩容能力\{#byoc-full-autoscaling-aligns-with-saas}

        自本次发布后，BYOC 项目也开始支持完整的自动扩缩容能力。

        - 动态扩缩容：支持 Query CU 和 Replica 的自动扩缩容能力。通过设置资源分配的上限和下限，Zilliz Cloud 可以根据集群的实时负载自动调整分配给集群的资源，优化查询性能和业务成本。

        - 定时扩缩容：支持基于 Cron 表达式的高级定时扩缩容能力。用户可以根据业务诉求自行编写 Cron 表达式，利用 Zilliz Cloud 的多级调度逻辑，在复杂、可预测的业务周期中实现精确的自动化资源调整。

        更多内容，可参考 [Query CU 扩缩容](/docs/byoc/scale-cluster) and [Replica 扩缩容](/docs/byoc/manage-replica)。

        ## BYOC - 技术支持访问控制\{#support-troubleshooting-access-control}

        自本次发布后，您可以控制针对 Data Plane 的运维操作访问。确保 Zilliz 工程师只有在获得您的明确许可的情况下才能访问您的基础设施。

        - **Just-in-Time（JIT）权限**：在维护窗口内授予 Zilliz 工程师临时访问权限，并在问题解决后即时吊销授权。

        - **运维隔离**：吊销技术支持访问授权为您的 Data Plane 提供更多安全保障，但不会妨碍包括性能指标、日志和告警等关键观测数据的收集。

        - **数据治理与合规**：所有权限的授予和吊销均会记录审计日志，方便您随时进行日志追溯和安全审查。

        ## 更多增强\{#enhancements}

        - **Collection TTL 和 Auto ID 设置**：支持在 Collection 概述 GUI 监控和修改 Collection TTL 以及设置是否允许插入 Auto ID 。详细信息，请参阅[设置 Collection 生存时间](./set-collection-ttl)和[修改 Collection](./modify-collections)。

        - **数据导入**：现在支持 JSON Lines 格式（.JSONL和.NDJSON 扩展名）。详细信息，请参阅[从 JSON/JSON Lines 文件中导入](./data-import-json)。

        - **从 Milvus Endpoint 迁移**：支持 Geometry 和 Struct 数据类型，可实现具有空间形状和深度嵌套属性 Colleciton 的无缝迁移。

        - **任务详情视图**：侧边抽屉 UI 已刷新，以改善导航并提升用户体验。

        - **BYOC - 自定义对象存储桶支持**：支持使用自定义对象存储桶部署集群，从而提供细粒度的数据隔离和独立的生命周期管理。

        - **指标仪表盘增强**：已添加可视化阈值指南，以帮助用户确定扩展 Query CU 和 Replica 的最佳利用率水平。

        - **RESTful API 和 Terraform 增强功能**：支持自动伸缩、跨区域备份、创建分层存储集群的 Restful 和 Terraform，提升了灾难恢复和存储管理能力，实现更高效的自动化编程。

    </div>

</Grid>


---
title: "版本说明书（2025/07/15） | Cloud"
slug: /release-notes-2180
sidebar_key: release-notes-2180
sidebar_label: "2025/07/15"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在本次发布中，Zilliz Cloud 推出了多项强大的新功能，旨在提升运维效率、灵活性和用户体验。这些更新包括对集群级别定时自动扩缩容的支持、通过全新的 Merge Data API 实现 Schema 演进、推出用于简化数据接入流程的云原生数据层 Stage、支持从集群级备份中进行跨数据库的部分数据恢复，以及为 JSON Path 索引提供 UI 支持。这些功能共同帮助用户更高效地管理复杂的工作负载，降低维护开销，并加快在生成式 AI 时代下的开发周期。 | Cloud"
type: origin
token: QxMewBHpRisntJkA1NncBNSZnQc
sidebar_position: 9
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/07/15）

在本次发布中，Zilliz Cloud 推出了多项强大的新功能，旨在提升运维效率、灵活性和用户体验。这些更新包括对集群级别定时自动扩缩容的支持、通过全新的 Merge Data API 实现 Schema 演进、推出用于简化数据接入流程的云原生数据层 Stage、支持从集群级备份中进行跨数据库的部分数据恢复，以及为 JSON Path 索引提供 UI 支持。这些功能共同帮助用户更高效地管理复杂的工作负载，降低维护开销，并加快在生成式 AI 时代下的开发周期。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.5.x**。同时，所有 Milvus v2.5.x 相关特性在 Zilliz Cloud 上均已全面可用。

关于各项功能的可用性，可以参考[当前功能支持情况](./feature-availability#)。

## 通过 Merge Data API 实现 Schema 演进 | PRIVATE\{#schema-evolution-via-merge-data-api}

在生成式 AI 时代，业务逻辑的快速迭代导致 Collection Schema 变更比以往更加频繁，然而这些变更仍然成本高昂且操作复杂。更新 Schema 往往意味着需要重建整个 Collection：导出数据、合并新字段、再从头重新导入所有数据。这一手动过程耗时费力，容易出错，并且通常需要长时间的写入停机时间。

为了解决这一挑战，Zilliz 推出了一项全新的**批量提取转换加载（ETL）能力**，用于实现自动化的 Schema 演进。作为本次发布的一部分，ETL 服务下新增了一个 **Merge Data RESTful API** ，用户只需一次 API 调用即可执行大规模的 Schema 更新。该 API 允许将现有的 Collection（基础集合 Base）与一个外部文件（包含主键和新字段）进行合并，生成一个具有新 Schema 的目标集合（Target）。一旦验证完成，用户只需更新别名即可实现无缝切换，几乎不会造成任何服务中断。

在底层，Merge Data API 将分布式批处理引擎与 Stage（暂存）、快照备份以及导入流程整合到一个原子操作中，用户无需再手动协调各个步骤。从数据校验到最终导入，整个流程全部自动化完成。这极大地降低了运维负担，并使得 Schema 更新可以**在数小时内完成**，而非以往的数天。

<Admonition type="info" icon="📘" title="说明">

为了保证合并前后的数据一致性，在合并过程中需要暂停向源 Collection 写入数据。

</Admonition>

该特性当前为**内测版**特性。请[联系我们](https://support.zilliz.com.cn/hc/zh-cn)为您开通访问权限。关于详细的 RESTful 参考文档，可以参考[合并数据](/reference/restful/merge-data-v2)。

## 重磅推出 Stage：Zilliz Cloud 的数据层基础能力 | PRIVATE\{#introducing-stage-the-data-layer-of-zilliz-cloud}

我们很高兴向大家介绍 **Stage** —— 一个全新的核心能力，也是 Zilliz Cloud 的基础数据层。

Stage 提供了一个托管式、云原生的数据暂存区域，专为处理非结构化数据而设计。它旨在支持大规模的数据流转操作，包括上传、缓存，并为将数据迁移到向量集群以及导入准备提供统一的数据中转层，是 Zilliz 各项服务中 ETL 工作流的统一数据底座。

在本次初始发布版本（内测版）中，用户可以：

- 通过 RESTful API 管理 Stage，包括[创建](/reference/restful/create-volume-v2)、[查看列表](/reference/restful/list-volumes-v2)和[删除](/reference/restful/delete-volume-v2) Stage；

- 将 Stage 作为迁移（Migration）与导入（Import）服务共享的数据中转层，简化数据接入流程：

    - **迁移（Migration）**：只需一步即可将本地 Milvus 环境中的数据无缝迁移到 Zilliz Cloud。此前，用户需要手动创建备份、上传文件到 S3 并分别触发导入任务。有了 Stage，整个流程被统一化、加速且更少出错。详情请参阅[通过 Stage 从 Milvus 迁移至 Zilliz Cloud](./via-stage)。

    - **导入（Import）**：导入任务现在支持将 Stage 作为暂存后端，减少了对对象存储的依赖，避免了 token 过期问题，使那些无法直接访问云存储的用户也能轻松将数据导入 Zilliz Cloud。详情请参阅[创建导入任务](/reference/restful/create-import-jobs-v2)并查看**请求体**中的**使用 Stage** 选项。

未来，Stage 将进一步集成备份（Backup）、导入（Import）及 ETL 服务，扩展对非结构化数据处理、数据共享以及管道化工作负载的支持，成为 Zilliz Cloud 中数据流动的核心基础设施。

该功能目前处于内测阶段 ，如需在您的账号中启用，请[联系技术支持](https://support.zilliz.com.cn/hc/zh-cn)。

## 集群定时扩缩容功能上线\{#scheduled-cluster-scaling-now-available}

Zilliz Cloud 现在支持集群级别的定时扩缩容 ，让您能够根据可预测的工作负载模式主动控制资源分配。

![TW6QbWqhioVCNHxB3Fkc3zavnyf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/TW6QbWqhioVCNHxB3Fkc3zavnyf.png "TW6QbWqhioVCNHxB3Fkc3zavnyf")

- **基于时间计划的 CU 与 Replicas 自动扩缩容** ：现在您可以定义特定的时间计划，以自动调整您的 CU 和 Replica 数量。在工作时段轻松扩展资源以应对流量高峰，在夜间或周末等低峰期自动缩减资源，从而在无需人工干预的情况下优化成本。

- **更强的可视性与控制能力** ：此次更新通过引入扩缩容计划的可视化展示 ，让您的自动扩缩配置更加透明清晰。

- **主动审计功能** ：我们提供透明的电子邮件通知系统和审计日志，确保您对资源交付和成本支出更加安心。

更多内容，可以参考[定时扩缩容](./scale-cluster)。

## 从集群备份中跨数据库恢复部分数据\{#partial-restore-from-cluster-level-backups-with-cross-database-selection}

现在，您可以从集群级备份中选择性地恢复特定的数据库和 Collection ，包括来自多个不同数据库中的 Collection。这项增强功能缩短了数据恢复所需的时间，并让您对恢复哪些数据拥有更细粒度的控制，而无需恢复整个集群。

![UCUgbu2QUovXonx0JpncNj9HnLd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UCUgbu2QUovXonx0JpncNj9HnLd.png "UCUgbu2QUovXonx0JpncNj9HnLd")

更多内容，可以参考[恢复部分集群数据](./restore-from-snapshot#restore-a-partial-cluster)。

## 在 Zilliz Cloud 控制台上创建 JSON Path 索引\{#create-json-path-indexes-on-zilliz-cloud-console}

Zilliz Cloud 现在支持通过 Web 控制台直接创建 JSON Path 索引 ，加速对半结构化数据的查询。该功能同时支持 JSON 字段和 Dynamic Field，提供灵活且高性能的过滤能力。

![ViLvb57Oook1fux8BWncEP4an2d](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ViLvb57Oook1fux8BWncEP4an2d.png "ViLvb57Oook1fux8BWncEP4an2d")

关于 JSON Path 索引的更多内容，可以查看[为 JSON 字段内的值创建索引](./use-json-fields)和[为 Dynamic Field 中的键创建索引](./enable-dynamic-field#index-keys-in-the-dynamic-field)。

## 包年集群支持阿里云市场/亚马逊云市场支付\{#anual-payment-clusters-support-aliyun-and-amazon-marketplaces}

![WA0RbnmyloH0BUxacdtc1bvMnTr](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/WA0RbnmyloH0BUxacdtc1bvMnTr.png "WA0RbnmyloH0BUxacdtc1bvMnTr")

## 其它增强\{#other-enhancements}

- 在恢复集群备份时，可以选择是否恢复 RBAC 配置。

    ![SonlbgANBoxxDjxtf39cmCK3nzc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SonlbgANBoxxDjxtf39cmCK3nzc.png "SonlbgANBoxxDjxtf39cmCK3nzc")

    <Admonition type="info" icon="📘" title="说明">

    该设置仅对本次发布后创建的集群有效。

    </Admonition>

- 在控制台上提供内测功能的概览及升级按钮，供您在升级前了解相关功能。如需开通，请[联系技术支持](https://support.zilliz.com.cn/hc/zh-cn)。

    ![OzGrbc6Gko9NNfxManxcofc8n6g](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/OzGrbc6Gko9NNfxManxcofc8n6g.png "OzGrbc6Gko9NNfxManxcofc8n6g")

- 单个数据导入请求支持上传的文件总大小上限由之前的 100 GB 提升至 1 TB。

- 当您的组织被冻结后，该组织中所有手动创建的集群备份的保存时间由之前的永久保存自动修改为 30 天，以便为您节约存储费用。


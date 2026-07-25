---
title: "版本说明书（2024/02/27） | Cloud"
slug: /release-notes-260
sidebar_key: release-notes-260
sidebar_label: "2025/02/27"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "我们很高兴地宣布 Zilliz Cloud 发布新的版本。此版本引入了一系列增强和功能更新。主要涉及 Pipelines、数据导入、API 密钥以及指标和告警方面的功能性更新。 | Cloud"
type: origin
token: FR9Ww6TbRifhQFk1TV0c3a4tnfg
sidebar_position: 21
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/02/27）

我们很高兴地宣布 Zilliz Cloud 发布新的版本。此版本引入了一系列增强和功能更新。主要涉及 Pipelines、数据导入、API 密钥以及指标和告警方面的功能性更新。

## Milvus 兼容性\{#milvus-compatibility}

此次发布兼容 **Milvus 2.3.x**。

## Pipelines\{#pipelines}

今天，我们非常高兴地向大家介绍 Zilliz Cloud 的新特性 Zilliz Cloud Pipelines。Pipelines旨在将非结构化数据无缝转换为矢量嵌入，并将其传入 Zilliz Cloud 进行存储和检索，从而释放非结构化数据的潜力。该解决方案通过整合嵌入、摄取、存储和检索等流程，简化了数据工作流程，为开发人员提供了一个受欢迎的解决方案。

Zilliz Cloud Pipelines 分为如下三种类型：

- **Ingestion pipeline** 是处理非结构化数据的主力军，它将非结构化数据转换为可搜索的矢量嵌入，并将其输入 Zilliz 矢量数据库进行存储和检索。

- **Search pipelines** 可将查询字符串转换为向量嵌入，并将其发送到 Zilliz 云，以检索前 K 个最相似的向量，从而促进语义搜索。

- **Deletion Pipeline** 允许您从 Zilliz 云收藏中删除指定文档中的所有块，让您完全控制自己的数据，并释放 Zilliz 收藏的存储容量。

## 数据导入\{#data-import}

我们很高兴地宣布数据导入功能支持 Parquet 数据格式。为了增强用户体验，我们引入了 PyMilvus writer 实用程序，这是一款功能强大的工具，旨在帮助我们的用户轻松创建 JSON 或 Parquet 格式的文件，以实现无缝数据导入。在此深入了解详情并探索新的可能性。

要了解更多信息，请参阅[本文档](./data-import-zero-to-hero)。

## API 密钥\{#api-keys}

在此版本中，Zilliz Cloud 引入了 API Key 的统一设计。每个用户只需使用一个统一的 API 密钥，即可访问 Zilliz Cloud 平台和多个集群。

Zilliz Cloud 的权限设计遵循 RBAC（基于角色的访问控制）原则，分为两层：操作层和数据层。在操作层，角色管理集群、项目、用户和计费等资源的操作权限。在数据层，角色侧重于控制添加、删除、修改和查询数据的功能。

在操作层中，Zilliz Cloud 支持四种角色，其中组织所有者、项目所有者和项目成员是三种常用角色：

- 组织所有者：拥有组织的全部管理权限，包括组织设置、管理支付方式和计费、API 密钥、组织中的所有项目以及相关资源。

- 项目所有者：拥有项目的全部管理权限，包括项目设置、项目中的所有群集、API 密钥和其他相关资源。

- 项目成员：拥有对项目内所有群集的读写权限，可以查看群集详细信息，并管理集合和索引。

在数据层中，Zilliz Cloud 提供三种内置角色： 管理员、只读和读写，以控制数据的管理、写入和读取权限。Zilliz Cloud 允许用户创建自定义角色。这些自定义角色可定义特定集合、分区或操作的权限，确保在使用 Zilliz Cloud 时遵循最小数据权限原则。请[参阅文档](./manage-api-keys)了解详情。

## 指标和告警\{#metrics-and-alerts}

在此版本中，我们对指标和告警系统进行了重构。在新版本中，您可以监控一系列全面的指标：

- 资源使用指标： 这包括 CU（计算单元）计算资源利用率、CU 容量利用率（满载）和总体存储使用情况的详细视图。

- 性能指标： 跟踪关键性能指标，如搜索/查询吞吐量和延迟、数据插入效率（吞吐量和延迟）以及请求失败率。

- 数据指标： 深入了解集合数量、实体总数、用于搜索的加载实体数量以及索引实体数量。

此外，我们的增强型警报系统允许您为上述所有指标设置自定义警报规则。这意味着，您可以针对每秒查询率（QPS）超过 1000 或 CU 满载率超过 70% 等情况创建警报，确保您随时了解系统的健康状况和性能并采取主动行动。请[参阅文档](./metrics-and-alerts)了解详情。


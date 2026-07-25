---
title: "版本说明书（2024/04/18） | Cloud"
slug: /release-notes-270
sidebar_key: release-notes-270
sidebar_label: "2024/04/18"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "此次发布引入了诸多新工具和功能增加。主要包括：针对使用 Pipelines 从对象存储中采集数据的新 Connectors、提升搜索相关性的 Rerankers、针对系统静态分析的新指标监控 API、以及跨云数据导入功能。这些功能扩大了数据采集范围、提高了搜索精度和运维洞察能力，让云上向量数据度的管理更加便捷。 | Cloud"
type: origin
token: Y9hnwYoyIi9xgZkGG7Ycexl4nlb
sidebar_position: 20
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/04/18）

此次发布引入了诸多新工具和功能增加。主要包括：针对使用 Pipelines 从对象存储中采集数据的新 Connectors、提升搜索相关性的 Rerankers、针对系统静态分析的新指标监控 API、以及跨云数据导入功能。这些功能扩大了数据采集范围、提高了搜索精度和运维洞察能力，让云上向量数据度的管理更加便捷。

## Milvus 兼容性\{#milvus-compatibility}

此次发布兼容 Milvus 2.3.x。

## Connectors\{#connectors}

作为 Zilliz Cloud Pipelines 内建能力之一，Connectors 用于从包括对象存储、Kafka （即将发布）等多个数据源向 Zilliz Cloud 导入数据。以对象存储 Connector 为例，该 Connector 可以监控指定的对象存储桶，自动同步桶中的 PDF 或 HTML 文件到 Zilliz Cloud Ingestion Pipeline 中，简化了非结构化文件到向量表示的转化过程，从而能够更快地将其加载到 Zilliz Cloud 向量数据库中，实现对新增数据的检索。

## Rerankers\{#rerankers}

Zilliz Cloud Pipelines 已经集成了 Rerankers，为需要提升搜索结果相似性水平的用户提供了可选能力增强。

在此次发布中，我们提供如下 Reranker 选项：

- zilliz/bge-reranker-base

## 指标监控 API\{#query-metrics-api}

在此次发布的众多特性中，Zilliz Cloud 还提供了一个用于监控集群各项指标的 API，并提供了一个多达 30 余项内容的指标矩阵，方便您实现对系统性能及效率进行全方位的监控。[点此了解更多](/reference/restful/query-metrics)。

主要监控指标包括：

- 资源使用相关指标

    深入了解 Compute Unit (CU) 资源使用情况，可分别跟踪计算资源和存储资源的使用情况。

- 数据检索与插入性能相关指标

    了解数据检索和数据插入性能时延及流量相关数据，从而有针对性地提升相关操作性能。

- 请求失败率

    监控请求失败率，快速定位和解决可能存在的问题，保证上层应用和性能和稳定性。

- Collection 及 Entity 相关统计指标

    详细了解 Collection 和 Entity 相关统计，提升数据管理水平。

## 跨云数据导入和数据迁移\{#cross-cloud-data-import-and-migration}

Zilliz Cloud 用户可以方便的从他们的阿里云 OSS 或腾讯云 COS 向 Zilliz Cloud 上任何数据库导入数据了。详细情况，可参考[数据导入](./data-import)和[数据迁移](./migrations)。

## EOS 通告：经济型 CU 下线\{#end-of-service-announcement-cost-optimized-cu}

本次发布后，为了保证我们能够集中资源为您提供更好服务，经济型 CU 不再提供服务。


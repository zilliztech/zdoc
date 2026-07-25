---
title: "版本说明书（2024/05/30） | Cloud"
slug: /release-notes-280
sidebar_key: release-notes-280
sidebar_label: "2024/05/30"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本次发布，Zilliz Cloud 带来了全新的 Serverless 订阅方案。该方案无须特殊配置，支持平滑扩容，适用于查询量变化较大的各类应用场景。当前，该方案处于 Beta 阶段，您可以在 阿里云华东1（杭州） 区域创建一个限时免费的 Serverless 集群。另外，本次发布还对监控指标、检索精度控制及数据导入做了相应的增强。 | Cloud"
type: origin
token: Nj7Hw23HBiVgc6kpfehc6r6bnIg
sidebar_position: 19
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/05/30）

本次发布，Zilliz Cloud 带来了全新的 Serverless 订阅方案。该方案无须特殊配置，支持平滑扩容，适用于查询量变化较大的各类应用场景。当前，该方案处于 Beta 阶段，您可以在 **阿里云华东1（杭州）** 区域创建一个限时免费的 Serverless 集群。另外，本次发布还对监控指标、检索精度控制及数据导入做了相应的增强。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 Milvus v2.3.x。

## Serverless Beta\{#serverless-beta}

全新的 Serverless 订阅方案是为查询规模变化较大的应用量身打造的，无须特殊配置和调优即可使用。Serverless 集群还支持平滑扩容，可以满足您的多种负载需求，保障快速验证时的易用性。

Serverless 集群当前处于 Beta 阶段，您可以在 **阿里云华东1（杭州）** 区域创建一个限时免费的 Serverless 集群，无须添加任何支付方式。

关于更多详情，可参考 [Serverless 版本](./free-trials)的详细介绍。

## Pipelines\{#pipelines}

- 文本 Pipeline

    在以文档为操作对象的文档 Pipeline 基础之上，用户还可以创建用于摄取、检索和删除文本内容的 Pipeline 来处理诸如产品描述或文档分块等以字符串形式提供的文本内容。该功能为 RAG 和文本召回类应用提供了极大的灵活性。

- 图片 Pipeline

    此次发布新增的图片 Pipeline 解锁了图片检索能力，可以根据用户提供的图片 URL 生成图片的向量表示，为实现以图搜图类应用提供了便利。

- 此次发布后，Pipeline 功能支持利用既有 Collection 了。在调用创建 Pipeline 的 RESTful API 请求中，用户可以指定 Schema 与 Pipeline 业务逻辑相匹配的既有 Collection。也就是说，如果用户在发出的 Pipeline 创建请求中指定了一个 PRESREVE Function，用于在名为 **public_date** 的字段中存放相应的元数据，则目标 Collection 的 Schema 中也需要包含该字段。

## 其它增强\{#other-enhancements}

本次发布还增强了如下功能。

- 更多的[集群监控指标](./metrics-alerts-reference)。

- [检索精度控制参数](./autoindex-explained#about-the-level-parameter)。通过在召回率和检索性能间进行取舍，提供五级精度控制能力。

- 单 Collection 支持最多 10 个正在运行或待运行的导出任务。


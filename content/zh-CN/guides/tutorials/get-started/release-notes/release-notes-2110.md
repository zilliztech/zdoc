---
title: "版本说明书（2024/11/20） | Cloud"
slug: /release-notes-2110
sidebar_key: release-notes-2110
sidebar_label: "2024/11/20"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本次发布推出了全新界面，为您带来全新体验。另外，Zilliz Cloud 目前已支持从 Qdrant 和 腾讯云 VectoDB 搬迁数据，提供了更加丝滑的支付流程，并重新设计了帐单页面。 | Cloud"
type: origin
token: FLPuwOsvjiiui0kuvgec2hkonVb
sidebar_position: 15
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/11/20）

本次发布推出了全新界面，为您带来全新体验。另外，Zilliz Cloud 目前已支持从 Qdrant 和 腾讯云 VectoDB 搬迁数据，提供了更加丝滑的支付流程，并重新设计了帐单页面。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.4.x**。

## 全新用户界面，带来全新体验\{#new-graphic-user-interface}

在本次发布中，Zilliz Cloud 推出了一套全新升级的用户界面。在保持您熟悉的操作流程的同时，新的用户界面将会极大的提升您的交互和视觉体验。

您可移步 [Zilliz Cloud](https://cloud.zilliz.com.cn) 并登录您的账户进行体验。

## 扩大迁移来源，增强数据迁移能力\{#enhanced-migration-capabilities}

在本次发布中，Zilliz Cloud 升级了数据迁移功能，带来了更多的数据源支持，包括：

- Qdrant

- 腾讯云 VectorDB

通过这些增强，您可以轻易地将您存储在其它厂商的数据快速迁移到 Zilliz Cloud，从而利用 Zilliz Cloud 独有的功能和能力。关于具体的迁移流程，可以参考 [从 Qdrant 迁移至 Zilliz Cloud](./migrate-from-qdrant)和 [从腾讯云 VectorDB 迁移至 Zilliz Cloud](./migrate-from-tencent-cloud-vectordb)。

## 支付流程升级，全新账单带来更多信息\{#payment-procedure-updates}

在本次发布中，Zilliz Cloud 重新设计了支持流程和账单页面，为您提供更加清晰的账单信息，方便您管理您在 Zilliz Cloud 上的花费。主要更新包括：

- 在账单即将过期时及时提醒您支付费用。

- 支持账期展期，将我们的支持条款与客户的企业财务流程对齐，保障客户服务不间断。

- 账单中明细清单更加具体，并提供下载能力。

## 其它增强\{#other-enhancements}

我们优化了 Replica 配置流程。在本次发布后，用户可以在不 Release Collection 的情况下调整 Replica 数量。
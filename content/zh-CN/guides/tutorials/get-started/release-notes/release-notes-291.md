---
title: "版本说明书（2024/07/30） | Cloud"
slug: /release-notes-291
sidebar_key: release-notes-291
sidebar_label: "2024/07/30"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在本次更新中，Zilliz Cloud 开始支持 Milvus 的 RESTful API v2，提供了与开源版本一致的用户接口和扩展能力。新的文档聊天机器人也为能够更好地支持用户获取需要的信息。本次发布还引入了任务中心，可以为用户提供了一个直观的界面，用于管理和跟踪备份、还原、迁移、导入和 Collection 复制等任务的进度和状态。Dedicated 集群的自动缩放功能也开始提供私有预览，可根据设置的 CU 大小阈值动态调整集群可使用的资源。其他增强功能包括更多的集群监控指标、进一步优化的集群管理界面和用户电子邮件模板。 | Cloud"
type: origin
token: MgXbwjdzeiJRpnkF562cE6cVnCf
sidebar_position: 17
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2024/07/30）

在本次更新中，Zilliz Cloud 开始支持 Milvus 的 RESTful API v2，提供了与开源版本一致的用户接口和扩展能力。新的文档聊天机器人也为能够更好地支持用户获取需要的信息。本次发布还引入了任务中心，可以为用户提供了一个直观的界面，用于管理和跟踪备份、还原、迁移、导入和 Collection 复制等任务的进度和状态。Dedicated 集群的自动缩放功能也开始提供私有预览，可根据设置的 CU 大小阈值动态调整集群可使用的资源。其他增强功能包括更多的集群监控指标、进一步优化的集群管理界面和用户电子邮件模板。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.3.x**。

如果您选择将您的集群升级到 BETA，可以试用 **Milvus 2.4.x** 的相关功能。

### RESTful API v2\{#restful-api-v2}

在最近的 Milvus 2.4 更新中，推出了 RESTful API v2。随着本次发布，Zilliz Cloud 也开始支持这些 API 接口，并提供了一套与之匹配的控制面接口。

与 RESTful API v1 相比，新的 v2 在 接口风格上更加一致，涵盖的功能范围也更广。 这些功能包括数据面上的向量操作、Collection 管理、Index 管理、Partition 管理、Role 和 User 管理以及 Alias 相关操作。在控制面上，API 接口涵盖了数据导入和集群管理。更多详情，请参阅 RESTful v2 [控制面 API](/reference/restful/control-plane-v2) 和[数据面 API](/reference/restful/data-plane-v2)。

### 文档聊天机器人\{#chatbot}

Zilliz Cloud 现在推出了文档聊天机器人。与传统的搜索栏相比，文档聊天机器人提供了更灵活、更强大的用户支持能力。该聊天机器人可让用户轻松查找信息并获得与用户关心的问题相关的帮助。您可以点击 Zilliz Cloud 文档页面右下角的图标访问聊天机器人。

### 任务中心\{#job-center}

Zilliz Cloud 现在提供了一个直观的任务管理页面，集中展示当前项目中的所有历史和异步数据任务。通过这个的界面，您可以轻松跟踪如下类型的任务并了解这些任务的进度和状态：

- 备份

- 恢复

- 迁移

- 导入

- 复制 Collection

更多详情，可查看[查看事件](./view-activities)了解更多。

### 【私有预览】Dedicated 集群自动扩容\{#auto-scaling-for-dedicated-clusters-private-preview}

Zilliz Cloud 引入了自动缩放功能，该功能可根据需求动态调整集群使用的 CU 大小。自动缩放主要由 CU（计算单元）大小阈值触发。Zilliz Cloud 监控集群的 CU 使用情况，如果连续两分钟超过 70%（默认阈值），系统就会自动启动扩容过程。用户可设置自动扩容的最大 CU 大小。目前，Zilliz Cloud 不支持向下自动缩放。

自动扩容目前处于私有预览阶段，仅适用于 Dedicated（企业版）群集。要启用此功能，请联系我们。有关用法，请参阅[管理和设置集群](./manage-cluster)。

### Pipelines\{#pipelines}

- Pipeline 现在支持使用新的 **SEARCH_IMAGE_BY_TEXT** 函数通过文本搜索图像。该函数允许用户通过输入文本查询从数据库中检索相关图像数据。搜索功能支持多种语言，并利用 **CLIP vit base patch32** 多模态模型进行文本和图像编码。

- 用户现在可以使用 RESTful API 和控制台在 Pipeline 详细信息中获取相关使用信息。这一增强功能有助于用户全面了解 Pipeline 的使用情况，以便更好地对相关资源进行监控和分析。

- 增加了每个项目中每种 Pipeline 的最大数量限制。用户现在最多可以在单个项目中创建 100 个各种类型的 Pipeline。这一限制之前的最高上限是 10。这一变化使项目内的 Pipeline 管理更具灵活性和可扩展性。

### 功能增强\{#enhancements}

此次发布还包括一系列功能增强，包括：

- 更多的用于[集群监控的指标](./metrics-alerts-reference)。

- 重构集群管理页面，包括集群修改、迁移和备份。

- 改进用户电子邮件模板。
---
title: "版本说明书（2025/04/24） | Cloud"
slug: /release-notes-2150
sidebar_key: release-notes-2150
sidebar_label: "2025/04/24"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "我们很高兴地宣布，Zilliz Cloud 内测版现已推出在线迁移！无论您需要升级集群还是更改部署配置，例如从容量型 CU 切换到其它类型，您都可以轻松迁移数据，而不会中断任何服务。 | Cloud"
type: origin
token: S53KwdOb8i9D3xkawDXcJnDGnZe
sidebar_position: 11
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2025/04/24）

我们很高兴地宣布，Zilliz Cloud 内测版现已推出在线迁移！无论您需要升级集群还是更改部署配置，例如从容量型 CU 切换到其它类型，您都可以轻松迁移数据，而不会中断任何服务。

## Milvus 兼容性\{#milvus-compatibility}

本次发布后创建的所有集群均兼容 **Milvus v2.5.x**。同时，所有 Milvus v2.5.x 相关特性在 Zilliz Cloud 上均已全面可用。

## 无缝数据迁移，最小化服务中断\{#seamless-data-migration-with-minimal-service-interruption}

在之前的版本中，在集群之间迁移数据需要精心计划停机时间，这对于具有严格可用性要求的企业来说是一个不可逾越的障碍。通过支持在线迁移功能，Zilliz Cloud 现在消除了这种复杂性，提供了无缝、完全托管的迁移体验。

此功能采用了两个组件相结合的双堆栈策略。这两个工具分别是备份工具和 Change Data Capture（CDC）。备份工具用于捕获源集群的快照，而 CDC 则持续跟踪并实时复制对目标集群的新写入数据。

Zilliz Cloud 的原生迁移流程确保：

- 跨历史数据和实时更新的一致性，

- 正确的事件排序和强大的容错能力，

- 防止写入冲突、竞争条件和架构不匹配，以及

- 在整个迁移过程中，源集群和目标集群之间的状态平滑转换。

在线迁移现在可在 Zilliz Cloud 控制台的内测版中使用。现在登录，以开始您的第一次零停机迁移。

## 其它增强\{#other-enhancements}

新增了一个 RESTful API 接口，用于修改集群的副本数量。有关详细信息，请参阅[修改集群副本数量](/reference/restful/modify-cluster-replica-v2)。
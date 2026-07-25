---
title: "版本说明书（2023/09/19） | Cloud"
slug: /release-notes-220
sidebar_key: release-notes-220
sidebar_label: "2023/09/19"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "我们很高兴地宣布Zilliz Cloud 2.2.0的发布。此版本引入了一系列增强和功能，包括集群间数据迁移、从 ElasticSearch 迁移数据，全新的问题单系统和数据导入能力的全面增强。 | Cloud"
type: origin
token: P1JAwZEf4i1ALqkidS9cYfLZnef
sidebar_position: 25
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 版本说明书

---

import Admonition from '@theme/Admonition';


# 版本说明书（2023/09/19）

我们很高兴地宣布Zilliz Cloud 2.2.0的发布。此版本引入了一系列增强和功能，包括集群间数据迁移、从 ElasticSearch 迁移数据，全新的问题单系统和数据导入能力的全面增强。

## 概述\{#overview}

此次发布引入了新的提单系统，您可以通过该系统方便地提交您的疑问和需要咨询的问题。另外，我们更新了数据导入和迁移工具，实现了 Zilliz Cloud 集群间的无缝转换，并改进了对一次性导入多个文件的支持。我们诚邀您探索这些工具和新特性，亲身体验它们的优势。

## Milvus 兼容性\{#milvus}

此次发布兼容 **Milvus 2.2.x**。

## Zilliz Cloud 集群间的数据迁移\{#data-migration-across-zilliz-cloud-clusters}

此次发布，用户可以通过 Zilliz Cloud 的数据迁移能力，轻松完成集群间的数据整合与配置。具体内容，可[查阅此处](./offline-migration)。

- 轻松迁移：在多个 Zilliz Cloud 集群间实现数据的无缝迁移。

- 安全增强：迁移过程中的数据安全得到加强，保障数据的完整性与私密性。

- 实时监控：直观的用户界面，方便您监控迁移进度并实时接收状态更新。

## 从 ElasticSearch 到 Zilliz Cloud 的数据迁移\{#easy-migration-from-elasticsearch-to-zilliz-cloud}

从 ElasticSearch 迁移到 Zilliz Cloud 从未如此简单。我们精心设计了一条路径，并辅以全面的文档和内置工具，确保您能顺利切换，并在迁移后获得一致的数据。具体内容，可[查阅此处](./migrate-from-elasticsearch)。

## 提单系统全新上线\{#new-ticket-system-go-live}

全新的提单系统为您提供了直达 Zilliz Cloud 业务支撑团队的专线。无论您需要提交反馈，报告问题，寻求支持。我们的系统都设计得高效、清晰。[点击此处，立即体验我们的提单系统](https://support.zilliz.com.cn/hc/zh-cn)。

## 数据导入能力增强\{#enhanced-data-import-capabilities}

我们重新设计了您向 Zilliz Cloud 导入数据的方式。具体内容，可[查阅此处](./data-import)。

- 导入目录

    摆脱以往单一文件模式的束缚。您现在可以使用整个文件夹的文件导入数据，从而简化批量数据导入。

- 导入任务监控

    通过 Zilliz Cloud 控制台实时查看您的数据导入任务，保障您对整个数据上传过程的掌控能力。


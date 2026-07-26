---
title: "通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud | Cloud"
slug: /via-endpoint
sidebar_label: "通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供基于 Milvus 的完全托管的向量数据库解决方案，适合希望使用 Milvus 向量数据库但不想自己管理基础设施的用户。本文介绍如何通过服务器地址从 Milvus 进行数据迁移。 | Cloud"
type: origin
token: PtmRwn9bQi6WAKkurfXcEXKKn9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud

Zilliz Cloud 提供基于 Milvus 的完全托管的向量数据库解决方案，适合希望使用 Milvus 向量数据库但不想自己管理基础设施的用户。本文介绍如何通过服务器地址从 Milvus 进行数据迁移。

## 开始前\{#before-you-start}

开始离线迁移前需满足：

### Milvus 侧要求\{#milvus-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 版本要求 | Milvus 2.3.6 及以上 |
| 网络连通性 | 源 Milvus 实例必须能够从公网访问 |
| 鉴权凭证 | 如果 Milvus 开启了鉴权，需提供鉴权凭据（请参阅 [Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access)） |

### Zilliz Cloud 侧要求\{#zilliz-cloud-requirements}

| 要求项 | 详细说明 |
| --- | --- |
| 用户权限 | 需具备组织管理员或项目管理员角色 |
| 目标集群容量 | 需预留足够 CU 容纳源数据（使用 [CU 计算器](https://zilliz.com.cn/pricing#calculator)预估容量） |
| 网络连通性 | 如果有网络限制，请确保已将 [Zilliz Cloud IP](./zilliz-cloud-ips) 加入白名单 |

## 操作步骤\{#getting-started}

以下展示了如何通过 Endpoint 从 Milvus 迁移。

<Supademo id="cmbohkjeya419sn1ritu7745e" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

<Admonition type="info" icon="📘" title="说明">

- 如果源 Collection 已启用 Full Text Search 功能，Zilliz Cloud 会在迁移后保留目标 Collection 的 Function 设置。这些继承的设置无法修改。

- 你也可以在迁移过程中为其他 VARCHAR 字段启用 Full Text Search。详情请参阅 [Full Text Search](./full-text-search)。

</Admonition>

## 查看迁移进度\{#monitor-the-migration-process}

生成迁移任务后，您可前往[任务中心](./view-activities)查看任务状态和进度。如果迁移任务的状态从**进行中**变更为**成功**，则代表迁移成功。

![FJJubvyTcohYZXx6K0JcDs6Vnad](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/fjjubvytcohyzxx6k0jcds6vnad.png "FJJubvyTcohYZXx6K0JcDs6Vnad")

## 迁移后\{#post-migration}

迁移任务完成后，请注意以下事项：

- **索引创建**：迁移过程中会自动为迁移的 Collection 创建 AUTOINDEX。

- **手动 Load Collection**：虽然索引已自动创建，但迁移后的 Collection 并不会立即支持搜索或查询操作。您必须手动 Load Collection，才能启用搜索和查询功能。详细信息请参阅 [Load 和 Release](./load-release-collections)。

<Admonition type="info" icon="📘" title="说明">

完成 Load 后，请检查目标集群中的 Collection 数量及 Entity 数是否与数据源保持一致。如果发现不符，请删除 Collection 并重新进行迁移任务。

</Admonition>

## 取消迁移任务\{#cancel-migration-job}

如果迁移过程遇到任何问题，您可以采取以下步骤进行故障排除并恢复迁移：

<Procedures>

1. 在**任务中心**页面，取消失败的迁移任务。

1. 在**操作**列点击**查看详情**以访问日志信息。

</Procedures>
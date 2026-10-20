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

通过 Endpoint 从 Milvus 迁移至 Zilliz Cloud 前，请确认满足以下要求：

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

<Admonition type="info" title="说明">

- 如果源 Collection 已启用 Full Text Search 功能，Zilliz Cloud 会在迁移后保留目标 Collection 的 Function 设置。这些继承的设置无法修改。

- 你也可以在迁移过程中为其他 VARCHAR 字段启用 Full Text Search。详情请参阅 [Full Text Search](./full-text-search)。

</Admonition>

### 索引设置\{#index-settings}

在最终确认步骤中，使用**索引设置**选择本次迁移任务如何为目标 Collection 创建索引。

- **迁移后创建索引**默认开启。保持开启时，迁移任务会按照现有迁移规则自动创建索引。

- 关闭该开关可跳过索引创建，稍后再手动创建，例如安排在维护窗口内创建。

<Admonition type="info" title="Note">

关闭迁移后创建索引后，迁移任务不会创建向量索引或标量索引。迁移后的 Collection 保持未加载状态。您需要手动创建索引并加载 Collection，才能执行搜索或查询。

</Admonition>

提交迁移任务前，请核对确认信息中的索引设置。

## 查看迁移进度\{#monitor-the-migration-process}

生成迁移任务后，您可前往[任务中心](./view-activities)查看任务状态和进度。如果迁移任务的状态从**进行中**变更为**成功**，则代表迁移成功。

如果跳过了索引创建，迁移成功后，任务详情中会显示**已跳过索引创建**。请按照[迁移后](./via-endpoint#post-migration)的步骤创建索引并加载 Collection。

![FJJubvyTcohYZXx6K0JcDs6Vnad](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/fjjubvytcohyzxx6k0jcds6vnad.png "FJJubvyTcohYZXx6K0JcDs6Vnad")

## 迁移后\{#post-migration}

迁移任务成功完成后，请先完成以下操作，再对目标 Collection 执行搜索或查询：

- <strong>开启自动索引创建：</strong>迁移任务会按照现有的 Milvus 迁移规则创建 [AUTOINDEX](./autoindex-explained)。请在任务详情中确认索引已创建成功。

- <strong>跳过索引创建：</strong>迁移任务不会创建向量索引或标量索引。请手动为所有向量字段创建索引，并根据业务需要为标量字段创建索引。REST API 示例参见 [Create Index (V2)](/reference/restful/create-index-v2)。

- <strong>手动加载 Collection：</strong>索引创建完成后，手动加载各个 Collection，并等待加载完成后再执行搜索或查询。无论索引是自动创建还是手动创建，都需要完成此步骤。详情参见 [Load 和 Release](./load-release-collections)。

<Admonition type="info" title="说明">

加载完成后，请检查目标集群中的 Collection 数量及 Entity 数量是否与数据源一致。如果发现不符，请删除缺少 Entity 的 Collection，并重新迁移。

</Admonition>

## 取消迁移任务\{#cancel-migration-job}

如果迁移过程遇到任何问题，您可以采取以下步骤进行故障排除并恢复迁移：

<Procedures>

1. 在**任务中心**页面，取消失败的迁移任务。

1. 在**操作**列点击**查看详情**以访问日志信息。

</Procedures>
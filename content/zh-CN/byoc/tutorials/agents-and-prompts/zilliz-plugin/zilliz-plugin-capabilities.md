---
title: "核心能力 | BYOC"
slug: /zilliz-plugin-capabilities
sidebar_label: "核心能力"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Plugin 提供多个领域的能力，可使用自然语言管理 Zilliz Cloud 资源。本指南介绍与管理集群、Collection 以及向量操作相关的主要功能。 | BYOC"
type: origin
token: MT6DwKQ7fivrFpkUvZQc8nKNnth
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 核心能力

Zilliz Plugin 提供多个领域的能力，可使用自然语言管理 Zilliz Cloud 资源。本指南介绍与管理集群、Collection 以及向量操作相关的主要功能。

## 集群管理\{#}

**你可以执行的操作：**

- 创建 serverless 或 dedicated clusters

- 暂停和恢复集群

- 删除集群

- 修改集群配置

- 列出和查看集群详情

**自然语言示例：**

- "在 us-west-2 创建一个 serverless cluster"

- "暂停我的 development cluster"

- "显示我的所有 clusters"

- "恢复 production cluster"

**等效 CLI：**

```bash
zilliz cluster create --name my-cluster --type serverless --region us-west-2
zilliz cluster suspend --cluster-id <id>
zilliz cluster list
zilliz cluster resume --cluster-id <id>
```

## Collection 管理\{#collection}

**你可以执行的操作：**

- 使用自定义 schema 创建 collection

- 加载和释放 collection

- 重命名和删除 collection

- 获取 collection 统计信息

**自然语言示例：**

- "创建一个名为 products、包含 768 维向量的 collection"

- "加载 user_embeddings collection"

- "显示我的 collections 的统计信息"

**等效 CLI：**

```bash
zilliz collection create --name products --dimension 768
zilliz collection load --name user_embeddings
zilliz collection getstats --name products
```

## 向量操作\{#}

**你可以执行的操作：**

- 插入向量

- 搜索相似向量

- 使用过滤条件查询

- 删除向量

- Upsert（插入或更新）

**自然语言示例：**

- "在 products collection 中搜索 10 个相似项"

- "将这些 vectors 插入我的 collection"

- "查询 age > 25 的 users"

- "删除 id 在 [1,2,3] 中的 vectors"

**等效 CLI：**

```bash
zilliz vector search --collection products --limit 10
zilliz vector query --collection users --filter "age > 25"
zilliz vector delete --collection products --ids 1,2,3
```

如需了解更多能力，请阅读 [Zilliz CLI reference](/reference/cli/cli/overview) 文档。
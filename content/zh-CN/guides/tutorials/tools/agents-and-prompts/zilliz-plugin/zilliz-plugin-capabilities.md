---
title: "Zilliz Claude Code 插件能力 | Cloud"
slug: /zilliz-plugin-capabilities
sidebar_label: "核心能力"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz 插件可通过自然语言在多个方面管理 Zilliz Cloud 资源。在本指南中，你将了解与管理集群、集合以及向量操作相关的主要功能。 | Cloud"
type: origin
token: A6q4wqxGViorDmkD5iKcoDBOnRh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code 插件能力

Zilliz 插件可通过自然语言在多个方面管理 Zilliz Cloud 资源。在本指南中，你将了解与管理集群、集合以及向量操作相关的主要功能。

## 集群管理\{#cluster-management}

**你可以执行的操作：**

- 创建无服务器或专用集群

- 暂停和恢复集群

- 删除集群

- 修改集群配置

- 列出并查看集群详情

**自然语言示例：**

- “在 us-west-2 创建一个无服务器集群”

- “暂停我的开发集群”

- “显示我所有的集群”

- “恢复生产集群”

**对应的 CLI：**

```bash
zilliz cluster create --name my-cluster --type serverless --region us-west-2
zilliz cluster suspend --cluster-id <id>
zilliz cluster list
zilliz cluster resume --cluster-id <id>
```

## 集合管理\{#collection-management}

**你可以执行的操作：**

- 使用自定义 Schema 创建集合

- 加载和释放集合

- 重命名和删除集合

- 获取集合统计信息

**自然语言示例：**

- “创建一个名为 products 的集合，向量维度为 768”

- “加载 user_embeddings 集合”

- “显示我的集合统计信息”

**对应的 CLI：**

```bash
zilliz collection create --name products --dimension 768
zilliz collection load --name user_embeddings
zilliz collection getstats --name products
```

## 向量操作\{#vector-operations}

**你可以执行的操作：**

- 插入向量

- 搜索相似向量

- 使用过滤条件查询

- 删除向量

- Upsert（插入或更新）

**自然语言示例：**

- “在 products 集合中搜索 10 个相似项”

- “将这些向量插入到我的集合中”

- “查询 age > 25 的 users”

- “删除 id 在 [1,2,3] 中的向量”

**对应的 CLI：**

```bash
zilliz vector search --collection products --limit 10
zilliz vector query --collection users --filter "age > 25"
zilliz vector delete --collection products --ids 1,2,3
```

如需了解更多能力，你可以阅读 [Zilliz CLI 参考](/reference/cli/cli/overview) 文档。

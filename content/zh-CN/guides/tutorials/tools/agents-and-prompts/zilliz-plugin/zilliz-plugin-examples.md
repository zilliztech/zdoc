---
title: "Zilliz Claude Code 插件示例 | Cloud"
slug: /zilliz-plugin-examples
sidebar_label: "更多示例"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在本指南中，您将找到更多示例，这些示例展示了如何使用自然语言来预配基础设施、执行数据操作、在集群间备份和恢复数据，以及为了集群安全而实施访问控制。 | Cloud"
type: origin
token: JiHgw9rQsibSugklTvBcpS1unGe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code 插件示例

在本指南中，您将找到更多示例，这些示例展示了如何使用自然语言来预配基础设施、执行数据操作、在集群间备份和恢复数据，以及为了集群安全而实施访问控制。

## 示例 1：基础设施预配\{#example-1-infrastructure-provisioning}

**场景**：设置一个新的 Zilliz Cloud 环境

```plaintext
你：“在 us-east-1 中创建一个名为 dev-cluster 的 serverless 集群”
插件：创建该集群

你：“创建一个名为 my_app 的数据库”
插件：创建数据库

你：“创建一个名为 products 的 collection，包含 768 维向量以及字段：id、name、price”
插件：使用 schema 创建 collection
```

## 示例 2：数据操作工作流\{#example-2-data-operations-workflow}

**场景**：插入数据并执行搜索

```plaintext
你：“从我的 CSV 文件中插入 100 个 product 向量”
插件：处理批量插入

你：“在 products collection 上创建 IVF_FLAT 索引”
插件：创建索引

你：“搜索与向量 [0.1, 0.2, ...] 相似的 5 个 product”
插件：执行向量搜索并返回结果
```

## 示例 3：备份与恢复\{#example-3-backup-and-restore}

**场景**：设置自动备份

```plaintext
你：“为我的生产集群创建一个备份策略，要求每日备份并保留 7 天”
插件：配置备份策略

你：“立即创建 users collection 的备份”
插件：启动手动备份

你：“从昨天的备份中恢复 users collection”
插件：从备份中恢复
```

## 示例 4：访问控制\{#example-4-access-control}

**场景**：为团队成员设置 RBAC

```plaintext
你：“创建一个名为 analyst 的角色，使其对 analytics collection 拥有只读访问权限”
插件：创建带有权限的角色

你：“创建用户 alice@company.com 并分配 analyst 角色”
插件：创建用户并分配角色
```

如需更多示例，您可以查阅 [Zilliz CLI 参考](/reference/cli/cli/overview) 文档。

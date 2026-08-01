---
title: "更多示例 | Cloud"
slug: /zilliz-plugin-examples
sidebar_label: "更多示例"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本指南提供更多示例，展示如何使用自然语言预置基础设施、执行数据操作、跨集群备份和恢复数据，以及为了集群安全实现访问控制。 | Cloud"
type: origin
token: Sn1fwkHRSifp4ukJ5bCcDIz8nng
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 更多示例

本指南提供更多示例，展示如何使用自然语言预置基础设施、执行数据操作、跨集群备份和恢复数据，以及为了集群安全实现访问控制。

## 示例 1：基础设施预置\{#1}

**场景**：设置新的 Zilliz Cloud 环境

```plaintext
You: "在 us-east-1 创建一个名为 dev-cluster 的 serverless cluster"
Plugin: 创建集群

You: "创建一个名为 my_app 的 database"
Plugin: 创建数据库

You: "创建一个名为 products 的 collection，包含 768 维向量以及字段：id、name、price"
Plugin: 使用 schema 创建 collection
```

## 示例 2：数据操作工作流\{#2}

**场景**：插入数据并执行搜索

```plaintext
You: "从我的 CSV 文件插入 100 个 product vectors"
Plugin: 处理批量插入

You: "在 products collection 上创建 IVF_FLAT index"
Plugin: 创建索引

You: "搜索与向量 [0.1, 0.2, ...] 相似的 5 个 products"
Plugin: 执行向量搜索并返回结果
```

## 示例 3：备份和恢复\{#3}

**场景**：设置自动备份

```plaintext
You: "为我的 production cluster 创建一个备份策略，每日备份并保留 7 天"
Plugin: 配置备份策略

You: "立即为 users collection 创建备份"
Plugin: 发起手动备份

You: "从昨天的备份恢复 users collection"
Plugin: 从备份恢复
```

## 示例 4：访问控制\{#4}

**场景**：为团队成员设置 RBAC

```plaintext
You: "创建一个名为 analyst 的 role，对 analytics collection 只有只读访问权限"
Plugin: 创建带有权限的 role

You: "创建用户 alice@company.com 并分配 analyst role"
Plugin: 创建用户并分配 role
```

如需更多示例，请阅读 [Zilliz CLI reference](/reference/cli/cli/overview) 文档。
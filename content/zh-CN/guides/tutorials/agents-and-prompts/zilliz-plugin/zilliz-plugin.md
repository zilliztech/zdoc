---
title: "Claude Code 插件 | Cloud"
slug: /zilliz-plugin
sidebar_label: "Claude Code 插件"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "面向 Claude Code 的 Zilliz Cloud 插件是一个自然语言接口，可将 Zilliz Cloud 操作直接带入你的 IDE。无需记忆 CLI 命令或切换到 Web 控制台，只需用日常语言描述你想要的操作，插件会负责处理。 | Cloud"
type: origin
token: WbDJwRVmri9N37kMi47cXR4CnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Claude Code 插件

面向 Claude Code 的 Zilliz Cloud 插件是一个自然语言接口，可将 Zilliz Cloud 操作直接带入你的 IDE。无需记忆 CLI 命令或切换到 Web 控制台，只需用日常语言描述你想要的操作，插件会负责处理。

## 什么是 Zilliz Plugin？\{#zilliz-plugin}

Zilliz Plugin 是一个 Claude Code 插件，它用自然语言能力封装 Zilliz CLI，使你能够通过对话式命令管理 Zilliz Cloud 资源。

## 主要特性\{#}

### 14 个能力领域\{#14}

- **Clusters**：创建、删除、暂停、恢复、修改集群

- **Collections**：使用自定义 schema 创建、加载、释放、重命名、删除

- **Vectors**：搜索、查询、插入、upsert、删除向量

- **Indexes**：创建、列出、查看详情、删除索引

- **Databases**：创建、列出、查看详情、删除数据库

- **Users & Roles**：RBAC 设置、权限管理

- **Backups**：创建、恢复、导出、策略管理

- **Import**：从云存储批量导入数据

- **Partitions**：创建、加载、释放和管理 partition

- **Monitoring**：集群状态、Collection 统计信息

- **Billing**：账单管理

- **Jobs**：作业管理

- **Project/Region**：Project 和 Region 设置

- **Setup**：初始配置和快速入门

### 自然语言接口\{#}

```plaintext
You: "在 us-east-1 创建一个名为 my-vectors 的 serverless cluster"
Plugin: 使用合适的配置创建集群

You: "在我的 product collection 中使用过滤条件 age > 20 搜索相似项"
Plugin: 使用过滤条件执行向量搜索
```

## 前提条件\{#}

- Python 3.10 或更高版本

- Zilliz Cloud 账号

- Claude Code IDE

## 快速示例\{#}

安装后，运行快速入门：

```plaintext
/zilliz:quickstart
```

它会引导你完成：

1. CLI 安装

1. 身份验证设置

1. 集群连接

1. 首次操作

## 后续步骤\{#}

import DocCardList from '@theme/DocCardList';

<DocCardList />
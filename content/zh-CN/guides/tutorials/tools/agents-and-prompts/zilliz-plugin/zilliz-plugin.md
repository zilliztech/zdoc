---
title: "Zilliz Claude Code 插件 | Cloud"
slug: /zilliz-plugin
sidebar_label: "Claude Code 插件"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "适用于 Claude Code 的 Zilliz Cloud 插件是一个自然语言界面，可将 Zilliz Cloud 操作直接带入你的 IDE。你无需记忆 CLI 命令或切换到 Web 控制台，只需用自然语言描述你的需求，插件就会为你处理。 | Cloud"
type: origin
token: LFepwAKeGiURJUksNA4cqYPYnIb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code 插件

适用于 Claude Code 的 Zilliz Cloud 插件是一个自然语言界面，可将 Zilliz Cloud 操作直接带入你的 IDE。你无需记忆 CLI 命令或切换到 Web 控制台，只需用自然语言描述你的需求，插件就会为你处理。

## 什么是 Zilliz 插件？\{#what-is-the-zilliz-plugin}

这是一个为 Zilliz CLI 封装了自然语言能力的 Claude Code 插件，使你能够通过对话式命令管理 Zilliz Cloud 资源。

## 关键特性\{#key-features}

### 14 个能力领域\{#14-capability-areas}

- **集群**：创建、删除、暂停、恢复、修改集群

- **集合**：使用自定义 schema 创建、加载、释放、重命名、删除

- **向量**：搜索、查询、插入、upsert、删除向量

- **索引**：创建、列出、描述、删除索引

- **数据库**：创建、列出、描述、删除数据库

- **用户与角色**：RBAC 设置、权限管理

- **备份**：创建、恢复、导出、策略管理

- **导入**：从云存储批量导入数据

- **分区**：创建、加载、释放和管理分区

- **监控**：集群状态、集合统计信息

- **计费**：计费管理

- **作业**：作业管理

- **项目/区域**：项目和区域设置

- **设置**：初始配置与快速开始

### 自然语言界面\{#natural-language-interface}

```plaintext
你：“在 us-east-1 创建一个名为 my-vectors 的 serverless 集群”
插件：使用适当的配置创建集群

你：“在我的产品集合中搜索相似项，并使用筛选条件 age > 20”
插件：执行带筛选条件的向量搜索
```

## 前置条件\{#prerequisites}

- Python 3.10 或更高版本

- Zilliz Cloud 账号

- Claude Code IDE

## 快速示例\{#quick-example}

安装完成后，运行快速开始：

```plaintext
/zilliz:quickstart
```

这将引导你完成：

1. CLI 安装

1. 身份验证设置

1. 集群连接

1. 首次操作

## 后续步骤\{#next-steps}



import DocCardList from '@theme/DocCardList';

<DocCardList />

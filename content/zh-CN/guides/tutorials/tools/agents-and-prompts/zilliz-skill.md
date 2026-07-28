---
title: "Zilliz Skill | Cloud"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills 是适用于 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。| Cloud"
type: origin
token: EXj3wKsw8ijsqJk8uYPcmfXWn3g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills 是适用于 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。

## 什么是 Zilliz Skills？\{#what-are-zilliz-skills}

Skills 是用于扩展 Claude Code 功能的模块化能力。[Zilliz Skills 仓库](https://github.com/zilliztech/zilliz-skill)包含适用于常见 Zilliz Cloud 操作的预构建技能。

## 设置\{#setup}

运行以下命令安装 Zilliz skill。请确保你已安装 Node.js。

```bash
npx skills add zilliztech/zilliz-skill
```

此命令将引导你选择目标工具并确定安装范围。

## 可用 Skills\{#available-skills}

| 领域 | 你可以执行的操作 |
| --- | --- |
| 集群 | 创建、删除、挂起、恢复、修改 |
| 集合 | 使用自定义 schema 创建、加载、释放、重命名、删除 |
| 向量 | 搜索、查询、插入、upsert、删除、混合搜索 |
| 索引 | 创建（AUTOINDEX）、列出、描述、删除 |
| 数据库 | 创建、列出、描述、删除 |
| 用户与角色 | RBAC 设置、权限管理 |
| 备份 | 创建、恢复、导出、策略管理 |
| 导入 | 从 S3/GCS/Azure Blob Storage 批量导入数据 |
| 分区 | 创建、加载、释放、管理 |
| 监控 | 集群状态、集合统计信息、加载状态 |
| 项目 | 项目和区域管理 |
| 账单 | 用量查询、发票 |

## 如何使用\{#how-to-use}

可通过适当的自然语言提示词调用 Skills，如下所示：

```plaintext
"在 us-east-1 创建一个 serverless 集群，并设置一个包含 768 维向量的集合"
"在我的产品集合中搜索相似项，并使用过滤条件 age > 20"
"显示我所有集群和集合的状态"
"为我的生产集群设置每日备份策略，并保留 7 天"
"创建一个对 analytics 集合具有只读访问权限的角色"
```

## 后续步骤\{#next-steps}

- [Zilliz Plugin](./zilliz-plugin)

- [GitHub 仓库](https://github.com/zilliztech/zilliz-skill)


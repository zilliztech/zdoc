---
title: "Zilliz Skill | Cloud"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。 | Cloud"
type: origin
token: ZoE3wx0LKiYLtrklb5Jc2gc8nD5
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。

## 什么是 Zilliz Skills？\{#what-are-zilliz-skills}

Skills 是扩展 Claude Code 功能的模块化能力。[Zilliz Skills repository](https://github.com/zilliztech/zilliz-skill) 包含面向常见 Zilliz Cloud 操作的预构建技能。

## 安装\{#setup}

运行以下命令安装 Zilliz skill。请确保已安装 Node.js。

```bash
npx skills add zilliztech/zilliz-skill
```

该命令会引导你选择目标工具并确定安装范围。

## 可用 Skills\{#available-skills}

| 领域 | 可执行操作 |
| --- | --- |
| 集群 | 创建、删除、暂停、恢复、修改 |
| Collection | 使用自定义 Schema 创建、加载、释放、重命名、删除 |
| 向量 | 搜索、查询、插入、更新插入、删除、混合搜索 |
| 索引 | 创建（AUTOINDEX）、列出、查看详情、删除 |
| 数据库 | 创建、列出、查看详情、删除 |
| 用户与角色 | RBAC 设置、权限管理 |
| 备份 | 创建、恢复、导出、策略管理 |
| 导入 | 从 S3/GCS/Azure Blob Storage 批量导入数据 |
| 分区 | 创建、加载、释放、管理 |
| 监控 | 集群状态、Collection 统计信息、加载状态 |
| 项目 | 项目和地域管理 |
| 账单 | 用量查询、发票 |

## 如何使用\{#how-to-use}

Skills 通过合适的自然语言提示词调用，例如：

```plaintext
"在 us-east-1 创建一个 serverless cluster，并设置一个包含 768 维向量的 collection"
"在我的 product collection 中搜索 age > 20 的相似项"
"显示我的所有 clusters 和 collections 的状态"
"为我的 production cluster 设置保留 7 天的每日备份策略"
"创建一个对 analytics collection 具有只读访问权限的 role"
```

## 后续步骤\{#next-steps}

- [Claude Code 插件](./zilliz-plugin)

- [GitHub Repository](https://github.com/zilliztech/zilliz-skill)


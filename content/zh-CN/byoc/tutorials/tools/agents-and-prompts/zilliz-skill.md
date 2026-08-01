---
title: "Zilliz Skill | BYOC"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。 | BYOC"
type: origin
token: ZoE3wx0LKiYLtrklb5Jc2gc8nD5
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。

## 什么是 Zilliz Skills？\{#zilliz-skills}

Skills 是扩展 Claude Code 功能的模块化能力。[Zilliz Skills repository](https://github.com/zilliztech/zilliz-skill) 包含面向常见 Zilliz Cloud 操作的预构建技能。

## 安装\{#}

运行以下命令安装 Zilliz skill。请确保已安装 Node.js。

```bash
npx skills add zilliztech/zilliz-skill
```

该命令会引导你选择目标工具并确定安装范围。

## 可用 Skills\{#skills}

## 如何使用\{#}

Skills 通过合适的自然语言提示词调用，例如：

```plaintext
"在 us-east-1 创建一个 serverless cluster，并设置一个包含 768 维向量的 collection"
"在我的 product collection 中搜索 age > 20 的相似项"
"显示我的所有 clusters 和 collections 的状态"
"为我的 production cluster 设置保留 7 天的每日备份策略"
"创建一个对 analytics collection 具有只读访问权限的 role"
```

## 后续步骤\{#}

- Zilliz Plugin

- [GitHub Repository](https://github.com/zilliztech/zilliz-skill)


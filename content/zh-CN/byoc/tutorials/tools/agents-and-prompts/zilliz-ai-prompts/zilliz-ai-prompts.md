---
title: "AI 提示词 | BYOC"
slug: /zilliz-ai-prompts
sidebar_label: "AI 提示词"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud AI 提示词库为 AI 驱动的 IDE 提供精选提示词，帮助 AI 助手正确且高效地实现 Zilliz Cloud 功能。 | BYOC"
type: origin
token: PINDwgtlliTeaqkEQTXcZD7EnGg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AI 提示词

Zilliz Cloud AI 提示词库为 AI 驱动的 IDE 提供精选提示词，帮助 AI 助手正确且高效地实现 Zilliz Cloud 功能。

## 如何使用这些提示词\{#how-to-use-these-prompts}

将 Zilliz Cloud 提示词保存到您代码仓库中的一个文件里，然后在与 AI 工具对话时引用它。下表展示了在不同工具中放置提示词的位置。

| 工具 | 提示词放置位置 | 参考 |
| --- | --- | --- |
| Claude Code | 将提示词写入 CLAUDE.md 文件。 | [存储说明和记忆](https://code.claude.com/docs/en/memory) |
| Cursor | 将提示词添加到项目规则中。 | [配置项目规则](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | 将提示词保存为项目中的一个文件，并使用 #&lt;filename&gt; 引用。 | [Copilot 中的自定义说明](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | 将提示词写入 GEMINI.md 文件。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## 最佳实践\{#best-practices}

对所有 Zilliz Cloud 任务使用基础提示词。

添加与你希望 AI 工具协助完成的工作相匹配的模块提示词。

如果你基于 API 或 SDK 构建，请告诉 AI 工具你想使用的接口：RESTful API、Python SDK、Java SDK、Go SDK、Node.js SDK 或 Terraform。

## 提示词\{#prompts}

| [基础提示词](./zilliz-base-prompts) | [资源规划](./zilliz-resource-planning-prompts) | [定价](./zilliz-pricing-prompts) | [集群连接](./zilliz-cluster-connection-prompts) | [搜索](./zilliz-search-prompts) |
| --- | --- | --- | --- | --- |
| [导入](./zilliz-import-prompts) | [迁移](./zilliz-migration-prompts) | [访问控制](./zilliz-access-control-prompts) | [集成](./zilliz-integrations-prompts) | [Schema 设计](./zilliz-schema-design-prompts) |


import DocCardList from '@theme/DocCardList';

<DocCardList />
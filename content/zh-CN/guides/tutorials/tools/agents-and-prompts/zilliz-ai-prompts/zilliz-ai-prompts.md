---
title: "AI 提示词 | Cloud"
slug: /zilliz-ai-prompts
sidebar_label: "AI 提示词"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud AI 提示词库为 AI 驱动的 IDE 提供精选提示词，帮助 AI 助手正确且高效地实现 Zilliz Cloud 功能。| Cloud"
type: origin
token: Li1gwPA8HiBgsokLgO4cKA7nnDg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AI 提示词

Zilliz Cloud AI 提示词库为 AI 驱动的 IDE 提供精选提示词，帮助 AI 助手正确且高效地实现 Zilliz Cloud 功能。

## 如何使用这些提示词\{#how-to-use-these-prompts}

将 Zilliz Cloud 提示词保存到代码仓库中的文件里，然后在聊天时将其包含到你的 AI 工具中。下表展示了在不同工具中应将提示词放置的位置。

| **工具** | **提示词放置位置** | **参考** |
| --- | --- | --- |
| Claude Code | 将提示词包含在你的 `CLAUDE.md` 文件中。 | [存储指令与记忆](https://code.claude.com/docs/en/memory) |
| Cursor | 将提示词添加到你的项目规则中。 | [配置项目规则](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | 将提示词保存到项目中的文件里，并使用 `#<filename>` 引用它。 | [Copilot 中的自定义指令](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | 将提示词包含在你的 `GEMINI.md` 文件中。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## 最佳实践\{#best-practices}

对于所有 Zilliz Cloud 任务，请使用基础提示词。

添加与希望 AI 工具协助完成的工作相匹配的模块提示词。

如果你要基于 API 或 SDK 进行开发，请告知 AI 工具你希望使用的接口：RESTful API、Python SDK、Java SDK、Go SDK、Node.js SDK 或 Terraform。

## 提示词\{#prompts}

| [基础提示词](./zilliz-base-prompts) | [资源规划](./zilliz-resource-planning-prompts) | [定价](./zilliz-pricing-prompts) | [集群连接](./zilliz-cluster-connection-prompts) | [搜索](./zilliz-search-prompts) |
| --- | --- | --- | --- | --- |
| [导入](./zilliz-import-prompts) | [迁移](./zilliz-migration-prompts) | [集成](./zilliz-integrations-prompts) | [访问控制](./zilliz-access-control-prompts) | [Schema 设计](./zilliz-schema-design-prompts) |



import DocCardList from '@theme/DocCardList';

<DocCardList />

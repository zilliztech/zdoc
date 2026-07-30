---
title: "代理与提示词 | Cloud"
slug: /agents-and-prompts
sidebar_label: "代理与提示词"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 代理与提示词生态系统提供由 AI 驱动的工具，帮助开发者借助自然语言和智能辅助，更高效地使用 Zilliz Cloud 进行开发。 | Cloud"
type: origin
token: GEw3wMvvti0FoNk4194c4GHBn8d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 代理与提示词

Zilliz Cloud 代理与提示词生态系统提供由 AI 驱动的工具，帮助开发者借助自然语言和智能辅助，更高效地使用 Zilliz Cloud 进行开发。

## Zilliz Skill\{#zilliz-skill}

Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。

**最适合用于：**

- 在兼容 Skill 的编码代理中进行交互式开发

- 快速原型设计与探索

- 学习 Zilliz Cloud 功能

- 自然语言工作流

**主要特性**

- 12 个能力领域

- 自然语言界面

- 与兼容 Skill 的代码代理集成

- 封装 Zilliz CLI 执行操作

## Zilliz Plugin\{#zilliz-plugin}

一个 Claude Code 插件，可通过自然语言命令将 Zilliz Cloud 操作直接带入你的 IDE。

**最适合用于：**

- 在 Claude Code 中进行交互式开发

- 快速原型设计与探索

- 学习 Zilliz Cloud 功能

- 自然语言工作流

**主要特性：**

- 14 个能力领域（集群、集合、向量、索引等）

- 自然语言界面

- 与 Claude Code IDE 集成

- 封装 Zilliz CLI 执行操作

## MCP Server\{#mcp-server}

一个 Model Context Protocol 服务器，使任意 AI 代理都能通过标准化工具与 Zilliz Cloud 交互。

**最适合用于：**

- 多平台 AI 代理集成

- Cursor、VS Code、Claude Desktop、ChatGPT

- 程序化 AI 代理工作流

- 共享服务器部署

**主要特性：**

- 16 个标准化工具（控制平面 + 数据平面）

- 可与任何兼容 MCP 的 AI 应用配合使用

- 本地或服务器部署模式

- RESTful HTTP 传输选项

## AI Prompts\{#ai-prompts}

为 AI 驱动 IDE 精选整理的提示词库，帮助 AI 助手正确实现 Zilliz Cloud 功能。

**最适合用于：**

- Claude Code、Cursor、GitHub Copilot、Gemini CLI

- 在不同项目中获得一致的 AI 辅助

- 领域特定指导（搜索、Schema 设计、迁移）

- 团队标准化

**主要特性：**

- 基础提示词 + 9 个专用模块

- 与 IDE 无关（可在多种工具中使用）

- 涵盖资源规划、定价、搜索、导入、迁移、集成、访问控制和 Schema 设计

## 决策矩阵\{#decision-matrix}

| 工具 | 适用场景 | 安装方式 | 自然语言 |
| --- | --- | --- | --- |
| **Zilliz Skill** | 在任何兼容 Skill 的 AI 工具中工作时 | `npx skills add` | ✅ 完全支持 |
| **Zilliz Plugin** | 在 Claude Code IDE 中工作时 | 插件市场 | ✅ 完全支持 |
| **AI Prompts** | 希望获得一致的 AI 指导时 | 复制到项目文件中 | ✅ 引导 AI 行为 |
| **CLI** | 进行脚本编写与自动化时 | pip install | ❌ 仅支持命令行 |

## 相关工具\{#related-tools}

- **Zilliz CLI**：用于脚本编写和自动化的命令行界面。详情请参阅 [Zilliz CLI 参考](/reference/cli/cli/overview)。

- **SDK**：Python、Java、Node.js、Go，用于程序化访问。详情请参阅

    - [Python](/reference/python)

    - [Java](/reference/java)

    - [Golang](/reference/go)

    - [Node.js](/reference/nodejs)

    - [RESTful API](/reference/restful)

## 快速开始\{#getting-started}

1. **对于 Claude Code 用户**：从 Zilliz Plugin 开始

1. **对于其他 AI 工具**：添加 Zilliz SKill 或设置 MCP Server

1. **对于任何 IDE**：将 AI Prompts 添加到你的项目中

## 更多内容\{#whats-more}

import DocCardList from '@theme/DocCardList';

<DocCardList />

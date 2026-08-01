---
title: "智能体与提示词 | Cloud"
slug: /agents-and-prompts
sidebar_label: "智能体与提示词"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 智能体与提示词生态提供由 AI 驱动的工具，帮助开发者通过自然语言和智能辅助更高效地使用 Zilliz Cloud 进行构建。 | Cloud"
type: origin
token: YtUYwMN6diDi9mkOK18cdrTUn1e
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 智能体与提示词

Zilliz Cloud 智能体与提示词生态提供由 AI 驱动的工具，帮助开发者通过自然语言和智能辅助更高效地使用 Zilliz Cloud 进行构建。

## Zilliz Skill\{#zilliz-skill}

Zilliz Skills 是面向 Claude Code 的可复用技能模块，为使用 Zilliz Cloud 提供专门能力。

**适用于：**

- 在兼容 Skill 的编码智能体中进行交互式开发

- 快速原型验证和探索

- 学习 Zilliz Cloud 功能

- 自然语言工作流

**主要特性**

- 12 个能力领域

- 自然语言接口

- 集成到兼容 Skill 的代码智能体

- 封装 Zilliz CLI 执行操作。

## Zilliz Plugin\{#zilliz-plugin}

这是一个 Claude Code 插件，可通过自然语言命令将 Zilliz Cloud 操作直接带入 IDE。

**适用于：**

- 在 Claude Code 中进行交互式开发

- 快速原型验证和探索

- 学习 Zilliz Cloud 功能

- 自然语言工作流

**主要特性：**

- 14 个能力领域（集群、Collection、向量、索引等）

- 自然语言接口

- 集成到 Claude Code IDE

- 封装 Zilliz CLI 执行操作

## MCP Server\{#mcp-server}

Model Context Protocol 服务器，使任何 AI 智能体都能通过标准化工具与 Zilliz Cloud 交互。

**适用于：**

- 多平台 AI 智能体集成

- Cursor、VS Code、Claude Desktop、ChatGPT

- 程序化 AI 智能体工作流

- 共享服务器部署

**主要特性：**

- 16 个标准化工具（控制面 + 数据面）

- 可与任何兼容 MCP 的 AI 应用配合使用

- 支持本地或服务器部署模式

- RESTful HTTP 传输选项

## AI 提示词\{#ai}

面向 AI 驱动 IDE 的精选提示词库，帮助 AI 助手正确实现 Zilliz Cloud 功能。

**适用于：**

- Claude Code、Cursor、GitHub Copilot、Gemini CLI

- 在项目之间保持一致的 AI 辅助

- 特定领域指导（搜索、Schema 设计、迁移）

- 团队标准化

**主要特性：**

- 基础提示词 + 9 个专用模块

- 与 IDE 无关（可用于多种工具）

- 覆盖资源规划、定价、搜索、导入、迁移、集成、访问控制和 Schema 设计

## 决策矩阵\{#}

| 工具 | 使用场景 | 安装方式 | 自然语言 |
| --- | --- | --- | --- |
| **Zilliz Skill** | 使用任何兼容 Skill 的 AI 工具 | `npx skills add` | ✅ 完全支持 |
| **Zilliz Plugin** | 使用 Claude Code IDE | 插件市场 | ✅ 完全支持 |
| **AI Prompts** | 需要一致的 AI 指导 | 复制到项目文件 | ✅ 指导 AI 行为 |
| **CLI** | 脚本和自动化 | pip install | ❌ 仅命令行 |

## 相关工具\{#}

- **Zilliz CLI**：用于脚本和自动化的命令行接口。详情请参阅 [Zilliz CLI Reference](/reference/cli/cli/overview)。

- **SDKs**：用于程序化访问的 Python、Java、Node.js、Go。详情请参阅

    - [Python](/reference/python)

    - [Java](/reference/java)

    - [Golang](/reference/go)

    - [Node.js](/reference/nodejs)

    - [RESTful API](/reference/restful)

## 入门\{#}

1. **Claude Code 用户**：从 Zilliz Plugin 开始

1. **其他 AI 工具用户**：添加 Zilliz SKill 或设置 MCP Server

1. **任意 IDE 用户**：将 AI Prompts 添加到你的项目

## 更多内容\{#}

import DocCardList from '@theme/DocCardList';

<DocCardList />
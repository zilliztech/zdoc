---
title: "Agents & Prompts | Cloud"
slug: /agents-and-prompts
sidebar_key: agents-and-prompts
sidebar_label: "Agents & Prompts"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud Agents and Prompts ecosystem provides AI-powered tools to help developers build with Zilliz Cloud more efficiently using natural language and intelligent assistance. | Cloud"
type: origin
token: GEw3wMvvti0FoNk4194c4GHBn8d
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - skill
  - plugin
  - mcp
  - prompts
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Agents & Prompts

The Zilliz Cloud Agents and Prompts ecosystem provides AI-powered tools to help developers build with Zilliz Cloud more efficiently using natural language and intelligent assistance.

## Zilliz Skill\{#zilliz-skill}

Zilliz Skills are reusable skill modules for Claude Code that provide specialized capabilities for working with Zilliz Cloud.

**Best for:**

- Interactive development in skill-compatible coding agents

- Quick prototyping and exploration

- Learning Zilliz Cloud features

- Natural language workflows

**Key features**

- 12 capabilities areas

- Natural language interface

- Integrated with skill-compatible code agents

- Wraps Zilliz CLI for execution.

## Zilliz Plugin\{#zilliz-plugin}

A Claude Code plugin that brings Zilliz Cloud operations directly into your IDE with natural language commands.

**Best for:**

- Interactive development in Claude Code

- Quick prototyping and exploration

- Learning Zilliz Cloud features

- Natural language workflows

**Key features:**

- 14 capability areas (clusters, collections, vectors, indexes, etc.)

- Natural language interface

- Integrated with Claude Code IDE

- Wraps Zilliz CLI for execution

## MCP Server\{#mcp-server}

A Model Context Protocol server that enables any AI agent to interact with Zilliz Cloud through standardized tools.

**Best for:**

- Multi-platform AI agent integration

- Cursor, VS Code, Claude Desktop, ChatGPT

- Programmatic AI agent workflows

- Shared server deployments

**Key features:**

- 16 standardized tools (control plane + data plane)

- Works with any MCP-compatible AI application

- Local or server deployment modes

- RESTful HTTP transport option

## AI Prompts\{#ai-prompts}

Curated prompt library for AI-powered IDEs to help AI assistants implement Zilliz Cloud features correctly.

**Best for:**

- Claude Code, Cursor, GitHub Copilot, Gemini CLI

- Consistent AI assistance across projects

- Domain-specific guidance (search, schema design, migrations)

- Team standardization

**Key features:**

- Base prompt + 9 specialized modules

- IDE-agnostic (works with multiple tools)

- Covers resource planning, pricing, search, import, migrations, integrations, access control, and schema design

## Decision Matrix\{#decision-matrix}

<table>
   <tr>
     <th><p>Tool</p></th>
     <th><p>Use When</p></th>
     <th><p>Installation</p></th>
     <th><p>Natural Language</p></th>
   </tr>
   <tr>
     <td><p><strong>Zilliz Skill</strong></p></td>
     <td><p>Working in any Skill-compatible AI tool</p></td>
     <td><p><code>npx skills add</code></p></td>
     <td><p>✅ Full support</p></td>
   </tr>
   <tr>
     <td><p><strong>Zilliz Plugin</strong></p></td>
     <td><p>Working in Claude Code IDE</p></td>
     <td><p>Plugin marketplace</p></td>
     <td><p>✅ Full support</p></td>
   </tr>
   <tr>
     <td><p><strong>AI Prompts</strong></p></td>
     <td><p>Want consistent AI guidance</p></td>
     <td><p>Copy to project files</p></td>
     <td><p>✅ Guides AI behavior</p></td>
   </tr>
   <tr>
     <td><p><strong>CLI</strong></p></td>
     <td><p>Scripting and automation</p></td>
     <td><p>pip install</p></td>
     <td><p>❌ Command-line only</p></td>
   </tr>
</table>

## Related Tools\{#related-tools}

- **Zilliz CLI**: Command-line interface for scripting and automation. For details, refer to [Zilliz CLI Reference](/reference/cli/overview).

- **SDKs**: Python, Java, Node.js, Go for programmatic access. For details, refer to 

    - [Python](/reference/python)

    - [Java](/reference/java)

    - [Golang](/reference/go)

    - [Node.js](/reference/nodejs)

    - [RESTful API](/reference/restful)

## Getting Started\{#getting-started}

1. **For Claude Code users**: Start with the Zilliz Plugin

1. **For other AI tools**: Add Zilliz SKill or set up the MCP Server

1. **For any IDE**: Add AI Prompts to your project

## What's more\{#whats-more}

import DocCardList from '@theme/DocCardList';

<DocCardList />
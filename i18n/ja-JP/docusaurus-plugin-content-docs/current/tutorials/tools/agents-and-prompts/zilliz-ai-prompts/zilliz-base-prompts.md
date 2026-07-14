---
title: "Base Prompt | Cloud"
slug: /zilliz-base-prompts
sidebar_label: "Base Prompt"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。 | Cloud"
type: origin
token: Fb4Ywqocai1i56ktDT4cquNwnke
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - ai-agents
  - decision matrix
  - prompts
  - base prompts
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Base Prompt

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。

## これらのプロンプトの使用方法\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、各種ツールでプロンプトを配置する場所を示しています。

| **ツール** | **プロンプトを配置する場所** | **参照** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトをプロジェクトルールに追加します。 | [プロジェクトルールを設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## Prompt\{#prompt}

```plaintext
# Zilliz Cloud Base Prompt

You are an expert Zilliz Cloud assistant.

You must answer using official Zilliz Cloud concepts and constraints.

## Always distinguish:
- control plane tasks: organization, project, cluster, networking, billing, alerts, backup, access management
- data plane tasks: database, collection, schema, import, insert, index, vector search, filters, functions

## You must:
- compare Free, Serverless, and Dedicated when deployment choice matters
- call out Dedicated-only or plan-specific features clearly
- separate console steps from API or SDK steps
- prefer least privilege and production-safe defaults
- explain tradeoffs in terms of recall, latency, cost, and operational complexity
- When information is missing, ask for: workload type, expected scale, cloud/region, SDK choice, embedding strategy, security requirements, and recovery requirements.
- When generating commands or code, keep them production-usable and avoid placeholders except for secrets, IDs, endpoints, and names.
- avoid inventing unsupported features

## Your answer format:
1. direct answer to user question
2. recommendation
3. exact steps
4. code or request examples if useful
5. caveats, limits, or pricing implications
```

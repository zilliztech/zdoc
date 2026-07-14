---
title: "Agents & Prompts | BYOC"
slug: /agents-and-prompts
sidebar_label: "Agents & Prompts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud Agents and Prompts エコシステムは、自然言語とインテリジェントな支援を使用して、開発者が Zilliz Cloud を使った開発をより効率的に行えるよう支援する AI 搭載ツールを提供します。 | BYOC"
type: origin
token: GEw3wMvvti0FoNk4194c4GHBn8d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Agents & Prompts

Zilliz Cloud Agents and Prompts エコシステムは、自然言語とインテリジェントな支援を使用して、開発者が Zilliz Cloud を使った開発をより効率的に行えるよう支援する AI 搭載ツールを提供します。

## Zilliz Skill\{#zilliz-skill}

Zilliz Skills は、Zilliz Cloud を扱うための特化した機能を提供する、Claude Code 向けの再利用可能なスキルモジュールです。

**最適な用途:**

- スキル互換のコーディングエージェントでの対話型開発

- 素早いプロトタイピングと探索

- Zilliz Cloud 機能の学習

- 自然言語ワークフロー

**主な機能**

- 12 の機能領域

- 自然言語インターフェース

- スキル互換のコードエージェントと統合

- 実行に Zilliz CLI をラップします。

## Zilliz Plugin\{#zilliz-plugin}

自然言語コマンドを使って、Zilliz Cloud の操作を IDE に直接もたらす Claude Code プラグインです。

**最適な用途:**

- Claude Code での対話型開発

- 素早いプロトタイピングと探索

- Zilliz Cloud 機能の学習

- 自然言語ワークフロー

**主な機能:**

- 14 の機能領域（cluster、collection、vector、index など）

- 自然言語インターフェース

- Claude Code IDE と統合

- 実行に Zilliz CLI をラップします

## MCP Server\{#mcp-server}

標準化されたツールを通じて、あらゆる AI エージェントが Zilliz Cloud と対話できるようにする Model Context Protocol サーバーです。

**最適な用途:**

- マルチプラットフォーム AI エージェント統合

- Cursor、VS Code、Claude Desktop、ChatGPT

- プログラムによる AI エージェントワークフロー

- 共有サーバーデプロイメント

**主な機能:**

- 16 の標準化ツール（control plane + data plane）

- あらゆる MCP 互換 AI アプリケーションで動作

- ローカルまたはサーバーデプロイモード

- RESTful HTTP 転送オプション

## AI Prompts\{#ai-prompts}

AI 搭載 IDE 向けに厳選されたプロンプトライブラリで、AI アシスタントが Zilliz Cloud の機能を正しく実装できるよう支援します。

**最適な用途:**

- Claude Code、Cursor、GitHub Copilot、Gemini CLI

- プロジェクト間で一貫した AI 支援

- ドメイン特化ガイダンス（search、schema design、migrations）

- チームの標準化

**主な機能:**

- ベースプロンプト + 9 つの特化モジュール

- IDE 非依存（複数のツールで動作）

- resource planning、pricing、search、import、migrations、integrations、access control、schema design をカバー

## Decision Matrix\{#decision-matrix}

| ツール | 使用する場面 | インストール | 自然言語 |
| --- | --- | --- | --- |
| **Zilliz Skill** | 任意の Skill 互換 AI ツールで作業する場合 | `npx skills add` | ✅ 完全対応 |
| **Zilliz Plugin** | Claude Code IDE で作業する場合 | プラグインマーケットプレイス | ✅ 完全対応 |
| **AI Prompts** | 一貫した AI ガイダンスが必要な場合 | プロジェクトファイルにコピー | ✅ AI の動作をガイド |
| **CLI** | スクリプト作成と自動化 | pip install | ❌ コマンドラインのみ |

## Related Tools\{#related-tools}

- **Zilliz CLI**: スクリプト作成と自動化のためのコマンドラインインターフェース。詳細は [Zilliz CLI Reference](/reference/cli/cli/overview) を参照してください。

- **SDKs**: プログラムによるアクセスのための Python、Java、Node.js、Go。詳細は以下を参照してください。 

    - [Python](/reference/python)

    - [Java](/reference/java)

    - [Golang](/reference/go)

    - [Node.js](/reference/nodejs)

    - [RESTful API](/reference/restful)

## Getting Started\{#getting-started}

1. **Claude Code ユーザー向け**: Zilliz Plugin から始めます

1. **その他の AI ツール向け**: Zilliz SKill を追加するか、MCP Server をセットアップします

1. **任意の IDE 向け**: AI Prompts をプロジェクトに追加します

## What's more\{#whats-more}

import DocCardList from '@theme/DocCardList';

<DocCardList />

---
title: "Agents & Prompts | Cloud"
slug: /agents-and-prompts
sidebar_label: "Agents & Prompts"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Agents and Prompts エコシステムは、自然言語とインテリジェントな支援を通じて、開発者が Zilliz Cloud を使った開発をより効率的に行えるよう支援する AI 搭載ツールを提供します。 | Cloud"
type: origin
token: GEw3wMvvti0FoNk4194c4GHBn8d
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Agents & Prompts

Zilliz Cloud の Agents and Prompts エコシステムは、自然言語とインテリジェントな支援を通じて、開発者が Zilliz Cloud を使った開発をより効率的に行えるよう支援する AI 搭載ツールを提供します。

## Zilliz Skill\{#zilliz-skill}

Zilliz Skills は Claude Code 向けの再利用可能なスキルモジュールで、Zilliz Cloud を扱うための特化した機能を提供します。

**最適な用途:**

- スキル対応コーディングエージェントでのインタラクティブな開発

- 迅速なプロトタイピングと探索

- Zilliz Cloud 機能の学習

- 自然言語ワークフロー

**主な機能**

- 12 の機能領域

- 自然言語インターフェース

- スキル対応コードエージェントと統合

- 実行のために Zilliz CLI をラップ

## Zilliz Plugin\{#zilliz-plugin}

自然言語コマンドを使って、Zilliz Cloud の操作を直接 IDE に取り込む Claude Code プラグインです。

**最適な用途:**

- Claude Code でのインタラクティブな開発

- 迅速なプロトタイピングと探索

- Zilliz Cloud 機能の学習

- 自然言語ワークフロー

**主な機能:**

- 14 の機能領域（clusters、collections、vectors、indexes など）

- 自然言語インターフェース

- Claude Code IDE と統合

- 実行のために Zilliz CLI をラップ

## MCP Server\{#mcp-server}

任意の AI エージェントが標準化されたツールを通じて Zilliz Cloud とやり取りできるようにする Model Context Protocol サーバーです。

**最適な用途:**

- マルチプラットフォーム AI エージェント統合

- Cursor、VS Code、Claude Desktop、ChatGPT

- プログラムによる AI エージェントワークフロー

- 共有サーバーデプロイメント

**主な機能:**

- 16 の標準化ツール（control plane + data plane）

- あらゆる MCP 対応 AI アプリケーションで動作

- ローカルまたはサーバーデプロイモード

- RESTful HTTP トランスポートオプション

## AI Prompts\{#ai-prompts}

AI 搭載 IDE 向けに厳選されたプロンプトライブラリで、AI アシスタントが Zilliz Cloud の機能を正しく実装できるよう支援します。

**最適な用途:**

- Claude Code、Cursor、GitHub Copilot、Gemini CLI

- プロジェクト間で一貫した AI 支援

- ドメイン固有のガイダンス（search、schema design、migrations）

- チーム標準化

**主な機能:**

- ベースプロンプト + 9 つの特化モジュール

- IDE 非依存（複数のツールで動作）

- リソース計画、価格設定、search、import、migrations、integrations、access control、schema design をカバー

## 判断マトリクス\{#decision-matrix}

| ツール | 使用する場合 | インストール | 自然言語 |
| --- | --- | --- | --- |
| **Zilliz Skill** | 任意の Skill 対応 AI ツールで作業するとき | `npx skills add` | ✅ フルサポート |
| **Zilliz Plugin** | Claude Code IDE で作業するとき | Plugin marketplace | ✅ フルサポート |
| **AI Prompts** | 一貫した AI ガイダンスが必要なとき | プロジェクトファイルにコピー | ✅ AI の振る舞いをガイド |
| **CLI** | スクリプト作成と自動化 | pip install | ❌ コマンドラインのみ |

## 関連ツール\{#related-tools}

- **Zilliz CLI**: スクリプト作成と自動化のためのコマンドラインインターフェース。詳細については、[Zilliz CLI Reference](/reference/cli/cli/overview) を参照してください。

- **SDKs**: プログラムによるアクセスのための Python、Java、Node.js、Go。詳細については、以下を参照してください。

    - [Python](/reference/python)

    - [Java](/reference/java)

    - [Golang](/reference/go)

    - [Node.js](/reference/nodejs)

    - [RESTful API](/reference/restful)

## はじめに\{#getting-started}

1. **Claude Code ユーザー向け**: Zilliz Plugin から始めてください

1. **その他の AI ツール向け**: Zilliz SKill を追加するか、MCP Server をセットアップしてください

1. **任意の IDE 向け**: AI Prompts をプロジェクトに追加してください

## さらに詳しく\{#whats-more}

import DocCardList from '@theme/DocCardList';

<DocCardList />

---
title: "AI プロンプト | BYOC"
slug: /zilliz-ai-prompts
sidebar_label: "AI プロンプト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud AI プロンプトライブラリは、AI 対応 IDE 向けに厳選されたプロンプトを提供し、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装できるように支援します。 | BYOC"
type: origin
token: Li1gwPA8HiBgsokLgO4cKA7nnDg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AI プロンプト

Zilliz Cloud AI プロンプトライブラリは、AI 対応 IDE 向けに厳選されたプロンプトを提供し、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装できるように支援します。

## プロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud プロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールで読み込みます。以下の表に、各ツールでのプロンプトの配置場所を示します。

| **ツール** | **プロンプトの配置場所** | **参照** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに記述します。 | [手順とメモリの保存](https://code.claude.com/docs/en/memory) |
| Cursor | プロジェクトルールにプロンプトを追加します。 | [プロジェクトルールの設定](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロジェクト内のファイルにプロンプトを保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに記述します。 | [Gemini CLI コードラボ](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## ベストプラクティス\{#best-practices}

すべての Zilliz Cloud タスクにはベースプロンプトを使用してください。

AI ツールに依頼したい作業に応じて、対応するモジュールプロンプトを追加してください。

API または SDK を使用して開発する場合は、利用するインターフェース（RESTful API、Python SDK、Java SDK、Go SDK、Node.js SDK、Terraform）を AI ツールに指定してください。

## プロンプト一覧\{#prompts}

| [ベースプロンプト](./zilliz-base-prompts) | [リソースプランニング](./zilliz-resource-planning-prompts) | [料金](./zilliz-pricing-prompts) | [クラスター接続](./zilliz-cluster-connection-prompts) | [検索](./zilliz-search-prompts) |
| --- | --- | --- | --- | --- |
| [インポート](./zilliz-import-prompts) | [移行](./zilliz-migration-prompts) | [連携](./zilliz-integrations-prompts) | [アクセス制御](./zilliz-access-control-prompts) | [スキーマ設計](./zilliz-schema-design-prompts) |



import DocCardList from '@theme/DocCardList';

<DocCardList />

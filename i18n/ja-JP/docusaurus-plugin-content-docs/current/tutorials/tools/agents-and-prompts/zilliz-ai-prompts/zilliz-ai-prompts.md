---
title: "AI プロンプト | Cloud"
slug: /zilliz-ai-prompts
sidebar_label: "AI プロンプト"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud AI プロンプトライブラリは、AI 搭載 IDE 向けに厳選されたプロンプトを提供し、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装できるよう支援します。 | Cloud"
type: origin
token: Li1gwPA8HiBgsokLgO4cKA7nnDg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# AI プロンプト

Zilliz Cloud AI プロンプトライブラリは、AI 搭載 IDE 向けに厳選されたプロンプトを提供し、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装できるよう支援します。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、各種ツールでプロンプトを配置する場所を示しています。

| **ツール** | **プロンプトを配置する場所** | **参照** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトをプロジェクトルールに追加します。 | [プロジェクトルールを設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## ベストプラクティス\{#best-practices}

すべての Zilliz Cloud タスクにはベースプロンプトを使用してください。

AI ツールに支援してほしい作業に一致するモジュールプロンプトを追加してください。

API または SDK を使って構築する場合は、使用したいインターフェースが RESTful API、Python SDK、Java SDK、Go SDK、Node.js SDK、または Terraform のどれであるかを AI ツールに伝えてください。

## プロンプト\{#prompts}

| [Base Prompt](./zilliz-base-prompts) | [リソース計画](./zilliz-resource-planning-prompts) | [料金](./zilliz-pricing-prompts) | [クラスター接続](./zilliz-cluster-connection-prompts) | [検索](./zilliz-search-prompts) |
| --- | --- | --- | --- | --- |
| [インポート](./zilliz-import-prompts) | [移行](./zilliz-migration-prompts) | [インテグレーション](./zilliz-integrations-prompts) | [アクセス制御](./zilliz-access-control-prompts) | [スキーマ設計](./zilliz-schema-design-prompts) |



import DocCardList from '@theme/DocCardList';

<DocCardList />

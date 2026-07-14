---
title: "Zilliz Skill | Cloud"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills は、Zilliz Cloud を操作するための特化機能を提供する、Claude Code 向けの再利用可能なスキルモジュールです。 | Cloud"
type: origin
token: EXj3wKsw8ijsqJk8uYPcmfXWn3g
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - ai-agents
  - スキル
  - opencode
  - gemini cli
  - qwen code
  - zilliz cli
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills は、Zilliz Cloud を操作するための特化機能を提供する、Claude Code 向けの再利用可能なスキルモジュールです。

## Zilliz Skills とは？\{#what-are-zilliz-skills}

Skills は、Claude Code の機能を拡張するモジュール型の機能です。[Zilliz Skills repository](https://github.com/zilliztech/zilliz-skill) には、一般的な Zilliz Cloud 操作向けの事前構築済みスキルが含まれています。

## セットアップ\{#setup}

次のコマンドを実行して Zilliz skill をインストールします。Node.js がインストールされていることを確認してください。

```bash
npx skills add zilliztech/zilliz-skill
```

このコマンドは、対象ツールの選択とインストール範囲の決定をガイドします。

## 利用可能な Skills\{#available-skills}

| 領域 | 実行できること |
| --- | --- |
| Clusters | 作成、削除、一時停止、再開、変更 |
| Collections | カスタム schema での作成、load、release、名前変更、drop |
| Vectors | search、query、insert、upsert、delete、hybrid search |
| Indexes | 作成（AUTOINDEX）、一覧表示、describe、drop |
| Databases | 作成、一覧表示、describe、drop |
| Users & Roles | RBAC の設定、権限管理 |
| Backups | 作成、復元、エクスポート、ポリシー管理 |
| Import | S3/GCS/Azure Blob Storage からの一括データインポート |
| Partitions | 作成、load、release、管理 |
| Monitoring | cluster のステータス、collection の統計、load 状態 |
| Projects | プロジェクトおよびリージョンの管理 |
| Billing | 使用量クエリ、請求書 |

## 使用方法\{#how-to-use}

Skills は、次のように適切な自然言語プロンプトで呼び出されます。

```plaintext
"Create a serverless cluster in us-east-1 and set up a collection with 768-dimension vectors"
"Search for similar items in my product collection with filter age > 20"
"Show me the status of all my clusters and collections"
"Set up a daily backup policy for my production cluster with 7-day retention"
"Create a role with read-only access to the analytics collection"
```

## 次のステップ\{#next-steps}

- [Zilliz Plugin](./zilliz-plugin)

- [GitHub リポジトリ](https://github.com/zilliztech/zilliz-skill)


---
title: "Zilliz Skill | Cloud"
slug: /zilliz-skill
sidebar_label: "Zilliz Skill"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Skills は、Zilliz Cloud を扱うための特化機能を Claude Code に提供する再利用可能なスキルモジュールです。 | Cloud"
type: origin
token: EXj3wKsw8ijsqJk8uYPcmfXWn3g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Skill

Zilliz Skills は、Zilliz Cloud を扱うための特化機能を Claude Code に提供する再利用可能なスキルモジュールです。

## Zilliz Skills とは何ですか？\{#what-are-zilliz-skills}

Skills は、Claude Code の機能を拡張するモジュール型の機能です。[Zilliz Skills repository](https://github.com/zilliztech/zilliz-skill) には、一般的な Zilliz Cloud 操作向けの事前構築済みスキルが含まれています。

## セットアップ\{#setup}

次のコマンドを実行して Zilliz skill をインストールします。Node.js がインストールされていることを確認してください。

```bash
npx skills add zilliztech/zilliz-skill
```

このコマンドにより、対象ツールの選択とインストール範囲の決定が案内されます。

## 利用可能な Skills\{#available-skills}

| 領域 | できること |
| --- | --- |
| Clusters | 作成、削除、一時停止、再開、変更 |
| Collections | カスタム schema で作成、load、release、rename、drop |
| Vectors | search、query、insert、upsert、delete、hybrid search |
| Indexes | 作成（AUTOINDEX）、list、describe、drop |
| Databases | 作成、list、describe、drop |
| Users & Roles | RBAC セットアップ、権限管理 |
| Backups | 作成、restore、export、ポリシー管理 |
| Import | S3/GCS/Azure Blob Storage からの一括データ import |
| Partitions | 作成、load、release、管理 |
| Monitoring | cluster ステータス、collection 統計、load 状態 |
| Projects | project と region の管理 |
| Billing | 使用量クエリ、請求書 |

## 使用方法\{#how-to-use}

Skills は、次のように適切な自然言語プロンプトで呼び出します。

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


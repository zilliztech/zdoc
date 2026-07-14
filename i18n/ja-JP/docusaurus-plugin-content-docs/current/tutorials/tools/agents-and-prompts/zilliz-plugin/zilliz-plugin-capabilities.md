---
title: "Zilliz Claude Code Plugin の機能 | Cloud"
slug: /zilliz-plugin-capabilities
sidebar_label: "主要機能"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Plugin は、自然言語を使用して Zilliz Cloud リソースを管理するためのさまざまな領域にわたる機能を提供します。このガイドでは、クラスターとコレクションの管理、およびベクトル操作に関連する主な機能を紹介します。 | Cloud"
type: origin
token: A6q4wqxGViorDmkD5iKcoDBOnRh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - ai-agents
  - decision matrix
  - skill
  - claude
  - zilliz cli
  - capabilities
  - vector operations
  - cluster management
  - collection management
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin の機能

Zilliz Plugin は、自然言語を使用して Zilliz Cloud リソースを管理するためのさまざまな領域にわたる機能を提供します。このガイドでは、クラスターとコレクションの管理、およびベクトル操作に関連する主な機能を紹介します。

## Cluster Management\{#cluster-management}

**できること:**

- サーバーレスまたは Dedicated クラスターを作成する

- クラスターを一時停止および再開する

- クラスターを削除する

- クラスターの設定を変更する

- クラスターを一覧表示し、詳細を表示する

**自然言語の例:**

- "us-west-2 にサーバーレスクラスターを作成して"

- "開発用クラスターを一時停止して"

- "自分のクラスターをすべて表示して"

- "本番クラスターを再開して"

**対応する CLI:**

```bash
zilliz cluster create --name my-cluster --type serverless --region us-west-2
zilliz cluster suspend --cluster-id <id>
zilliz cluster list
zilliz cluster resume --cluster-id <id>
```

## Collection Management\{#collection-management}

**できること:**

- カスタムスキーマでコレクションを作成する

- コレクションをロードおよびリリースする

- コレクションの名前を変更および削除する

- コレクションの統計情報を取得する

**自然言語の例:**

- "products という名前の、768 次元ベクトルを持つコレクションを作成して"

- "user_embeddings コレクションをロードして"

- "自分のコレクションの統計を表示して"

**対応する CLI:**

```bash
zilliz collection create --name products --dimension 768
zilliz collection load --name user_embeddings
zilliz collection getstats --name products
```

## Vector Operations\{#vector-operations}

**できること:**

- ベクトルを挿入する

- 類似したベクトルを検索する

- フィルター付きでクエリする

- ベクトルを削除する

- Upsert（挿入または更新）する

**自然言語の例:**

- "products コレクションで類似アイテムを 10 件検索して"

- "これらのベクトルを自分のコレクションに挿入して"

- "age > 25 の users をクエリして"

- "id が [1,2,3] に含まれるベクトルを削除して"

**対応する CLI:**

```bash
zilliz vector search --collection products --limit 10
zilliz vector query --collection users --filter "age > 25"
zilliz vector delete --collection products --ids 1,2,3
```

その他の機能については、[Zilliz CLI リファレンス](/reference/cli/cli/overview) ドキュメントを参照してください。

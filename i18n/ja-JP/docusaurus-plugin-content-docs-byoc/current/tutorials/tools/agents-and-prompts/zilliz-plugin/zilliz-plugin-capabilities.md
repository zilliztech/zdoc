---
title: "Zilliz Claude Code Plugin の機能 | BYOC"
slug: /zilliz-plugin-capabilities
sidebar_label: "主要な機能"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Plugin は、自然言語を使用して Zilliz Cloud リソースを管理するためのさまざまな領域にわたる機能を提供します。このガイドでは、cluster と collection の管理、および vector 操作に関連する主な機能を紹介します。 | BYOC"
type: origin
token: A6q4wqxGViorDmkD5iKcoDBOnRh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin の機能

Zilliz Plugin は、自然言語を使用して Zilliz Cloud リソースを管理するためのさまざまな領域にわたる機能を提供します。このガイドでは、cluster と collection の管理、および vector 操作に関連する主な機能を紹介します。

## Cluster 管理\{#cluster-management}

**できること:**

- serverless または dedicated cluster を作成する

- cluster を一時停止および再開する

- cluster を削除する

- cluster の構成を変更する

- cluster を一覧表示および詳細表示する

**自然言語の例:**

- "us-west-2 に serverless cluster を作成して"

- "開発用 cluster を一時停止して"

- "すべての cluster を表示して"

- "本番 cluster を再開して"

**対応する CLI:**

```bash
zilliz cluster create --name my-cluster --type serverless --region us-west-2
zilliz cluster suspend --cluster-id <id>
zilliz cluster list
zilliz cluster resume --cluster-id <id>
```

## Collection 管理\{#collection-management}

**できること:**

- カスタム schema を使用して collection を作成する

- collection をロードおよびリリースする

- collection の名前を変更および削除する

- collection の統計情報を取得する

**自然言語の例:**

- "products という名前の、768 次元 vector を持つ collection を作成して"

- "user_embeddings collection をロードして"

- "collection の統計情報を表示して"

**対応する CLI:**

```bash
zilliz collection create --name products --dimension 768
zilliz collection load --name user_embeddings
zilliz collection getstats --name products
```

## Vector 操作\{#vector-operations}

**できること:**

- vector を挿入する

- 類似した vector を検索する

- フィルター付きでクエリする

- vector を削除する

- Upsert（挿入または更新）する

**自然言語の例:**

- "products collection で類似アイテムを 10 件検索して"

- "これらの vector を collection に挿入して"

- "age > 25 の users をクエリして"

- "id が [1,2,3] に含まれる vector を削除して"

**対応する CLI:**

```bash
zilliz vector search --collection products --limit 10
zilliz vector query --collection users --filter "age > 25"
zilliz vector delete --collection products --ids 1,2,3
```

さらに多くの機能については、[Zilliz CLI リファレンス](/reference/cli/cli/overview) のドキュメントを参照してください。

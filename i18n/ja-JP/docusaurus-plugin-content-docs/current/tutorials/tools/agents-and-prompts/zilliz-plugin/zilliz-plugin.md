---
title: "Zilliz Claude Code Plugin | Cloud"
slug: /zilliz-plugin
sidebar_label: "Claude Code Plugin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Claude Code 向け Zilliz Cloud plugin は、Zilliz Cloud の操作を IDE に直接取り込む自然言語インターフェースです。CLI コマンドを覚えたり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明するだけで、plugin が処理します。 | Cloud"
type: origin
token: LFepwAKeGiURJUksNA4cqYPYnIb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin

Claude Code 向け Zilliz Cloud plugin は、Zilliz Cloud の操作を IDE に直接取り込む自然言語インターフェースです。CLI コマンドを覚えたり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明するだけで、plugin が処理します。

## Zilliz Plugin とは？\{#what-is-the-zilliz-plugin}

自然言語機能で Zilliz CLI をラップした Claude Code plugin であり、対話型コマンドを通じて Zilliz Cloud リソースを管理できます。

## 主な機能\{#key-features}

### 14 の機能領域\{#14-capability-areas}

- **Clusters**: cluster の作成、削除、一時停止、再開、変更

- **Collections**: カスタム schema での作成、load、release、rename、drop

- **Vectors**: vector の search、query、insert、upsert、delete

- **Indexes**: index の作成、一覧表示、詳細表示、drop

- **Databases**: database の作成、一覧表示、詳細表示、drop

- **Users & Roles**: RBAC の設定、権限管理

- **Backups**: 作成、復元、エクスポート、ポリシー管理

- **Import**: クラウドストレージからの一括データ import

- **Partitions**: partition の作成、load、release、管理

- **Monitoring**: cluster ステータス、collection 統計

- **Billing**: 請求管理

- **Jobs**: job 管理

- **Project/Region**: project と region の設定

- **Setup**: 初期設定とクイックスタート

### 自然言語インターフェース\{#natural-language-interface}

```plaintext
You: "Create a serverless cluster in us-east-1 called my-vectors"
Plugin: Creates cluster with appropriate configuration

You: "Search for similar items in my product collection with filter age > 20"
Plugin: Executes vector search with filters
```

## 前提条件\{#prerequisites}

- Python 3.10 以降

- Zilliz Cloud アカウント

- Claude Code IDE

## クイック例\{#quick-example}

インストール後、クイックスタートを実行します。

```plaintext
/zilliz:quickstart
```

これにより、次の内容をガイドします。

1. CLI のインストール

1. 認証設定

1. cluster 接続

1. 最初の操作

## 次のステップ\{#next-steps}



import DocCardList from '@theme/DocCardList';

<DocCardList />

---
title: "Zilliz Claude Code プラグイン | Cloud"
slug: /zilliz-plugin
sidebar_label: "Claude Code プラグイン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Claude Code 向け Zilliz Cloud プラグインは、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを覚えたり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明すれば、プラグインがそれを処理します。 | Cloud"
type: origin
token: LFepwAKeGiURJUksNA4cqYPYnIb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - ai-agents
  - decision matrix
  - skill
  - claude
  - zilliz cli
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code プラグイン

Claude Code 向け Zilliz Cloud プラグインは、Zilliz Cloud の操作を IDE に直接持ち込む自然言語インターフェースです。CLI コマンドを覚えたり Web コンソールに切り替えたりする代わりに、やりたいことを平易な言葉で説明すれば、プラグインがそれを処理します。

## Zilliz Plugin とは？\{#what-is-the-zilliz-plugin}

自然言語機能で Zilliz CLI をラップする Claude Code プラグインで、会話形式のコマンドを通じて Zilliz Cloud リソースを管理できます。

## 主な機能\{#key-features}

### 14 の機能領域\{#14-capability-areas}

- **Clusters**: クラスターの作成、削除、一時停止、再開、変更

- **Collections**: カスタムスキーマでの作成、読み込み、解放、名前変更、削除

- **Vectors**: ベクトルの検索、クエリ、挿入、アップサート、削除

- **Indexes**: インデックスの作成、一覧表示、詳細表示、削除

- **Databases**: データベースの作成、一覧表示、詳細表示、削除

- **Users & Roles**: RBAC セットアップ、権限管理

- **Backups**: 作成、復元、エクスポート、ポリシー管理

- **Import**: クラウドストレージからの一括データインポート

- **Partitions**: パーティションの作成、読み込み、解放、管理

- **Monitoring**: クラスターのステータス、コレクション統計

- **Billing**: 請求管理

- **Jobs**: ジョブ管理

- **Project/Region**: プロジェクトとリージョンの設定

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

これにより、次の手順を案内します。

1. CLI のインストール

1. 認証設定

1. クラスター接続

1. 最初の操作

## 次のステップ\{#next-steps}



import DocCardList from '@theme/DocCardList';

<DocCardList />

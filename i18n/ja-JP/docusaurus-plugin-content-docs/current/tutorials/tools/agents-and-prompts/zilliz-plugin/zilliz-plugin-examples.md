---
title: "Zilliz Claude Code Plugin の例 | Cloud"
slug: /zilliz-plugin-examples
sidebar_label: "その他の例"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、自然言語を使ってインフラストラクチャをプロビジョニングし、データ操作を実行し、クラスター間でデータをバックアップおよび復元し、クラスターのセキュリティのためにアクセス制御を実装する、より多くの例を紹介します。 | Cloud"
type: origin
token: JiHgw9rQsibSugklTvBcpS1unGe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Claude Code Plugin の例

このガイドでは、自然言語を使ってインフラストラクチャをプロビジョニングし、データ操作を実行し、クラスター間でデータをバックアップおよび復元し、クラスターのセキュリティのためにアクセス制御を実装する、より多くの例を紹介します。

## 例 1: インフラストラクチャのプロビジョニング\{#example-1-infrastructure-provisioning}

**シナリオ**: 新しい Zilliz Cloud 環境をセットアップする

```plaintext
You: "Create a serverless cluster called dev-cluster in us-east-1"
Plugin: Creates the cluster

You: "Create a database called my_app"
Plugin: Creates database

You: "Create a collection called products with 768-dimension vectors and fields: id, name, price"
Plugin: Creates collection with schema
```

## 例 2: データ操作ワークフロー\{#example-2-data-operations-workflow}

**シナリオ**: データを挿入して検索を実行する

```plaintext
You: "Insert 100 product vectors from my CSV file"
Plugin: Processes bulk insert

You: "Create an IVF_FLAT index on the products collection"
Plugin: Creates index

You: "Search for 5 similar products to vector [0.1, 0.2, ...]"
Plugin: Executes vector search and returns results
```

## 例 3: バックアップと復元\{#example-3-backup-and-restore}

**シナリオ**: 自動バックアップを設定する

```plaintext
You: "Create a backup policy for my production cluster with daily backups and 7-day retention"
Plugin: Configures backup policy

You: "Create a backup of the users collection right now"
Plugin: Initiates manual backup

You: "Restore the users collection from yesterday's backup"
Plugin: Restores from backup
```

## 例 4: アクセス制御\{#example-4-access-control}

**シナリオ**: チームメンバー向けに RBAC を設定する

```plaintext
You: "Create a role called analyst with read-only access to the analytics collection"
Plugin: Creates role with privileges

You: "Create a user alice@company.com and assign the analyst role"
Plugin: Creates user and assigns role
```

さらに多くの例については、[Zilliz CLI リファレンス](/reference/cli/cli/overview) ドキュメントを参照してください。

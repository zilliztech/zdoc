---
title: "Zilliz CLI | Cloud"
slug: /cli/cli/overview
sidebar_label: "概要"
sidebar_position: 0
---

# Zilliz CLI

[Zilliz Command Line Interface (CLI)](https://github.com/zilliztech/zilliz-cli) は、Zilliz Cloud リソースを管理し、データ操作を実行するためのコマンドラインツールを提供します。

## 機能

- **Cloud Management** - クラスター、プロジェクト、ボリューム、バックアップを管理します
- **Configuration** - 認証、アラート、CLI 設定を構成します
- **Data Operations** - コレクション、データベース、インデックスを管理し、ベクトル検索を実行します

## クイックスタート

### インストール

```bash
pip install zilliz-cli
```

### 認証

```bash
zilliz login
```

### クラスターを作成

```bash
zilliz cluster create --name my-cluster --type serverless
```

## コマンドカテゴリ

### [Cloud Management](./CloudManagement/CloudManagement-Cluster/Cluster-create)

- [Backup](./CloudManagement/CloudManagement-Backup/Backup-create) - バックアップの作成、復元、管理を行います
- [Billing](./CloudManagement/CloudManagement-Billing/Billing-bindcard) - 請求書と使用量を表示します
- [Cluster](./CloudManagement/CloudManagement-Cluster/Cluster-create) - クラスターの作成、一時停止、再開、削除を行います
- [Project](./CloudManagement/CloudManagement-Project/Project-create) - プロジェクトを管理します
- [Volume](./CloudManagement/CloudManagement-Volume/Volume-create) - ストレージボリュームを管理します

### [Configuration](./Configuration/Configuration-Auth/Auth-login)

- [Auth](./Configuration/Configuration-Auth/Auth-login) - ログイン、ログアウト、アカウント切り替えを行います
- [Configure](./Configuration/Configuration-Configure/Configure-clear) - 設定値を設定および取得します
- [Context](./Configuration/Configuration-Context/Context-current) - CLI コンテキストを管理します
- [Alert](./Configuration/Configuration-Alert/Alert-create) - アラートを作成および管理します

### [Data Operations](./DataOperations/DataOperations-Collection/Collection-create)

- [Collection](./DataOperations/DataOperations-Collection/Collection-create) - コレクションの作成、詳細表示、管理を行います
- [Database](./DataOperations/DataOperations-Database/Database-create) - データベースを管理します
- [Index](./DataOperations/DataOperations-Index/Index-create) - インデックスの作成と管理を行います
- [Vector](./DataOperations/DataOperations-Vector/Vector-delete) - ベクトルの挿入、検索、クエリを行います
- [User/Role](./DataOperations/DataOperations-Role/Role-create) - ユーザーとロールを管理します

## はじめに

- [認証](./Configuration/Configuration-Auth/Auth-login)
- [クラスターを作成](./CloudManagement/CloudManagement-Cluster/Cluster-create)
- [コレクションを作成](./DataOperations/DataOperations-Collection/Collection-create)

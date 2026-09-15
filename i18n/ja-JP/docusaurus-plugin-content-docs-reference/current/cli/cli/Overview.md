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

### クラスターを作成する

```bash
zilliz cluster create --name my-cluster --type serverless
```

## コマンドカテゴリ

### [Cloud Management](./Cluster-create)

- [Backup](./Backup-create) - バックアップの作成、復元、管理を行います
- [Billing](./Billing-bindcard) - 請求書と使用量を表示します
- [クラスター](./Cluster-create) - クラスターの作成、一時停止、再開、削除を行います
- [Project](./Project-create) - プロジェクトを管理します
- [Volume](./Volume-create) - ストレージボリュームを管理します

### [Configuration](./Auth-login)

- [Auth](./Auth-login) - ログイン、ログアウト、アカウント切り替えを行います
- [Configure](./Configure-clear) - 設定値の設定および取得を行います
- [Context](./Context-current) - CLI コンテキストを管理します
- [Alert](./Alert-create) - アラートの作成および管理を行います

### [Data Operations](./Collection-create)

- [コレクション](./Collection-create) - コレクションの作成、詳細表示、管理を行います
- [データベース](./Database-create) - データベースを管理します
- [インデックス](./Index-create) - インデックスの作成および管理を行います
- [ベクトル](./Vector-delete) - ベクトルの挿入、検索、クエリを実行します
- [User/Role](./Role-create) - ユーザーとロールを管理します

## はじめに

- [Authenticate](./Auth-login)
- [クラスターを作成する](./Cluster-create)
- [コレクションを作成する](./Collection-create)

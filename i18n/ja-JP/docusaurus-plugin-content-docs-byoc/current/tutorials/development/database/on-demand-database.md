---
title: "オンデマンド検索用データベース | BYOC"
slug: /on-demand-database
sidebar_label: "オンデマンド検索用データベース"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンド検索用データベースは、Zilliz Cloud が管理するプロジェクトレベルのデータベースです。サービングクラスターには紐付きません。このページでは、プロジェクトエンドポイント経由でデータベースの作成、参照、削除を行う方法について説明します。 | BYOC"
type: origin
token: KTWtw4V6SiTpDMkeGMQc8lChn8b
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# オンデマンド検索用データベース

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は Enterprise プラン以上でのみ利用できます。

</FeatureNote>

オンデマンド検索用データベースは、Zilliz Cloud が管理するプロジェクトレベルのデータベースです。サービングクラスターには紐付きません。このページでは、プロジェクトエンドポイントを使用してデータベースの作成、参照、削除を行う方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

このページでは、オンデマンド検索で使用されるプロジェクトレベルのデータベースについて説明します。サービングクラスターでホストされるデータベースについては、「[サービングクラスター内のデータベース](./database)」を参照してください。データベースモデルの比較については、「[データベースの説明](./database-concept)」を参照してください。

</Admonition>

## 事前準備\{#before-you-begin}

以下の条件を満たしていることを確認してください。

- **Project Admin** のアクセス権限を持っていること。ロールと権限の詳細については、「[プラットフォームユーザーの管理](./manage-platform-users#project-users)」を参照してください。

- プロジェクトエンドポイントを取得していること（例: `https://{project-id}.{region}.api.zillizcloud.com`）。

- プロジェクトにアクセス可能な API キーを持っていること。

各プロジェクトでは、オンデマンド検索用データベースを最大 100 個まで作成できます。

## サポートされている操作\{#supported-operations}

| 操作 | サポート状況 |
| --- | --- |
| データベースの作成/drop | はい |
| コレクションの作成/drop | はい |
| コレクションのロード/release | 不要 |
| 検索/query | はい |
| インポート | はい |
| 挿入/upsert/delete | いいえ |

オンデマンドデータベース内のすべてのコレクション（マネージドコレクションおよび外部コレクションを含む）では、インデックスの削除はサポートされていません。

## データベースの作成\{#create-database}

このデータベースは、プロジェクト内のオンデマンドコンピュートによって共有されるプロジェクトレベルのリソースです。

```bash
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/create" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database"
  }'
```

Zilliz Cloud コンソールからもデータベースを作成できます。

<Procedures>

1. プロジェクトに移動します。

1. **オンデマンド** をクリックします。

1. **データベース** をクリックします。

1. **データベースの作成** をクリックします。

1. データベース名を入力します。

1. **作成** をクリックします。

</Procedures>

## データベースの参照\{#view-databases}

```bash
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/list" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
```

Zilliz Cloud コンソールでデータベースを参照するには、プロジェクトに移動し、**オンデマンド** > **データベース** の順にクリックします。

## データベースの削除\{#drop-database}

<Admonition type="danger" icon="🚧" title="Danger">

データベースを削除すると即座に除去され、復元することはできません。この操作は取り消せません。

</Admonition>

データベースを削除する前に、そのデータベース内のすべてのコレクションを削除してください。

```bash
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database"
  }'
```

Zilliz Cloud コンソールからデータベースを削除するには、プロジェクトに移動し、**オンデマンド** > **データベース** の順にクリックして、対象のデータベースを削除します。

## 次のステップ\{#next-steps}

- [データベースの説明](./database-concept)

- [サービングクラスター内のデータベース](./database)

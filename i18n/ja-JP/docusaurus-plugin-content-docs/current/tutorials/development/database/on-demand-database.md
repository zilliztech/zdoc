---
title: "オンデマンド検索用データベース | Cloud"
slug: /on-demand-database
sidebar_label: "オンデマンド検索用データベース"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンド検索用データベースは、Zilliz Cloud によって管理されるプロジェクトレベルのデータベースです。サービングクラスターには紐付けられません。このページでは、プロジェクトエンドポイントを通じてデータベースを作成、表示、削除する方法を説明します。 | Cloud"
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

オンデマンド検索用データベースは、Zilliz Cloud によって管理されるプロジェクトレベルのデータベースです。サービングクラスターには紐付けられません。このページでは、プロジェクトエンドポイントを通じてデータベースを作成、表示、削除する方法を説明します。

<Admonition type="info" icon="📘" title="注意">

このページは、オンデマンド検索で使用されるプロジェクトレベルのデータベースを対象としています。サービングクラスターでホストされるデータベースについては、[サービングクラスター内のデータベース](./database) を参照してください。データベースモデルの比較については、[Database Explained](./database-concept) を参照してください。

</Admonition>

## 始める前に\{#before-you-begin}

以下を確認してください。

- **Project Admin** アクセス権を持っていること。ロールと権限の詳細については、[プロジェクトユーザーを管理する](./project-users#project-role-and-access-comparison) を参照してください。

- プロジェクトエンドポイントを持っていること。たとえば `https://{project-id}.{region}.api.zillizcloud.com` です。

- プロジェクトにアクセスできる API キーを持っていること。

各プロジェクトでは、オンデマンド検索用データベースを最大 100 個まで作成できます。

## サポートされる操作\{#supported-operations}

| 操作 | サポート |
| --- | --- |
| データベースの作成/削除 | はい |
| コレクションの作成/削除 | はい |
| コレクションのロード/リリース | 不要 |
| 検索/クエリ | はい |
| インポート | はい |
| 挿入/upsert/削除 | いいえ |

オンデマンドデータベース内のすべてのコレクション（管理対象コレクションおよび外部コレクションを含む）は、インデックスの削除をサポートしていません。

## データベースを作成する\{#create-database}

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

Zilliz Cloud コンソールからデータベースを作成することもできます。

<Procedures>

1. プロジェクトに移動します。

1. **On-demand** をクリックします。

1. **Databases** をクリックします。

1. **Create Database** をクリックします。

1. データベース名を入力します。

1. **Create** をクリックします。

</Procedures>

## データベースを表示する\{#view-databases}

```bash
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/list" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
```

Zilliz Cloud コンソールでデータベースを表示するには、プロジェクトに移動し、**On-demand** をクリックしてから **Databases** をクリックします。

## データベースを削除する\{#drop-database}

<Admonition type="danger" icon="🚧" title="危険">

データベースを削除すると、即座に削除され、復元できません。この操作は元に戻せません。

</Admonition>

データベースを削除する前に、まずそのデータベース内のすべてのコレクションを削除してください。

```bash
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database"
  }'
```

Zilliz Cloud コンソールからデータベースを削除するには、プロジェクトに移動し、**On-demand** をクリックし、**Databases** をクリックして、対象のデータベースを削除します。

## 次のステップ\{#next-steps}

- [Database Explained](./database-concept)

- [サービングクラスター内のデータベース](./database)


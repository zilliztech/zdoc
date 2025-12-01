---
title: "バックアップファイルからのリストア | BYOC"
slug: /restore-from-snapshot
sidebar_label: "バックアップファイルからのリストア"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのリストア機能を使用すると、誤ってデータが失われた場合やデータ破損、システム障害などの場合にバックアップファイルからデータを復旧できます。これによりビジネスの継続性が確保されます。インシデントからの回復、意図しない変更の元に戻し、または最小限の中断でテスト用にクラスターを複製するための信頼性の高い手段です。 | BYOC"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ
  - リストア
  - KNNアルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからのリストア

Zilliz Cloudのリストア機能を使用すると、誤ってデータが失われた場合やデータ破損、システム障害などの場合にバックアップファイルからデータを復旧できます。これによりビジネスの継続性が確保されます。インシデントからの回復、意図しない変更の元に戻し、または最小限の中断でテスト用にクラスターを複製するための信頼性の高い手段です。

このガイドでは、バックアップファイルから完全または部分クラスターをリストアする方法を説明します。

## 制限事項\{#limits}

- **アクセス制御**: プロジェクト管理者、組織の所有者、またはバックアップ権限を持つカスタムロールである必要があります。

## 完全クラスターのリストア\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含むクラスター全体を**新しいクラスター**にリストアできます。これは、テストまたは回復のために環境を複製するのに便利です。クラスター全体をリストアするには、バックアップファイルがクラスターバックアップである必要があります。

リストア中、RBAC設定を含めるかどうかを選択できます。

<Admonition type="info" icon="📘" title="注意">

<p>RBACのリストアは現在ウェブコンソールでのみサポートされており、RESTful APIではまだサポートされていません。</p>

</Admonition>

リストア後、`db_admin`ユーザーの**新しいパスワード**が生成されます。このパスワードを使用して、リストアされたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで完全クラスターをリストアする方法を示しています。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、既存のバックアップファイルから`Dedicated-01-backup`という名前の新しいクラスターに完全クラスターをリストアします。RESTful APIの詳細については、[クラスターバックアップのリストア](/reference/restful/restore-cluster-backup-v2)を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP"
      }'
```

以下は出力例です。リストアジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗を確認できます。

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "username": "db_admin",
    "password": "xxxxxxxxx",
    "jobId": "job-xxxxxxxxxxxxxx"
  }
}
```

## 部分クラスターのリストア\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを**既存のクラスター**にリストアするように選択することもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでクラスター内の特定のデータベースとコレクションをリストアする方法を示しています。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルから既存のクラスター`in01-3e5ad8adc38xxxx`にコレクションをリストアします。RESTful APIの詳細については、[コレクションバックアップのリストア](/reference/restful/restore-collection-backup-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "in01-xxxxxxxxxxxxxx",
    "dbCollections": [
        {
            "collections": [
                {
                    "collectionName": "medium_articles",
                    "destCollectionName": "restore_medium_articles",
                    "destCollectionStatus": "LOADED"
                }
            ]
        }
    ]
}'
```

以下は出力例です。リストアジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗を確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```
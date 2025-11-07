---
title: "バックアップファイルから復元 | Cloud"
slug: /restore-from-snapshot
sidebar_label: "バックアップファイルから復元"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの復元機能は、誤ってデータが失われた場合や、データが破損した場合、またはシステム障害が発生した場合に、バックアップファイルからデータを復旧できるようにし、ビジネスの継続性を確保します。これは、インシデントから復旧する信頼性の高い方法であり、意図しない変更を元に戻す、またはテスト用にクラスターを複製することができます。 | Cloud"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - バックアップ
  - 復元
  - NLP
  - ニューラルネットワーク
  - ディープラーニング
  - 知識ベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルから復元

Zilliz Cloudの復元機能は、誤ってデータが失われた場合や、データが破損した場合、またはシステム障害が発生した場合に、バックアップファイルからデータを復旧できるようにし、ビジネスの継続性を確保します。これは、インシデントから復旧する信頼性の高い方法であり、意図しない変更を元に戻す、またはテスト用にクラスターを複製することができます。

このガイドでは、バックアップファイルから完全または部分的なクラスターを復元する方法を説明します。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールを持つユーザーである必要があります。

## 完全なクラスターを復元\{#restore-a-full-cluster}

クラスター全体（すべてのデータベースとコレクションを含む）を **新しいクラスター** に復元できます。これは、テスト用に環境を複製したり、復旧する場合に便利です。クラスター全体を復元するには、バックアップファイルがクラスターバックアップである必要があります。

復元中、RBAC設定を含めるかどうかを選択できます。

<Admonition type="info" icon="📘" title="注意">

<p>RBACの復元は現在、ウェブコンソール経由でのみサポートされています。RESTful APIはまだサポートしていません。</p>

</Admonition>

復元後、`db_admin`ユーザーの **新しいパスワード** が生成されます。このパスワードを使用して、復元されたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールで完全なクラスターを復元する方法を示すデモです。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、既存のバックアップファイルから`Dedicated-01-backup`という名前の新しいクラスターに完全なクラスターを復元する例です。RESTful APIの詳細については、[クラスターバックアップを復元](/reference/restful/restore-cluster-backup-v2)を参照してください。

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

以下は出力例です。復元ジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

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

## 部分的なクラスターを復元\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを **既存のクラスター** に復元するように選択することもできます。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールでクラスター内の特定のデータベースとコレクションを復元する方法を示すデモです。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、既存のクラスター`in01-3e5ad8adc38xxxx`にバックアップファイルからコレクションを復元する例です。RESTful APIの詳細については、[コレクションバックアップを復元](/reference/restful/restore-collection-backup-v2)を参照してください。

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

以下は出力例です。復元ジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

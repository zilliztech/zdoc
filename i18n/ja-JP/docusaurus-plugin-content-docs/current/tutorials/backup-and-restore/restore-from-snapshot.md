---
title: "バックアップファイルからの復元 | Cloud"
slug: /restore-from-snapshot
sidebar_label: "バックアップファイルからの復元"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudの復元機能により、偶発的な損失、破損、またはシステム障害の場合にバックアップファイルからデータを回復し、ビジネスの継続性を確保できます。これは、インシデントから回復したり、意図しない変更を元に戻したり、最小限の混乱でクラスタをクローンしてテストするための信頼性の高い方法です。 | Cloud"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - restore
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからの復元

Zilliz Cloudの復元機能により、偶発的な損失、破損、またはシステム障害の場合にバックアップファイルからデータを回復し、ビジネスの継続性を確保できます。これは、インシデントから回復したり、意図しない変更を元に戻したり、最小限の混乱でクラスタをクローンしてテストするための信頼性の高い方法です。

このガイドでは、バックアップファイルから完全または部分的なクラスタを復元する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>バックアップと復元機能は、専用クラスターでのみ利用可能です。 </p>

</Admonition>

</exclude>

## 限界{#limits}

- アクセス制御:プロジェクト管理者、組織の所有者、またはバックアップ権限を持つカスタムロールが必要です。

## クラスタを完全に復元する{#restore-a-full-cluster}

あなたは、すべてのデータベースとコレクションを含むクラスタ全体を**新しいクラスタ**に復元することができます。これは、テストやリカバリのために環境をクローンするために役立ちます。クラスタ全体を復元するには、バックアップファイルがクラスタバックアップである必要があります。

復元中に、RBAC設定を含めるかどうかを選択できます。 

<Admonition type="info" icon="📘" title="ノート">

<p>現在、RBACの復元はWebコンソールからのみサポートされています。RESTful APIはまだサポートしていません。</p>

</Admonition>

リストア後、`db_admin`ユーザー用に**新しいパスワード**が生成されます。このパスワードを使用して、リストアされたクラスターに接続します。

### ウェブコンソールから{#via-web-console}

次のデモでは、Zilliz Cloud Webコンソールで完全なクラスタを復元する方法を示します。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、既存のバックアップファイルの完全なクラスタを`Dedicated-01-backup`という新しいクラスタに復元します。RESTful APIの詳細については、[クラスタバックアップの復元](/reference/restful/restore-cluster-backup-v2)を参照してください。

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

以下は出力例です。復元ジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗状況を確認できます。

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

## クラスタの一部を復元する{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを**既存のクラスター**に復元するように選択することもできます。

### ウェブコンソールから{#via-web-console}

次のデモでは、Zilliz Cloudウェブコンソール上のクラスタ内の特定のデータベースとコレクションを復元する方法を示します。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful APIを使用する{#via-restful-api}

以下の例では、バックアップファイルから既存のクラスタ`in01-3e5ad8adc38xxxx`にコレクションを復元します。RESTful APIの詳細については、[コレクションのバックアップを復元](/reference/restful/restore-collection-backup-v2)を参照してください。

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

以下は出力例です。復元ジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗状況を確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```


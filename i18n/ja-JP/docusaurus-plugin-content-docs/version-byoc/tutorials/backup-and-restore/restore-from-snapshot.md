---
title: "バックアップファイルからの復元 | BYOC"
slug: /restore-from-snapshot
sidebar_key: restore-from-snapshot
sidebar_label: "バックアップファイルからの復元"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の復元機能を使用すると、誤ったデータ損失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを回復でき、事業の継続性を確保できます。これは、インシデントからの回復、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローンするための信頼性の高い方法です。 | BYOC"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ
  - 復元

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからの復元

Zilliz Cloud の復元機能を使用すると、誤ったデータ損失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを回復でき、事業の継続性を確保できます。これは、インシデントからの回復、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローンするための信頼性の高い方法です。

このガイドでは、バックアップファイルからクラスター全体または一部を復元する方法について説明します。

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールを持っている必要があります。

## クラスター全体の復元\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含むクラスター全体を**新しいクラスター**に復元できます。これは、テストや復旧のために環境をクローンする場合に役立ちます。クラスター全体を復元するには、バックアップファイルがクラスターバックアップである必要があります。

復元中は、RBAC 設定を含めるかどうかを選択できます。

<Admonition type="info" icon="📘" title="Notes">

<p>RBAC の復元は現在ウェブコンソール経由でのみサポートされており、RESTful API ではまだサポートされていません。</p>

</Admonition>

復元後、`db_admin` ユーザー用に**新しいパスワード**が生成されます。このパスワードを使用して復元されたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスター全体を復元する方法を示しています。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API 経由\{#via-restful-api}

以下の例では、既存のバックアップファイルから `Dedicated-01-backup` という名前の新しいクラスターへクラスター全体を復元します。RESTful API の詳細については、[クラスターバックアップの復元](/reference/restful/restore-cluster-backup-v2) を参照してください。

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP"
      }'
```

以下は出力例です。リストアジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

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

## 部分的なクラスターのリストア\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを**既存のクラスター**にリストアすることもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソール上でクラスター内の特定のデータベースとコレクションをリストアする方法を示しています。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルからコレクションを既存のクラスター `in01-3e5ad8adc38xxxx` にリストアします。RESTful APIの詳細については、[Restore Collection Backup](/reference/restful/restore-collection-backup-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${API_KEY}" \
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

以下は出力例です。リストアジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

## FAQ\{#faq}

**復元されたクラスターはどの Milvus バージョンで実行されますか？**

復元されたクラスターは、バックアップ作成時に使用されたバージョンに関係なく、復元時点で Zilliz Cloud がサポートする最新の Milvus バージョンで実行されます。例えば、Milvus 2.5.x クラスターのバックアップを作成し、プラットフォームが 2.6.x にアップグレードされた後に復元した場合、復元されたクラスターは Milvus 2.6.x で実行されます。バックアップファイルにはデータのみが含まれており、クラスターのバージョンはプラットフォームによって決定されます。           
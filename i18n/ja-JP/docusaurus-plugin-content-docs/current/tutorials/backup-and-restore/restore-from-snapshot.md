---
title: "バックアップファイルからの復元 | Cloud"
slug: /restore-from-snapshot
sidebar_key: restore-from-snapshot
sidebar_label: "バックアップファイルからの復元"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の復元機能を使用すると、誤ったデータ損失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを回復でき、事業の継続性を確保できます。これは、インシデントからの回復、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローンするための信頼性の高い方法です。 | Cloud"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - 復元

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからのリストア

Zilliz Cloud のリストア機能を使用すると、誤ってデータを失った場合やデータが破損した場合、システム障害が発生した場合などに、バックアップファイルからデータを復旧できます。これにより、ビジネスの継続性を確保できます。この機能は、インシデントからの確実な復旧、意図しない変更の取り消し、または最小限の中断でテスト用にクラスターをクローンするための信頼性の高い方法です。

このガイドでは、バックアップファイルからクラスター全体または一部をリストアする方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールが必要です。

## クラスター全体のリストア\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含む**クラスター全体**を**新しいクラスター**にリストアできます。これは、テスト環境のクローン作成や復旧に役立ちます。クラスター全体をリストアするには、バックアップファイルがクラスターバックアップである必要があります。

リストア中には、RBAC 設定を含めるかどうかを選択できます。

<Admonition type="info" icon="📘" title="Notes">

<p>RBAC のリストアは現在、ウェブコンソール経由でのみサポートされています。RESTful API ではまだサポートされていません。</p>

</Admonition>

リストア後、`db_admin` ユーザーのパスワードが**新たに生成**されます。このパスワードを使用してリストアされたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモは、Zilliz Cloud ウェブコンソール上でクラスター全体をリストアする方法を示しています。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、既存のバックアップファイルから `Dedicated-01-backup` という名前の新しいクラスターにクラスター全体をリストアします。RESTful API の詳細については、「[Restore Cluster Backup](/reference/restful/restore-cluster-backup-v2)」を参照してください。

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

## 暗号化されたバックアップファイルからの復元\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用してデータを復号してから復元を行います。したがって、バックアップを暗号化ありまたはなしで新しいクラスターに復元できます。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**CMEK を使用した保存時の暗号化**を有効にするかどうかを除き、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にした場合、復元後に作成されるクラスターは、以下で指定された KMS キーを使用して暗号化されます。

- このオプションを無効にした場合、復元後に作成されるクラスターは暗号化されません。

## FAQ\{#faq}

**復元されたクラスターはどの Milvus バージョンで実行されますか？**

復元されたクラスターは、バックアップが作成された際のバージョンに関係なく、復元時点で Zilliz Cloud がサポートする最新の Milvus バージョンで実行されます。例えば、Milvus 2.5.x クラスターのバックアップを作成し、プラットフォームが 2.6.x にアップグレードされた後に復元した場合、復元されたクラスターは Milvus 2.6.x で実行されます。バックアップファイルにはデータのみが含まれており、クラスターのバージョンはプラットフォームによって決定されます。           
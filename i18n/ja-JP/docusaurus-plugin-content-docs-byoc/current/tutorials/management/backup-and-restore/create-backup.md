---
title: "バックアップの作成 | BYOC"
slug: /create-backup
sidebar_label: "バックアップの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定の collection を復元できます。 | BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定の collection を復元できます。

このガイドでは、**手動でバックアップを作成する方法**を説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

## Limits\{#limits}

- **アクセス制御**: **project admin**、**organization owner**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップ対象外**:

    - Collection TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[restore](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - クラスターの動的スケーリング設定およびスケジュール済みスケーリング設定

- **クラスターの shard 設定**: バックアップされますが、クラスターの CU サイズが縮小されている場合、CU あたりの shard 数の制限により、restore 時に調整される可能性があります。詳細は [Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 同時にアクティブまたは保留中にできる**手動バックアップ**は **1 つのみ**です。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの実行中は、手動バックアップを開始できません。

        - 手動バックアップがすでに進行中であっても、自動バックアップは引き続き実行されます。

## クラスターのバックアップを作成する\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択した collection を復元できます。 

### Web コンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud の Web コンソールでクラスターのバックアップを作成する方法を示します。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細については、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Content-Type: application/json" \
     --data-raw '{
            "backupType": "CLUSTER"
      }'
```

以下は出力例です。バックアップジョブが生成され、進行状況は[プロジェクトジョブセンター](./job-center)で確認できます。

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup0_c7b18539b97xxxx",
    "backupName": "Dedicated-01_backup2",
    "jobId": "job-031a8e3587ba7zqkadxxxx"
  }
}
```

## collection のバックアップを作成する\{#create-collection-backup}

クラスター内の特定の collection または collection の一部をバックアップするには、collection レベルのバックアップを作成します。 

### Web コンソール経由\{#via-web-console}

以下のデモでは、Web コンソールで collection のバックアップを作成する方法を示します。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` 内の collection `medium_articles` のバックアップを作成します。RESTful API の詳細については、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "backupType": "COLLECTION",
    "dbCollections": [
        {
            "collectionNames": [
                "medium_articles"
            ]
        }
    ]
}'
```

以下は出力例です。バックアップジョブが生成され、進行状況は[プロジェクトジョブセンター](./job-center)で確認できます。

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup0_c7b18539b97xxxx",
    "backupName": "Dedicated-01_backup2",
    "jobId": "job-031a8e3587ba7zqkadxxxx"
  }
}
```

## FAQs\{#faqs}

### バックアップジョブにはどのくらい時間がかかりますか？\{#how-long-does-a-backup-job-take}

バックアップにかかる時間はデータサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超える collection が含まれている場合、処理にやや時間がかかることがあります。

### バックアップ中に DDL（Data Definition Language）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの進行中は、collection の作成や削除などの主要な DDL（Data Definition Language）操作を避けることを推奨します。これらの操作はプロセスに干渉したり、結果の不整合を招いたりする可能性があります。

### 元のクラスターが削除された場合、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は、元のクラスターとともに削除されます。一方、手動のクラスター バックアップは永続的に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。


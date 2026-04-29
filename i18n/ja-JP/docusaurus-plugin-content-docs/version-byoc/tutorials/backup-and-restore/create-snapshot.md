---
title: "バックアップの作成 | BYOC"
slug: /create-snapshot
sidebar_key: create-snapshot
sidebar_label: "バックアップの作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップとはデータの複製であり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元するために使用されます。| BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloud において、バックアップとは、データ損失やシステム障害が発生した際に**クラスター全体**または特定のコレクションを復元できるようにするデータの複製です。

本ガイドでは、**手動でバックアップを作成する**方法について説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール設定](./schedule-automatic-backups) をご覧ください。

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**を持っている必要があります。

- **バックアップから除外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` の**パスワード**（[スナップショットからの復元](./restore-from-snapshot) 中に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよび**スケジュールされたスケーリング**設定

- **クラスターシャード設定**: バックアップされますが、シャードあたりの CU 制限により、クラスターの CU サイズが縮小された場合、復元時に調整される可能性があります。詳細については、[Zilliz Cloud の制限](./limits#shards) をご覧ください。

- **バックアップジョブの制限**:

    - アクティブまたは保留中の**手動バックアップ**は同時に 1 つのみ可能です。

    - **自動バックアップ**が有効になっている場合:

        - 自動バックアップが実行中は、手動バックアップを開始できません。

        - 手動バックアップが既に実行中であっても、自動バックアップは引き続き実行されます。

## クラスターバックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元することができます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API 経由\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2) をご覧ください。

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

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

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

## Create collection backup\{#create-collection-backup}

特定のコレクションまたはクラスター内のコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。

### ウェブコンソール経由\{#via-web-console}

次のデモでは、ウェブコンソール経由でコレクションバックアップを作成する方法を示します。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API経由\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細については、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

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

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進行状況を確認できます。

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

バックアップの所要時間はデータのサイズに依存します。参考として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれている場合、プロセスはわずかに長くなる可能性があります。

### バックアップ中に DDL（データ定義言語）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの実行中は、コレクションの作成や削除など、主要な DDL（データ定義言語）操作を避けることを推奨します。これらの操作はプロセスに干渉したり、結果の不整合を引き起こしたりする可能性があるためです。

### 元のクラスターが削除された場合、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての [自動バックアップ](./schedule-automatic-backups) は元のクラスターとともに削除されます。ただし、手動で実行したクラスターバックアップは永続的に保持され、クラスターが削除されても削除されません。不要になった場合は、手動で削除する必要があります。


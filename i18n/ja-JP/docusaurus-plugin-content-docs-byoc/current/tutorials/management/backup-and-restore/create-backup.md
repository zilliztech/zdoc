---
title: "Create Backup | BYOC"
slug: /create-backup
sidebar_label: "Create Backup"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a backup is a copy of the data that allows you to restore the entire クラスター or specific コレクション in the event of data loss or system failure. | BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create Backup

Zilliz Cloud におけるバックアップとは、データ損失やシステム障害の発生時にクラスター全体または特定のコレクションを復元するためのデータのコピーです。

このガイドでは、**バックアップを手動で作成する方法**について説明します。バックアップ作成を自動化する場合は、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

## Limits\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップの対象外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[restore](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュールされたスケーリングの設定

- **クラスターのシャード設定**: バックアップに含まれますが、復元時にクラスターの CU サイズが縮小されている場合、CU あたりのシャード数制限により調整される可能性があります。詳細は [Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 同時に実行中または保留中にできる**手動バックアップは 1 つだけ**です。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの実行中は、手動バックアップを開始できません。

        - 手動バックアップが実行中の場合でも、自動バックアップは通常通り実行されます。

- 請求書の未払いにより組織が凍結された場合、その 60 日後にバックアップは自動的に削除されます。

## クラスター バックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成しておくと、後でクラスター全体または選択したコレクションを復元できます。

### Via web console\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールでクラスターバックアップを作成する方法を紹介しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### Via RESTful API\{#via-restful-api}

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

以下は出力例です。バックアップジョブが生成され、[project job center](./job-center) で進捗状況を確認できます。

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

## コレクション バックアップの作成\{#create-collection-backup}

クラスター内の特定のコレクションまたは一部のコレクションをバックアップするには、コレクションレベルのバックアップを作成します。

### Via web console\{#via-web-console}

以下のデモでは、Web コンソールでコレクションバックアップを作成する方法を紹介しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### Via RESTful API\{#via-restful-api}

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

以下は出力例です。バックアップジョブが生成され、[project job center](./job-center) で進捗状況を確認できます。

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

### How long does a backup job take?\{#how-long-does-a-backup-job-take}

バックアップにかかる時間はデータサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれる場合は、処理に若干時間がかかることがあります。

### Can I perform DDL (Data Definition Language) operations during a backup?\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの実行中は、コレクションの作成や削除といった大規模な DDL（Data Definition Language）操作を避けることを推奨します。これらの操作はバックアップ処理に影響を与えたり、不整合な結果を引き起こしたりする可能性があります。

### 元のクラスターが削除された場合、バックアップファイルは削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。[自動バックアップ](./schedule-automatic-backups) は元のクラスターとともに削除されますが、手動で作成したクラスターバックアップは永続的に保持され、クラスター削除時にも自動的には削除されません。不要になった場合は手動で削除する必要があります。


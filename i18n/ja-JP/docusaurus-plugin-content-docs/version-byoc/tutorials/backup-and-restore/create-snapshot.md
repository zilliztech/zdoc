---
title: "バックアップの作成 | BYOC"
slug: /create-snapshot
sidebar_label: "バックアップの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、バックアップはデータのコピーであり、データ損失やシステム障害の際にクラスター全体または特定のコレクションを復元できるようにします。 | BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ
  - LLMハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - 近傍検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloudでは、バックアップはデータのコピーであり、データ損失やシステム障害の際にクラスター全体または特定のコレクションを復元できるようにします。

このガイドでは、**手動でバックアップを作成する方法**について説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織の所有者**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップ対象外**:

    - コレクションTTL設定

    - デフォルトユーザー `db_admin` のパスワード（[リストア](./restore-from-snapshot)時に新しいパスワードが生成されます）

    - クラスターダイナミックスケーリングとスケジュールスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターCUサイズが縮小された場合、シャードあたりCU制限によりリストア時に調整される場合があります。詳細は[Zilliz Cloud制限事項](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 同時にアクティブまたは保留状態になれるのは**1つの手動バックアップ**のみです。

    - **自動バックアップ**が有効になっている場合:

        - 自動バックアップが進行中の間は、手動バックアップを開始できません。

        - 手動バックアップが既に進行中の場合でも、自動バックアップは実行され続けます。

## クラスターバックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful APIの詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Content-Type: application/json" \
     --data-raw '{
            "backupType": "CLUSTER"
      }'
```

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗を確認できます。

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

## コレクションバックアップの作成\{#create-collection-backup}

クラスター内の特定のコレクションまたはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、ウェブコンソールでコレクションバックアップを作成する方法を示しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful APIの詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${TOKEN}" \
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

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗を確認できます。

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

## よくある質問\{#faqs}

**バックアップジョブにはどれくらい時間がかかりますか？**

バックアップの所要時間はデータサイズに依存します。参考までに、700 MBのバックアップには通常約1秒かかります。クラスターに1,000以上のコレクションが含まれている場合、処理に少し時間がかかる場合があります。

**バックアップ中にDDL（データ定義言語）操作を実行できますか？**

バックアップが進行中の間は、コレクションの作成や削除などの主要なDDL（データ定義言語）操作を避けることをお勧めします。これらはプロセスに干渉するか、一貫性のない結果をもたらす可能性があります。

**元のクラスターが削除された場合、バックアップファイルは削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスターとともに削除されます。しかし、手動クラスターバックアップは永久に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。
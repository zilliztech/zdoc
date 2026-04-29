---
title: "バックアップの作成 | Cloud"
slug: /create-snapshot
sidebar_key: create-snapshot
sidebar_label: "バックアップの作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップとはデータの複製であり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元するために使用されます。| Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloud では、バックアップとはデータのコピーであり、データ損失やシステム障害が発生した際にクラスター全体または特定のコレクションを復元するために使用されます。

バックアップの作成には追加の[料金](./storage-cost)が発生し、その価格はバックアップが保存されるクラウドリージョンに基づいて決定されます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、**手動でバックアップを作成する**方法について説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール設定](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限 \{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップから除外されるもの**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[リストア](./restore-from-snapshot)時に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターの CU サイズが縮小された場合、CU あたりのシャード数の制限により、リストア時に調整される可能性があります。詳細については、[Zilliz Cloud 制限s](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - **手動バックアップ**は一度に 1 つだけアクティブまたは保留中の状態にできます。

    - **自動バックアップ**が有効になっている場合:

        - 自動バックアップが進行中の間は、手動バックアップを開始できません。

        - 手動バックアップがすでに進行中の場合でも、自動バックアップは実行されます。

## クラスターバックアップの作成 \{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元できます。ディザスタリカバリのためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細については、[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由 \{#via-web-console}

以下のデモは、Zilliz Cloud ウェブコンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API経由 \{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細については、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

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

## コレクションのバックアップを作成する\{#create-collection-backup}

クラスタ内の特定のコレクション、またはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。障害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細については、[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモは、ウェブコンソール上でコレクションのバックアップを作成する方法を示しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスタ `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

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

## よくある質問\{#faqs}

### バックアップジョブはどのくらいの時間がかかりますか？\{#how-long-does-a-backup-job-take}

バックアップにかかる時間はデータのサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 個を超えるコレクションが含まれる場合、処理にやや時間がかかることがあります。

### バックアップ中に DDL（データ Definition 言語）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップ実行中は、コレクションの作成や削除など、大規模な DDL（データ Definition 言語）操作を避けることを推奨します。これらの操作はバックアッププロセスに干渉したり、結果が不整合になったりする可能性があります。

### 元のクラスターを削除した場合、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスターとともに削除されます。一方、手動で作成されたクラスターバックアップは永続的に保持され、クラスター削除時にも削除されません。不要になった場合は、手動で削除する必要があります。

### 暗号化されたクラスターをバックアップするとどうなりますか？\{#what-will-happen-if-i-back-up-an-encrypted-cluster}

暗号化されたクラスターをバックアップすると、暗号化範囲内のすべてのデータは引き続き暗号化された状態で保存され、**Backup File** 列の名前の横に鍵アイコンが表示されます。

![TiPxbigzIo8wUQxsJ9wcOP3pnAb](https://zdoc-images.s3.us-west-2.amazonaws.com/tipxbigzio8wuqxsj9wcop3pnab.png "TiPxbigzIo8wUQxsJ9wcOP3pnAb")

暗号化されたバックアップを新しいクラスターにリストアする際、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用してデータを復号したうえでリストアを行います。そのため、バックアップは暗号化の有無に関係なく新しいクラスターにリストアできます。

詳細については、[暗号化されたバックアップからのリストア](./restore-from-snapshot#restore-from-an-encrypted-backup-file) を参照してください。


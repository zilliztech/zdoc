---
title: "バックアップの作成 | Cloud"
slug: /create-backup
sidebar_label: "バックアップの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。 | Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合に、クラスター全体または特定のコレクションを復元できます。

バックアップの作成には追加の[料金](./storage-cost)が発生し、価格はバックアップが保存されるクラウドリージョンに基づきます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、**手動でバックアップを作成する方法**を説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="注記">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## Limits\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**が必要です。

- **バックアップに含まれないもの**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュール済みスケーリング設定

- **クラスターのシャード設定**: バックアップされますが、クラスターの CU サイズが縮小された場合、CU ごとのシャード数制限により、復元時に調整されることがあります。詳細は [Zilliz Cloud の制限](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 同時にアクティブまたは保留中にできる**手動バックアップは 1 つのみ**です。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの進行中は、手動バックアップを開始できません。

        - 手動バックアップがすでに進行中でも、自動バックアップは実行されます。

## クラスターバックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元できます。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### Web コンソールを使用する場合\{#via-web-console}

以下のデモは、Zilliz Cloud Web コンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API を使用する場合\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細は、[Create Backup](/reference/restful/create-backup-v2)を参照してください。

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

## コレクションバックアップの作成\{#create-collection-backup}

クラスター内の特定のコレクションまたは複数のコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### Web コンソールを使用する場合\{#via-web-console}

以下のデモは、Web コンソールでコレクションバックアップを作成する方法を示しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API を使用する場合\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細は、[Create Backup](/reference/restful/create-backup-v2)を参照してください。

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

バックアップ時間はデータサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれている場合、処理にやや時間がかかることがあります。

### バックアップ中に DDL（Data Definition Language）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの進行中は、コレクションの作成や削除などの大規模な DDL（Data Definition Language）操作は避けることをお勧めします。これらの操作はプロセスに干渉したり、一貫性のない結果を招いたりする可能性があります。

### 元のクラスターが削除された場合、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスターとともに削除されます。一方、手動のクラスターバックアップは永続的に保持され、クラスターが削除されても削除されません。不要になった場合は、手動で削除する必要があります。

### 暗号化されたクラスターをバックアップするとどうなりますか？\{#what-will-happen-if-i-back-up-an-encrypted-cluster}

暗号化されたクラスターをバックアップすると、暗号化範囲内のすべてのデータは暗号化されたまま保持され、**Backup File** 列の名前の横に鍵アイコンが表示されます。

![TiPxbigzIo8wUQxsJ9wcOP3pnAb](https://zdoc-images.s3.us-west-2.amazonaws.com/tipxbigzio8wuqxsj9wcop3pnab.png "TiPxbigzIo8wUQxsJ9wcOP3pnAb")

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元前にデータを復号します。そのため、暗号化ありでもなしでも、新しいクラスターにバックアップを復元できます。 

詳細は、[暗号化されたバックアップからの復元](./restore-from-backup-files#restore-from-an-encrypted-backup-file)を参照してください。


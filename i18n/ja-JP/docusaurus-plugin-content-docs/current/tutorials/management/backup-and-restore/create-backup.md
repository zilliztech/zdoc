---
title: "バックアップを作成 | Cloud"
slug: /create-backup
sidebar_label: "バックアップを作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元できます。 | Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップを作成

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元できます。

バックアップの作成には追加の[料金](./storage-cost)が発生し、価格はバックアップの保存先クラウドリージョンに基づいて決まります。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、**手動でバックアップを作成する**方法を説明します。バックアップ作成を自動化するには、[自動バックアップをスケジュールする](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ **カスタムロール** が必要です。

- **バックアップ対象外**:

    - コレクション TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュールスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターの CU サイズが縮小された場合、CU あたりのシャード制限により復元時に調整されることがあります。詳細は [Zilliz Cloud の制限](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - **手動バックアップ**は、同時に **1 つのみ**アクティブまたは保留状態にできます。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの実行中は手動バックアップを開始できません。

        - 手動バックアップがすでに実行中であっても、自動バックアップは引き続き実行されます。

## クラスターバックアップを作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元できます。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンにコピーする](./backup-to-other-regions)を参照してください。

### Web コンソール経由\{#via-web-console}

以下のデモは、Zilliz Cloud Web コンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細は、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

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

## コレクションバックアップを作成\{#create-collection-backup}

クラスター内の特定のコレクションまたはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンにコピーする](./backup-to-other-regions)を参照してください。

### Web コンソール経由\{#via-web-console}

以下のデモは、Web コンソールでコレクションバックアップを作成する方法を示しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細は、[Create Backup](/reference/restful/create-backup-v2) を参照してください。

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

## よくある質問\{#faqs}

### バックアップジョブにはどのくらい時間がかかりますか？\{#how-long-does-a-backup-job-take}

バックアップ時間はデータサイズに依存します。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれている場合、処理にやや時間がかかることがあります。

### バックアップ中に DDL（Data Definition Language）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの進行中は、コレクションの作成や削除などの主要な DDL（Data Definition Language）操作は避けることを推奨します。これらはプロセスに干渉したり、一貫性のない結果につながったりする可能性があります。

### 元のクラスターを削除した場合、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスターとともに削除されます。一方、手動のクラスターバックアップは永続的に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。

### 暗号化されたクラスターをバックアップするとどうなりますか？\{#what-will-happen-if-i-back-up-an-encrypted-cluster}

暗号化されたクラスターをバックアップすると、暗号化対象範囲内のすべてのデータは暗号化されたままとなり、**バックアップファイル**列の名前の横に鍵アイコンが表示されます。

![TiPxbigzIo8wUQxsJ9wcOP3pnAb](https://zdoc-images.s3.us-west-2.amazonaws.com/tipxbigzio8wuqxsj9wcop3pnab.png "TiPxbigzIo8wUQxsJ9wcOP3pnAb")

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元前にデータを復号します。そのため、暗号化の有無にかかわらず、新しいクラスターにバックアップを復元できます。 

詳細は、[暗号化されたバックアップから復元する](./restore-from-backup-files#restore-from-an-encrypted-backup-file)を参照してください。


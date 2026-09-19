---
title: "バックアップの作成 | Cloud"
slug: /create-backup
sidebar_label: "バックアップの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップとはデータのコピーであり、データ損失やシステム障害が発生した際にクラスター全体または特定のコレクションを復元するために使用できるものです。 | Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップの作成

Zilliz Cloud では、バックアップとはデータのコピーであり、データ損失やシステム障害が発生した際にクラスター全体または特定のコレクションを復元するために使用できるものです。

バックアップの作成には追加の[料金](./storage-cost)が発生し、その料金はバックアップの保存先となるクラウドリージョンによって決まります。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` にあるクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、**手動でバックアップを作成する**方法を説明します。バックアップの作成を自動化するには、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

<Admonition type="info" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップから除外される項目**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュールされたスケーリングの設定

- **クラスターシャード設定**: バックアップされますが、クラスターの CU サイズが縮小された場合は、CU あたりのシャード数の制限により復元中に調整されることがあります。詳細は [Zilliz Cloud の制限事項](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 同時に実行または保留できる**手動バックアップは 1 つだけ**です。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの実行中は、手動バックアップを開始できません。

        - 手動バックアップがすでに実行中の場合でも、自動バックアップは実行されます。

- 請求書の未払いにより組織が凍結されると、バックアップは凍結から 60 日後に自動的に削除されます。

## クラスターバックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成でき、後からクラスター全体または選択したコレクションを復元できます。ディザスタリカバリのためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップの作成時にコピーポリシーを構成できます。詳細は[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### Web コンソールを使用する場合\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールでクラスターバックアップを作成する方法を紹介します。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API を使用する場合\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

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

以下は出力例です。バックアップジョブが生成されるので、[プロジェクトのジョブセンター](./job-center)で進捗状況を確認できます。

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

クラスター内の特定のコレクションまたは一部のコレクションをバックアップするには、コレクションレベルのバックアップを作成します。ディザスタリカバリのためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップの作成時にコピーポリシーを構成できます。詳細は[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### Web コンソールを使用する場合\{#via-web-console}

以下のデモでは、Web コンソールでコレクションバックアップを作成する方法を紹介します。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API を使用する場合\{#via-restful-api}

次の例では、クラスター `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

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

以下は出力例です。バックアップジョブが生成されるので、[プロジェクトのジョブセンター](./job-center)で進捗状況を確認できます。

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

### バックアップジョブにはどのくらいの時間がかかりますか？\{#how-long-does-a-backup-job-take}

バックアップの所要時間はデータのサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれている場合、処理に少し時間がかかることがあります。

### バックアップ中に DDL（データ定義言語）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップの実行中は、コレクションの作成や削除などの重大な DDL（データ定義言語）操作を避けることを推奨します。これらの操作はバックアップ処理に影響を与えたり、一貫性のない結果を招いたりする可能性があります。

### 元のクラスターを削除するとバックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスターとともに削除されます。ただし、手動で作成したクラスターバックアップは永続的に保持され、クラスターを削除しても削除されることはありません。不要になった場合は、手動で削除する必要があります。

### 暗号化されたクラスターをバックアップするとどうなりますか？\{#what-will-happen-if-i-back-up-an-encrypted-cluster}

暗号化されたクラスターをバックアップすると、暗号化スコープ内のすべてのデータは暗号化されたままとなり、**バックアップファイル**列の名前の横に鍵アイコンが表示されます。

![TiPxbigzIo8wUQxsJ9wcOP3pnAb](https://zdoc-images.s3.us-west-2.amazonaws.com/tipxbigzio8wuqxsj9wcop3pnab.png "TiPxbigzIo8wUQxsJ9wcOP3pnAb")

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用してデータを復号してから復元します。そのため、暗号化の有無にかかわらず、バックアップを新しいクラスターに復元できます。

詳細については、[暗号化されたバックアップからの復元](./restore-from-backup-files#restore-from-an-encrypted-backup-file)を参照してください。


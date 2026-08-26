---
title: "バックアップの作成 | Cloud"
slug: /create-backup
sidebar_key: create-backup
sidebar_label: "バックアップを作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元できます。 | Cloud"
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

Zilliz Cloud では、バックアップはデータのコピーであり、データ損失やシステム障害が発生した場合にクラスター全体または特定のコレクションを復元できるようにします。

バックアップの作成には追加の[料金](./storage-cost)が発生し、価格はバックアップが保存されるクラウドリージョンに基づいて決定されます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。例えば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、**手動でバックアップを作成する**方法について説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール設定](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用可能です。

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップから除外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターの CU サイズが縮小される場合、CU あたりのシャード数の制限により、復元時に調整される可能性があります。詳細については、[Zilliz Cloud 制限s](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 同時にアクティブまたは保留中の**手動バックアップ**は1つだけです。

    - **自動バックアップ**が有効な場合:

        - 自動バックアップの実行中は、手動バックアップを開始できません。

        - 手動バックアップの実行中でも、自動バックアップは引き続き実行されます。

- バックアップは、延滞請求書により組織が凍結されてから60日後に自動的に削除されます。

## クラスターバックアップの作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択したコレクションを復元できます。ディザスタリカバリのためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細については、[他のリージョンへのコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスターバックアップを作成する方法を示しています。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスター `in01-xxxxxxxxxxxxxx` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2)を参照してください。

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

バックアップジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

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

クラスタ内の特定のコレクションまたはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細については、[他のリージョンへのコピー](./backup-to-other-regions) を参照してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、ウェブコンソールでコレクションバックアップを作成する方法を示しています。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスタ `in01-xxxxxxxxxxxxxx` 内のコレクション `medium_articles` のバックアップを作成します。RESTful API の詳細については、[バックアップの作成](/reference/restful/create-backup-v2) を参照してください。

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

バックアップジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

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

### バックアップジョブにどのくらい時間がかかりますか？\{#how-long-does-a-backup-job-take}

バックアップの所要時間はデータのサイズによって異なります。参考までに、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 以上のコレクションが含まれている場合、処理が少し長くなることがあります。

### バックアップ中に DDL（データ定義言語）操作を実行できますか？\{#can-i-perform-ddl-data-definition-language-operations-during-a-backup}

バックアップ実行中は、コレクションの作成や削除などの主要な DDL（データ定義言語）操作を避けることを推奨します。これらの操作は処理を妨げたり、結果に不整合を生じさせたりする可能性があります。

### 元のクラスターを削除すると、バックアップファイルも削除されますか？\{#will-backup-files-be-deleted-if-the-original-cluster-is-dropped}

これはバックアップファイルの作成方法によって異なります。すべての [自動バックアップ](./schedule-automatic-backups) は元のクラスターとともに削除されます。ただし、手動のクラスターバックアップは永久に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。

### 暗号化されたクラスターをバックアップするとどうなりますか？\{#what-will-happen-if-i-back-up-an-encrypted-cluster}

暗号化されたクラスターをバックアップすると、暗号化スコープ内のすべてのデータは暗号化されたままとなり、**バックアップファイル**列の名前の横に鍵アイコンが表示されます。

![TiPxbigzIo8wUQxsJ9wcOP3pnAb](https://zdoc-images.s3.us-west-2.amazonaws.com/tipxbigzio8wuqxsj9wcop3pnab.png "TiPxbigzIo8wUQxsJ9wcOP3pnAb")

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元前にデータを復号します。そのため、暗号化の有無にかかわらず、新しいクラスターにバックアップを復元できます。

詳細については、[暗号化されたバックアップからの復元](./restore-from-backup-files#restore-from-an-encrypted-backup-file) を参照してください。


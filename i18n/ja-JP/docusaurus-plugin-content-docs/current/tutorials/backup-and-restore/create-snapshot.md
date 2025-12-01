---
title: "バックアップを作成 | Cloud"
slug: /create-snapshot
sidebar_label: "バックアップを作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、バックアップはデータのコピーであり、データ損失やシステム障害の際にクラスター全体または特定のコレクションを復元できるようにします。 | Cloud"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - バックアップ
  - オープンソースベクターデータベース
  - ベクターインデックス
  - オープンソースベクターデータベース
  - オープンソースベクターデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップを作成

Zilliz Cloudでは、バックアップはデータのコピーであり、データ損失やシステム障害の際にクラスター全体または特定のコレクションを復元できるようにします。

バックアップ作成には追加の[料金](./storage-cost)が発生し、価格はバックアップが保存されているクラウドリージョンに基づいて計算されます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2`のクラスターでは、バックアップも`AWS us-west-2`に保存されます。

このガイドでは、**手動でバックアップを作成する方法**を説明します。バックアップ作成を自動化するには、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**を持つユーザーである必要があります。

- **バックアップ対象外**:

    - コレクションTTL設定

    - デフォルトユーザー`db_admin`のパスワード（[リストア](./restore-from-snapshot)時に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターCUサイズが縮小された場合、シャード毎CU制限によりリストア時に調整される可能性があります。詳細は[Zilliz Cloudの制限](./limits#shards)を参照してください。

- **バックアップジョブ制限**:

    - 同時にアクティブまたは保留状態にできるのは**1つの手動バックアップ**のみです。

    - **自動バックアップ**が有効になっている場合:

        - 自動バックアップが進行中の間は、手動バックアップを開始できません。

        - 手動バックアップが進行中でも、自動バックアップは引き続き実行されます。

## クラスターバックアップを作成\{#create-cluster-backup}

クラスター全体のバックアップを作成し、後でクラスター全体または選択されたコレクションを復元できます。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンにコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールでクラスターバックアップを作成する方法を示すデモです。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、クラスター`in01-xxxxxxxxxxxxxx`のバックアップを作成する例です。RESTful APIの詳細については、[バックアップを作成](/reference/restful/create-backup-v2)を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${TOKEN}" \
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

## コレクションバックアップを作成\{#create-collection-backup}

クラスター内の特定のコレクションまたはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、バックアップ作成時にコピーポリシーを設定できます。詳細は、[他のリージョンにコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由\{#via-web-console}

以下は、ウェブコンソールでコレクションバックアップを作成する方法を示すデモです。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、クラスター`in01-xxxxxxxxxxxxxx`内のコレクション`medium_articles`のバックアップを作成する例です。RESTful APIの詳細については、[バックアップを作成](/reference/restful/create-backup-v2)を参照してください。

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

**バックアップジョブにどれくらい時間がかかりますか？**

バックアップの所要時間はデータのサイズによって異なります。参考までに、700 MBのバックアップには通常約1秒かかります。クラスターに1,000以上のコレクションが含まれている場合、処理に少し時間がかかることがあります。

**バックアップ中にDDL（データ定義言語）操作を実行できますか？**

バックアップが進行中の間は、コレクションの作成や削除などの主要なDDL（データ定義言語）操作を避けることを推奨します。これらはプロセスを妨げたり、不整合な結果をもたらす可能性があります。

**元のクラスターが削除された場合、バックアップファイルも削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は、元のクラスターとともに削除されます。しかし、手動で作成されたクラスターバックアップは永久に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。

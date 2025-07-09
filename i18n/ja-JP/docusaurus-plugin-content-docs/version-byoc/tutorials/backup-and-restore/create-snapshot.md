---
title: "バックアップを作成 | BYOC"
slug: /create-snapshot
sidebar_label: "バックアップを作成"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、バックアップとはデータのコピーであり、データの損失やシステム障害が発生した場合に、クラスタ全体または特定のコレクションを復元することができます。 | BYOC"
type: origin
token: HHXewT7wTiM1zqkySjHcMNX5n9b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップを作成

Zilliz Cloudでは、バックアップとはデータのコピーであり、データの損失やシステム障害が発生した場合に、クラスタ全体または特定のコレクションを復元することができます。 

バックアップの作成には、バックアップが保存されているクラウドリージョンに基づいた価格設定で、追加の[チャージ](./understand-cost#backup-cost)が発生します。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2`のクラスターは、バックアップが`AWS us-west-2`に保存されます。

このガイドでは、バックアップを手動で作成する方法について説明します。バックアップ作成を自動化するには、[自動バックアップをスケジュールする](./schedule-automatic-backups)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>バックアップと復元機能は、専用クラスターでのみ利用可能です。 </p>

</Admonition>

</exclude>

## 限界{#limits}

- アクセス制御:プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールが必要です。

- **バックアップから除外**:

    - コレクションのTTL設定

    - デフォルトユーザー`db_admin`のパスワード(新しいパスワードは[復元する](./restore-from-snapshot)中に生成されます)

- クラスターシャード設定:バックアップされますが、CUあたりのシャード制限によりクラスターCU体格が低下した場合、復元中に調整される可能性があります。詳細については、[Zillizクラウドの制限](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 一度にアクティブまたは保留中の手動バックアップは1つだけです。

    - **自動バックアップ**が有効になっている場合:

        - 自動バックアップが進行中の場合、手動バックアップを開始できません。

        - 手動バックアップが既に進行中の場合でも、自動バックアップは実行されます。

## クラスタバックアップの作成{#create-cluster-backup}

クラスタ全体のバックアップを作成し、後でクラスタ全体または選択したコレクションのいずれかを復元できます。

### ウェブコンソールから{#via-web-console}

次のデモでは、Zilliz Cloud Webコンソールでクラスタバックアップを作成する方法を示します。

<Supademo id="cmcske0x90dpa9st802gnvbz9" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、クラスタ`in01-xxxxxxxxxxxxxx`のバックアップを作成します。RESTful APIの詳細については、[バックアップを作成](/reference/restful/create-backup-v2)を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Content-Type: application/json" \
     --data-raw '{
            "backupType": "CLUSTER"
      }'
```

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗状況を確認できます。

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

## コレクションのバックアップを作成する{#create-collection-backup}

クラスター内の特定のコレクションまたはコレクションのサブセットをバックアップするには、コレクションレベルのバックアップを作成します。

### ウェブコンソールから{#via-web-console}

次のデモでは、Webコンソールでコレクションバックアップを作成する方法を示します。

<Supademo id="cmcskksub0dra9st8cy34b2vi" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、`in01-xxxxxxxxxxxxxx`クラスター内の`medium_articles`コレクションのバックアップを作成します。RESTful APIの詳細については、[バックアップを作成](/reference/restful/create-backup-v2)を参照してください。

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

以下は出力例です。バックアップジョブが生成され、[プロジェクトジョブセンター](./job-center)で進捗状況を確認できます。

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

## よくある質問(FAQ){#faqs}

バックアップジョブにはどのくらい時間がかかりますか?
バックアップの所要時間はデータの体格によって異なります。参考までに、700 MBのバックアップには通常約1秒かかります。クラスタに1,000以上のコレクションが含まれている場合、その過程には少し時間がかかる場合があります。

バックアップ中にDDL(データ定義言語)操作を実行できますか?
バックアップの実行中は、コレクションの作成や削除などの大規模なDDL(Data Definition Language)操作を避けることをお勧めします。これらの操作は、バックアップの過程を妨げたり、一貫性のない結果につながる可能性があります。

**元のクラスタが削除された場合、バックアップファイルは削除されますか?**

これはバックアップファイルの作成方法によって異なります。すべての[自動バックアップ](./schedule-automatic-backups)は元のクラスタとともに削除されます。ただし、手動のクラスタバックアップは永久に保持され、クラスタが削除されても削除されません。不要になった場合は手動で削除する必要があります。


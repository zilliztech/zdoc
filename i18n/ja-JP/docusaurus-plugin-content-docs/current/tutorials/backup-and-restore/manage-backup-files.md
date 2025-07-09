---
title: "バックアップファイルを管理する | Cloud"
slug: /manage-backup-files
sidebar_label: "バックアップファイルを管理する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法について説明します。 | Cloud"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - manage
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルを管理する

このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>バックアップと復元機能は、専用クラスターでのみ利用可能です。 </p>

</Admonition>

</exclude>

## 限界{#limits}

- アクセス制御:プロジェクト管理者、組織の所有者、またはバックアップ権限を持つカスタムロールが必要です。

## バックアップファイルを表示する{#view-backup-files}

完了または進行中のすべてのバックアップファイルのリストを閲覧可能で、詳細を確認できます。

### ウェブコンソールから{#via-web-console}

Zilliz Cloudのウェブコンソールですべてのバックアップファイルとその詳細を表示するには、左ナビゲーションの「バックアップ」をクリックしてください。

![Cdf2b3by2o6SlOxUhKXcbMrMnth](/img/Cdf2b3by2o6SlOxUhKXcbMrMnth.png)

### RESTful APIを使用する{#via-restful-api}

- すべてのバックアップファイルを表示する

    次の例では、プロジェクトIDもクラスターIDも指定されていないため、現在の組織内のすべてのバックアップファイルがリストされています。特定のプロジェクトまたはクラスターのバックアップを表示するには、リクエストに対応するプロジェクトIDまたはクラスターIDを含めてください。RESTful APIの詳細については、[リストバックアップ](/reference/restful/list-backups-v2)を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

以下は出力例です。

- バックアップファイルの詳細を表示する

    以下の例では、バックアップファイルの詳細を確認します。RESTful APIの詳細については、[バックアップの説明](/reference/restful/describe-backup-v2)を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in01-3e5ad8adc38xxxx",
        "clusterName": "Dedicated-01",
        "regionId": "aws-us-west-2",
        "projectId": "proj-20e13e974c7d659a83xxxx",
        "backupId": "backup1_0b9d15a0ddexxxx",
        "backupName": "Dedicated-01_backup3",
        "backupType": "CLUSTER",
        "creationMethod": "AUTO",
        "status": "AVAILABLE",
        "size": 0,
        "collections": [],
        "createTime": "2024-08-26T02:27:51Z",
        "expireTime": "2024-09-02T02:27:51Z"
      }
    }
    ```

## バックアップファイルの名前を変更する{#rename-backup-files}

現在、バックアップファイルの名前変更はWebコンソールからのみサポートされています。

以下のデモでは、Zilliz Cloudウェブコンソールでバックアップファイルの名前を変更する方法を示しています。

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## バックアップファイルを削除する{#delete-backup-files}

バックアップの作成方法によって、Zilliz Cloudは削除を異なる方法で処理します

- **手動バックアップ**は、クラスタが削除されても永久に保持されます。コストを削減するために、バックアップが不要になった場合は手動で削除することをお勧めします。

- **自動バックアップ**は、保存期間が終了した後、または関連するクラスタが削除された後に自動的に削除されます。いつでも手動で削除することもできます。

### ウェブコンソールから{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでバックファイルを削除する方法を示しています。

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### RESTful APIを使用する{#via-restful-api}

以下の例では、バックアップファイルを削除します。RESTful APIの詳細については、[バックアップを削除](/reference/restful/delete-backup-v2)を参照してください。

```bash
curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json"
```

以下は出力例です。

```bash
{
  "code": 0,
  "data": {
    "backupId": "backup11_dbf5a40a6e5xxxx",
    "backupName": "medium_articles_backup4"
  }
}
```


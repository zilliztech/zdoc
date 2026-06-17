---
title: "バックアップファイルの管理 | Cloud"
slug: /manage-backup-files
sidebar_key: manage-backup-files
sidebar_label: "バックアップファイルを管理"
beta: FALSE
notebook: FALSE
description: "このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法を説明します。"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - backup
  - manage

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルの管理

このガイドでは、既存のバックアップファイルの表示、名前変更、削除の方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールである必要があります。

## バックアップファイルの表示\{#view-backup-files}

すべてのバックアップファイル（完了済みまたは進行中）の一覧を表示し、その詳細を確認できます。

### ウェブコンソール経由\{#via-web-console}

Zilliz Cloud ウェブコンソールですべてのバックアップファイルとその詳細を表示するには、左側のナビゲーションから「Backups」をクリックします。

![Cdf2b3by2o6SlOxUhKXcbMrMnth](https://zdoc-images.s3.us-west-2.amazonaws.com/cdf2b3by2o6sloxuhkxcbmrmnth.png "Cdf2b3by2o6SlOxUhKXcbMrMnth")

### RESTful API経由\{#via-restful-api}

- すべてのバックアップファイルを表示

    次の例では、プロジェクト ID もクラスター ID も指定されていないため、現在の組織内のすべてのバックアップファイルを一覧表示します。特定のプロジェクトまたはクラスターのバックアップを表示するには、リクエストに対応するプロジェクト ID またはクラスター ID を含めてください。RESTful API の詳細については、[List Backups](/reference/restful/list-backups-v2) を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

- バックアップファイルの詳細を表示する

    次の例では、バックアップファイルの詳細を確認します。RESTful API の詳細については、[Describe Backup](/reference/restful/describe-backup-v2) を参照してください。

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
        "clusterId": "in01-31a6b840e50b72d",
        "clusterName": "Dedicated-01",
        "projectId": "proj-b44a39b0c51cf21791a841",
        "backupId": "backup0_1e3c0988ecb7f0d",
        "backupName": "Dedicated-01_backup1",
        "backupType": "CLUSTER", // cluster/collection
        "creationMethod": "MANUAL", // auto/manual
        "status": "AVAILABLE",
        "size": 112, // unit: B
        "regionId": "aws-us-west-2",
        "expireTime": "2024-08-30T16:49:50Z",
        "collections": [
           {
               "collectionName": "medium_articles",
               "description": "Sample collection",
               "status": "LOADED" // LOADED/UNLOADED
           }
         ],
         "dbCollections": [
            {
              "dbName": "",
              "collections": [
               {
                   "collectionName": "medium_articles",
                   "description": "Sample collection",
                   "status": "LOADED" // LOADED/UNLOADED
               }
               ]
            }
         ],
        "createTime": "2024-07-30T16:49:50Z",
        "restoreNewInstancePolicies": [
                "LATEST",
                "ORIGINAL"
             ]
      }
    }
    ```

## バックアップファイルの名前変更\{#rename-backup-files}

現在、バックアップファイルの名前変更はウェブコンソール経由でのみサポートされています。

以下のデモでは、Zilliz Cloud ウェブコンソールでバックアップファイルの名前を変更する方法を示しています。

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## バックアップファイルの削除\{#delete-backup-files}

Zilliz Cloud は、バックアップの作成方法に応じて削除を異なる方法で処理します。

- **手動バックアップ**は、クラスターが削除されても永久に保持されます。コストを削減するため、不要になったバックアップは手動で削除することをお勧めします。

- **自動バックアップ**は、保持期間が終了するか、関連するクラスターが削除されると自動的に削除されます。また、いつでも手動で削除することもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでバックアップファイルを削除する方法を示しています。

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルを削除します。RESTful API の詳細については、[バックアップの削除](/reference/restful/delete-backup-v2) を参照してください。

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

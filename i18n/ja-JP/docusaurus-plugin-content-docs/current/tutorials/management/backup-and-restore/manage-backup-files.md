---
title: "バックアップファイルの管理 | Cloud"
slug: /manage-backup-files
sidebar_label: "バックアップファイルの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法について説明します。 | Cloud"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルの管理

このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限\{#limits}

- **アクセス制御**: project admin、organization owner、またはバックアップ権限を持つカスタムロールである必要があります。

## バックアップファイルの表示\{#view-backup-files}

完了済みまたは進行中を問わず、すべてのバックアップファイルの一覧を表示し、その詳細を確認できます。

### Web コンソールから\{#via-web-console}

Zilliz Cloud の Web コンソールでバックアップファイルとその詳細をすべて表示するには、左側のナビゲーションで「Backups」をクリックします。

![Cdf2b3by2o6SlOxUhKXcbMrMnth](https://zdoc-images.s3.us-west-2.amazonaws.com/cdf2b3by2o6sloxuhkxcbmrmnth.png "Cdf2b3by2o6SlOxUhKXcbMrMnth")

### RESTful API 経由\{#via-restful-api}

- すべてのバックアップファイルを表示

    次の例では、project ID も cluster ID も指定していないため、現在の organization 内のすべてのバックアップファイルを一覧表示します。特定の project またはクラスターのバックアップを表示するには、リクエストに対応する project ID または cluster ID を含めてください。RESTful API の詳細については、[List Backups](/reference/restful/list-backups-v2) を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

以下は出力例です。

- バックアップファイルの詳細を表示

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
        "clusterName": "Dediacted-01",
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

現在、バックアップファイルの名前変更は Web コンソールでのみサポートされています。

次のデモでは、Zilliz Cloud の Web コンソールでバックアップファイルの名前を変更する方法を示します。

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## バックアップファイルの削除\{#delete-backup-files}

Zilliz Cloud では、バックアップの作成方法に応じて削除の扱いが異なります。

- **手動バックアップ** は、クラスターが削除された場合でも永続的に保持されます。コストを削減するため、不要になったバックアップは手動で削除することを推奨します。

- **自動バックアップ** は、保持期間が終了した後、または関連付けられたクラスターが削除されたときに自動的に削除されます。また、いつでも手動で削除することもできます。

### Web コンソールから\{#via-web-console}

次のデモでは、Zilliz Cloud の Web コンソールでバックアップファイルを削除する方法を示します。

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、バックアップファイルを削除します。RESTful API の詳細については、[Delete Backup](/reference/restful/delete-backup-v2) を参照してください。

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

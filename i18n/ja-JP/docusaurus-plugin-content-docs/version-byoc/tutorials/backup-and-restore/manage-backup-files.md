---
title: "バックアップファイルの管理 | BYOC"
slug: /manage-backup-files
sidebar_label: "バックアップファイルの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、既存のバックアップファイルの表示、名前の変更、削除方法を説明します。 | BYOC"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 6
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ
  - 管理
  - HNSWアルゴリズム
  - ベクトル類似検索
  - 近似最近傍検索
  - DiskANN

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルの管理

このガイドでは、既存のバックアップファイルの表示、名前の変更、削除方法を説明します。

## 制限事項\{#limits}

- **アクセス制御**: プロジェクト管理者、組織の所有者、またはバックアップ権限を持つカスタムロールである必要があります。

## バックアップファイルの表示\{#view-backup-files}

完了または進行中のすべてのバックアップファイルのリストを表示し、その詳細を確認できます。

### ウェブコンソール経由\{#via-web-console}

Zilliz Cloudウェブコンソールですべてのバックアップファイルとその詳細を表示するには、左側のナビゲーションで「Backups」をクリックします。

![Cdf2b3by2o6SlOxUhKXcbMrMnth](/img/Cdf2b3by2o6SlOxUhKXcbMrMnth.png)

### RESTful API経由\{#via-restful-api}

- すべてのバックアップファイルを表示

    以下の例では、プロジェクトIDまたはクラスターIDが指定されていないため、現在の組織のすべてのバックアップファイルを一覧表示します。特定のプロジェクトまたはクラスターのバックアップを表示するには、リクエストに該当するプロジェクトIDまたはクラスターIDを含めてください。RESTful APIの詳細については、[バックアップのリスト](/reference/restful/list-backups-v2)を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

以下は出力例です。

- バックアップファイルの詳細を表示

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

## バックアップファイルの名前変更\{#rename-backup-files}

現在のところ、バックアップファイルの名前変更はウェブコンソール経由でのみサポートされています。

以下のデモでは、Zilliz Cloudウェブコンソールでバックアップファイルの名前を変更する方法を示しています。

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## バックアップファイルの削除\{#delete-backup-files}

Zilliz Cloudでは、バックアップの作成方法に応じて削除方法が異なります：

- **手動バックアップ**はクラスターが削除された場合でも永久に保持されます。コストを削減するため、不要になったら手動でバックアップを削除することをお勧めします。

- **自動バックアップ**は保持期間が終了した後または関連するクラスターが削除された後に自動的に削除されます。いつでも手動で削除することもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールでバックアップファイルを削除する方法を示しています。

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルを削除します。RESTful APIの詳細については、[バックアップの削除](/reference/restful/delete-backup-v2)を参照してください。

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
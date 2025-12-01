---
title: "バックアップファイルを管理 | Cloud"
slug: /manage-backup-files
sidebar_label: "バックアップファイルを管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法を説明します。 | Cloud"
type: origin
token: Ml6dwBPTfiQOY9koK24cT1Sznge
sidebar_position: 6
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - バックアップ
  - 管理
  - 埋め込みモデル
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルを管理

このガイドでは、既存のバックアップファイルを表示、名前変更、削除する方法を説明します。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールを持つユーザーである必要があります。

## バックアップファイルを表示\{#view-backup-files}

完了したバックアップファイルまたは進行中のバックアップファイルのすべてのリストを表示し、その詳細を確認できます。

### ウェブコンソール経由\{#via-web-console}

Zilliz Cloudウェブコンソールですべてのバックアップファイルとその詳細を表示するには、左側のナビゲーションで「バックアップ」をクリックします。

![Cdf2b3by2o6SlOxUhKXcbMrMnth](/img/Cdf2b3by2o6SlOxUhKXcbMrMnth.png)

### RESTful API経由\{#via-restful-api}

- すべてのバックアップファイルを表示

    以下の例では、プロジェクトIDもクラスターIDも指定されていないため、現在の組織内のすべてのバックアップファイルをリスト表示します。特定のプロジェクトまたはクラスターのバックアップを表示するには、リクエストに該当するプロジェクトIDまたはクラスターIDを含めてください。RESTful APIの詳細については、[バックアップのリスト](/reference/restful/list-backups-v2)を参照してください。

    ```bash
    curl --request GET \
         --url "${BASE_URL}/v2/backups" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json"
    ```

以下は出力例です。

- バックアップファイルの詳細を表示

    以下の例では、バックアップファイルの詳細を確認します。RESTful APIの詳細については、[バックアップの詳細](/reference/restful/describe-backup-v2)を参照してください。

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

## バックアップファイルの名前を変更\{#rename-backup-files}

現在のところ、バックアップファイルの名前変更はウェブコンソール経由でのみサポートされています。

以下は、Zilliz Cloudウェブコンソールでバックアップファイルの名前を変更する方法を示すデモです。

<Supademo id="cmcsspyv70hpq9st8rz5ro3qa" title=""  />

## バックアップファイルを削除\{#delete-backup-files}

Zilliz Cloudでは、バックアップの作成方法に応じて削除を処理します：

- **手動バックアップ**はクラスターが削除された後でも永久に保持されます。コストを削減するため、不要になった時点で手動でバックアップを削除することを推奨します。

- **自動バックアップ**は保持期間が終了した後または関連するクラスターが削除された後で自動的に削除されます。また、いつでも手動で削除することも可能です。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールでバックアップファイルを削除する方法を示すデモです。

<Supademo id="cmcst9z5t0ics9st8bbvsrqkk" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、バックアップファイルを削除する例です。RESTful APIの詳細については、[バックアップを削除](/reference/restful/delete-backup-v2)を参照してください。

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

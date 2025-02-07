---
title: "バックアップファイルを表示する | Cloud"
slug: /view-snapshot-details
sidebar_label: "バックアップファイルを表示する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、自動または手動で作成されたバックアップファイルを表示する方法について説明します。 | Cloud"
type: origin
token: RjYAwee7ViHHPQkxxY3cA7Vynq9
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - files
  - view
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# バックアップファイルを表示する

このガイドでは、自動または手動で作成されたバックアップファイルを表示する方法について説明します。

## すべてのバックアップファイルを表示する{#}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view_all_backups](/img/ja-JP/view_all_backups.png)

</TabItem>
<TabItem value="Bash">

クラスタ用に作成されたバックアップファイルを一覧表示します。パラメータの詳細については、[List Backups](/reference/restful/list-backups-v2)を参照してください。

```bash
curl --request GET \
     --url "${BASE_URL}/v2/backups" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

予想される出力:

```bash
{
  "code": 0,
  "data": {
    "count": 10,
    "currentPage": 1,
    "pageSize": 10,
    "backups": [
      {
        "backupId": "backup1_0b9d15a0ddexxxx",
        "projectId": "proj-20e13e974c7d659a83xxxx",
        "backupName": "Dedicated-01_backup3",
        "backupType": "CLUSTER",
        "creationMethod": "AUTO",
        "status": "CREATING",
        "size": 0,
        "expireTime": "2024-09-02T02:27:51Z",
        "clusterId": "in01-3e5ad8adc38xxxx",
        "clusterName": "Dedicated-01",
        "createTime": "2024-08-26T02:27:51Z"
      },
      ...
    ]
  }
}
```

</TabItem>
</Tabs>

## バックアップファイルの詳細を表示する{#}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

![view_snapshot_details](/img/ja-JP/view_snapshot_details.png)

</TabItem>
<TabItem value="Bash">

特定のバックアップファイルの詳細を表示します。パラメータの詳細については、「[バックアップの説明](/reference/restful/describe-backup-v2)」を参照してください。

```bash
curl --request GET \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

予想される出力:

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

</TabItem>
</Tabs>

## 関連するトピック{#}

- [バックアップを作成](./create-snapshot)

- [自動バックアップをスケジュールする](./schedule-automatic-backups)

- [バックアップファイルからの復元](./restore-from-snapshot)

- [バックアップファイルを削除](./delete-snapshot)


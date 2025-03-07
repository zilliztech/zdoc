---
title: "バックアップファイルからの復元 | Cloud"
slug: /restore-from-snapshot
sidebar_label: "バックアップファイルからの復元"
beta: FALSE
notebook: FALSE
description: "このガイドでは、リストされたバックアップファイルからクラスタまたはコレクションを復元する方法を説明します。復元できるのは、利用可能な状態のバックアップファイルのみです。 | Cloud"
type: origin
token: JXb5w2vmQi0aHCkP7Ewca7i3ngb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - restore
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# バックアップファイルからの復元

このガイドでは、リストされたバックアップファイルからクラスタまたはコレクションを復元する方法を説明します。復元できるのは、**利用可能**な状態のバックアップファイルのみです。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- ターゲット組織で[組織所有者](./organization-users)または[プロジェクト管理者](./project-users)の役割が付与されていること。

- クラスターは**専用**レベルで実行されます。

## クラスタを復元する{#restore-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

[**バックアップ**]ページに移動し、ターゲットバックアップファイルを探します。クラスタを復元する必要がある場合は、ターゲットバックアップファイルの種類を[**クラスタ**]にします。をクリックします**。。。**[**アクション**]列で、[**クラスタの復元**]を選択します。

バックアップファイルから復元するクラスタの属性を設定します。

![restore_cluster](/img/ja-JP/restore_cluster.png)

これらの属性を設定する際には、次の点に注意してください:

- バックアップファイルから復元して、別のプロジェクトにターゲットクラスターを作成できますが、別のクラウドプロバイダーとリージョンには作成できません。

- ターゲットクラスター内のコレクションの負荷状態を保持することを選択できます。

- ターゲットクラスタの名前を変更し、CU体格とパスワードをリセットすることはできますが、CUタイプはできません。

- 

「**復元**」をクリックすると、Zilliz Cloudは指定された属性を持つターゲットクラスタの作成を開始し、バックアップファイル内のコレクションをターゲットクラスタに復元します。新しい復元ジョブが生成されます。クラスタの復元の進捗状況は「[ジョブ](./job-center)」ページで確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、復元が完了します。

</TabItem>
<TabItem value="Bash">

クラスタを復元します。パラメータの詳細については、[クラスタバックアップの復元](/reference/restful/restore-cluster-backup-v2)を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP"
      }'
```

予想される出力:

```bash
{
  "code": 0,
  "data": {
    "clusterId": "in01-4a96cde32afxxxx",
    "username": "db_admin",
    "password": "Th0]sT4137WOxxxx"
  }
}
```

</TabItem>
</Tabs>

## コレクションを復元する{#restore-a-collection}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

[**バックアップ**]ページに移動し、対象のバックアップファイルを探します。コレクションを復元する必要がある場合は、対象のバックアップファイルの種類を[**コレクション**]にします。をクリックします**。。。**[**アクション**]列で、[**コレクション**の復元]を選択します。

バックアップファイルから復元するコレクションの属性を設定します。

![restore_collection](/img/ja-JP/restore_collection.png)

これらの属性を設定する際には、次の点に注意してください:

- バックアップファイルから復元して、別のプロジェクトおよび実行中の別のクラスターにターゲットコレクションを作成できます。

- ターゲットコレクションをロードまたはアンロードすることができます。

- ターゲットコレクションの名前を変更できます。

「**リストア**」をクリックすると、Zilliz Cloudは指定した属性を持つターゲットコレクションの作成を開始します。新しいリストアジョブが生成されます。コレクションのリストアの進捗状況は「[ジョブ](./job-center)」ページで確認できます。ジョブのステータスが「**IN PROGRESS**」から「**SUCCESS FUL**」に切り替わると、リストアが完了します。

</TabItem>
<TabItem value="Bash">

コレクションを復元します。パラメータの詳細については、「[コレクションバックアップの復元](/reference/restful/restore-collection-backup-v2)」を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "targetClusterId": "in01-3e5ad8adc38xxxx",
        "dbCollections": [
           { 
            "collections": [
               {
                 "collectionName": "medium_articles",
                 "targetCollectionName": "restore_medium_articles",
                 "targetCollectionStatus": "LOADED"
               }
             ]
          }
        ]
      }'
```

予想される出力:

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

</TabItem>
</Tabs>

## 関連するトピック{#related-topics}

- [バックアップを作成](./create-snapshot)

- [自動バックアップをスケジュールする](./schedule-automatic-backups)

- [バックアップファイルを表示する](./view-snapshot-details)

- [バックアップファイルを削除](./delete-snapshot)


---
title: "バックアップを作成 | BYOC"
slug: /create-snapshot
sidebar_label: "バックアップを作成"
beta: FALSE
notebook: FALSE
description: "バックアップは、Zilliz Cloud上の管理されたクラスタまたは特定のコレクションのポイントオブタイムコピーです。新しいクラスタやコレクションのベースラインとして、またはデータバックアップとして使用できます。 | BYOC"
type: origin
token: EPjawOTTtigqJkkgDOecRXxGnpg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# バックアップを作成

バックアップは、Zilliz Cloud上の管理されたクラスタまたは特定のコレクションのポイントオブタイムコピーです。新しいクラスタやコレクションのベースラインとして、またはデータバックアップとして使用できます。

手動で作成されたバックアップはZilliz Cloudに永久に保持されるため、自動的に削除されることはありません。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- ターゲット組織で[組織所有者](./organization-users)または[プロジェクト管理者](./project-users)の役割が付与されていること。

## バックアップを作成する{#create-backup}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

次の図に基づいて、クラスタまたはコレクションのバックアップファイルを作成できます。クラスタはまだサービス中ですが、ZillizCloudはバックアップファイルを作成しています。

![create-snapshot](/byoc/ja-JP/create-snapshot.png)

</TabItem>
<TabItem value="Bash">

クラスタ全体または特定のコレクションのバックアップを作成できます。パラメータの詳細については、「[バックアップを作成](/reference/restful/create-backup-v2)する」を参照してください。

- クラスタ全体のバックアップを作成します。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxx"
    
    curl --request POST \
         --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Content-Type: application/json" \
         --data-raw '{
                "backupType": "CLUSTER"
          }'
    ```

    予想される出力:

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

- 特定のコレクションのバックアップを作成します。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxx"
    
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

    予想される出力:

    ```bash
    {
      "code": 0,
      "data": {
        "backupId": "backup11_4adb19e3f9exxxx",
        "backupName": "medium_articles_bacxxxx",
        "jobId": "job-039dbc113c5ozfwunvxxxx"
      }
    }
    ```

</TabItem>
</Tabs>

バックアップジョブが生成されます。[ジョブ](./job-center)ページでバックアップの進捗状況を確認できます。ジョブのステータスが**IN PROGRESS**から**SUCCESS FUL**に切り替わると、バックアップは正常に作成されます。

<Admonition type="info" icon="📘" title="ノート">

<p>同じクラスター内では、手動で作成されたバックアップジョブは1つしか実行中または保留中にできません。以前に要求されたジョブが完了したら、手動で別のバックアップファイルを作成できます。</p>

</Admonition>

バックアップを作成するのにかかる時間は異なることに注意してください。クラスタバックアップの場合、クラスタの体格とクラスタを収容するCUの体格によって異なります。例えば、4-CUインスタンス上の128次元ベクトルの1億2000万レコード以上を保持する単一コレクションクラスタは、バックアップファイルを作成するのに約5分かかります。

## バックアップファイルの保持期間を調整する{#adjust-backup-file-retention-period}

Zilliz Cloudがバックアップファイルを保存する期間は、**保存期間**を日数で設定することで決定できます。現在、デフォルトの保存期間は7日間で、最大30日間です。

## 関連するトピック{#related-topics}

- [自動バックアップをスケジュールする](./schedule-automatic-backups)

- [バックアップファイルを表示する](./view-snapshot-details)

- [バックアップファイルからの復元](./restore-from-snapshot)

- [バックアップファイルを削除](./delete-snapshot)


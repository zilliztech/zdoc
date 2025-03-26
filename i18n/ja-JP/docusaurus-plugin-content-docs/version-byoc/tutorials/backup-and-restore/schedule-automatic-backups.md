---
title: "自動バックアップをスケジュールする | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップをスケジュールする"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudを使用すると、クラスターの自動バックアップを有効にして、予期せぬ事故が発生した場合にデータを確実に復元できます。定期的なバックアップにより、データの損失を防止し、特定の時点まで簡単に復元できるため、データをより細かく制御できます。 | BYOC"
type: origin
token: NrdTw2pL0iwCcokgJ2Cc6cFunhc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - automatic
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 自動バックアップをスケジュールする

Zilliz Cloudを使用すると、クラスターの自動バックアップを有効にして、予期せぬ事故が発生した場合にデータを確実に復元できます。定期的なバックアップにより、データの損失を防止し、特定の時点まで簡単に復元できるため、データをより細かく制御できます。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- ターゲット組織で[組織所有者](./organization-users)または[プロジェクト管理者](./project-users)の役割が付与されていること。

## バックアップスケジュールを作成する{#create-backup-schedule}

<Tabs groupId="cluster"defaultValue="Cloud Console"value={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

バックアップスケジュールを作成するには、次の手順に従います。

1. クラスタの[**バックアップ**]タブに移動し、[**自動** **バックアップ**]をクリックします。

1. 表示される**自動バックアップ設定**ダイアログボックスで、**自動バックアップを有効**にします。

1. 自動バックアップの**頻度**、**バックアップ保持期間**、および時間枠を設定します。

![create-snapshot-schedule](/byoc/ja-JP/create-snapshot-schedule.png)

</TabItem>
<TabItem value="Bash">

定期的に自動バックアップを有効にするバックアップポリシーを設定できます。

以下のコードは、4つの特定の平日（月曜日、火曜日、水曜日、金曜日）にバックアップを実行するバックアップポリシーを作成します。パラメータの詳細については、「[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)」を参照してください。

```bash
curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "frequency": "1,2,3,5",
        "startTime": "02:00-04:00",
        "retentionDays": 7,
        "enabled": true
      }'
```

予想される出力:

```bash
{
  "code": 0,
  "data": {
    "clusterId": "in01-3e5ad8adc38xxxx",
    "status": "ENABLED"
  }
}
```

</TabItem>
</Tabs>

## 自動バックアップスケジュールを調整する{#adjust-automated-backup-schedule}

デフォルト設定では、Zilliz Cloudは毎日8時から10時の間（**頻度**）にクラスタのバックアップファイルを自動的に作成し、7日間（**保存期間）バックアップファイルを保持するように設定されています。必要に応じて設定を変更してください。**

<Admonition type="info" icon="📘" title="ノート">

<p>自動的に作成されたバックアップの最大保存期間は30日間です。</p>

</Admonition>

## 自動的に作成されたバックアップファイルを削除する{#delete-automatically-created-backup-file}

クラスタを削除すると、そのクラスタの自動作成されたバックアップファイルがすべて削除されます。また、自動作成されたバックアップファイルは、保存期間が終了すると削除されます。自動作成されたバックアップファイルを手動で削除する必要がある場合は、「[バックアップファイルを削除](./delete-snapshot)」を参照してください。

## 関連するトピック{#related-topics}

- [バックアップを作成](./create-snapshot)

- [バックアップファイルを表示する](./view-snapshot-details)

- [バックアップファイルからの復元](./restore-from-snapshot)

- [バックアップファイルを削除](./delete-snapshot)


---
title: "自動バックアップをスケジュールする | Cloud"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップをスケジュールする"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、cluster に対して自動バックアップを有効にでき、予期しない問題が発生した場合のデータ復旧に役立ちます。自動バックアップは cluster 全体に適用され、個別の collection を自動的にバックアップすることはサポートされていません。 | Cloud"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自動バックアップをスケジュールする

Zilliz Cloud では、cluster に対して **自動バックアップ** を有効にでき、予期しない問題が発生した場合のデータ復旧に役立ちます。自動バックアップは **cluster 全体** に適用され、個別の collection を自動的にバックアップすることはサポートされていません。

バックアップの作成には追加の[料金](./storage-cost)が発生し、価格はバックアップの保存先クラウドリージョンに基づいて決まります。すべてのバックアップファイルは、ソース cluster と同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` にある cluster のバックアップは `AWS us-west-2` に保存されます。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュールする方法について説明します。オンデマンドバックアップを作成するには、[バックアップを作成する](./create-backup)を参照してください。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** cluster でのみ利用できます。

</Admonition>

## 制限事項\{#limits}

- **アクセス制御**: **project admin**、**organization owner**、またはバックアップ権限を持つ **custom role** が必要です。

- **バックアップ対象外**:

    - Collection TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - Cluster の動的スケーリング設定およびスケジュールスケーリング設定

- **Cluster shard 設定**: バックアップされますが、cluster の CU サイズが縮小された場合、CU あたりの shard 数制限により復元時に調整されることがあります。詳細は [Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップの実行中は、手動バックアップを開始できません。

    - すでに手動バックアップが進行中であっても、自動バックアップは実行されます。

## 自動バックアップを有効にする\{#enable-automatic-backup}

自動バックアップ設定は cluster ごとに管理され、**デフォルトでは無効** です。バックアップにはストレージコストが発生するため、Zilliz Cloud がいつどのようにバックアップを作成するかを制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初回バックアップを生成し、その後、指定したスケジュールに基づいて定期的にバックアップを作成します。

災害復旧のためにバックアップファイルを他のクラウドリージョンへコピーする必要がある場合は、自動バックアップを有効にする際にコピーのポリシーを設定できます。詳細は [他のリージョンにコピーする](./backup-to-other-regions) を参照してください。

### Web コンソール経由\{#via-web-console}

以下のデモでは、自動バックアップを有効にして設定する方法を示します。

<Supademo id="cmcsqvpfk0gns9st8bd3faaje" title=""  />

<Procedures>

1. 対象の cluster に移動します。

1. **Backups** タブをクリックします。

1. **Backup Policy** カードのスイッチをオンにします。

1. バックアップスケジュールを設定します。

    - **Timezone**: スケジュールされたバックアップイベントをトリガーする際に使用されるタイムゾーンです。

    - **Schedule**: 次のいずれかのモードを選択してスケジュールを定義します。

        - **Basic**: 頻度（毎週または毎月）を選択し、次に日付と時刻を選択します。

        - **Advanced**: cron 式を入力してスケジュールを定義します。詳細は [Cron 式について理解する](./cron-expression) を参照してください。

1. （任意）[クロスリージョンバックアップ](./backup-to-other-regions)機能を有効にすることもできます。

1. **Save** をクリックします。

</Procedures>

### RESTful API 経由\{#via-restful-api}

次の例では、cluster に対して自動バックアップを有効にします。RESTful API の詳細は、[Set Backup Policy](/reference/restful/set-backup-policy-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "frequency": "1,2,3,5",
    "startTime": "02:00-04:00",
    "retentionDays": 7,
    "enabled": true
}'
```

上記のポリシーを使用して作成されるすべてのバックアップに対してクロスリージョンコピーも作成するには、次のようにします。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "frequency": "1,2,3,5",
    "startTime": "02:00-04:00",
    "retentionDays": 7,
    "enabled": true,
    "crossRegionPolicies": [
        {
            "regionId": "aws-us-west-2",
            "retentionDays": 7,
            "region": "us-west-2"
        },
        {
            "regionId": "aws-us-east-1",
            "retentionDays": 7,
            "region": "us-east-1"
        }
    ]
}'
```

以下は出力例です。自動バックアップが有効になると、バックアップジョブがすぐに生成されます。進行状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## バックアップスケジュールを確認する\{#check-backup-schedule}

自動バックアップが有効になっている場合、そのスケジュールを確認できます。

### Web コンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールで自動バックアップスケジュールを確認する方法を示します。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、cluster の自動バックアップポリシーを確認します。RESTful API の詳細は、[Get Backup Policy](/reference/restful/get-backup-policy-v2) を参照してください。

```bash
curl --request GET \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

以下は出力例です。 

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED",
        "startTime": "02:00-04:00",
        "frequency": "1,2,3,5",
        "retentionDays": 7,
        "crossRegionPolicies": [
            {
                "regionId": "aws-us-west-2",
                "retentionDays": 7,
                "region": "us-west-2"
            },
            {
                "regionId": "aws-us-east-1",
                "retentionDays": 7,
                "region": "us-east-1"
            }
        ]
    }
}
```

## 自動バックアップを無効にする\{#disable-automatic-backup}

cluster の自動バックアップを無効にすることもできます。

### Web コンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールで自動バックアップスケジュールを確認する方法を示します。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、cluster の自動バックアップを無効にします。RESTful API の詳細は、[Set Backup Policy](/reference/restful/set-backup-policy-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "enabled": false
}'
```

以下は出力例です。 

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "DISABLED"
    }
}
```

## FAQs\{#faqs}

**バックアップジョブにはどのくらい時間がかかりますか？**
バックアップ時間はデータサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。cluster に 1,000 を超える collection が含まれている場合、処理にやや長く時間がかかることがあります。

**バックアップ中に DDL（Data Definition Language）操作を実行できますか？**
バックアップの進行中に、collection の作成や削除などの大規模な DDL（Data Definition Language）操作は避けることを推奨します。これらは処理に干渉したり、一貫性のない結果につながったりする可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**

自動バックアップのデフォルトの保持期間は 7 日で、最大 30 日まで調整できます。

**元の cluster が削除された場合、バックアップファイルも削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての自動バックアップは、元の cluster とともに削除されます。一方、[手動の cluster バックアップ](./create-backup)は永続的に保持され、cluster が削除されても削除されません。不要になった場合は手動で削除する必要があります。


---
title: "自動バックアップをスケジュールする | Cloud"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップをスケジュールする"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターに対して自動バックアップを有効にでき、予期しない問題が発生した場合のデータ復旧に役立ちます。自動バックアップはクラスター全体に適用され、個々のコレクションを自動でバックアップすることはサポートされていません。 | Cloud"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自動バックアップをスケジュールする

Zilliz Cloud では、クラスターに対して **自動バックアップ** を有効にでき、予期しない問題が発生した場合のデータ復旧に役立ちます。自動バックアップは **クラスター全体** に適用され、個々のコレクションを自動でバックアップすることはサポートされていません。

バックアップの作成には追加の[料金](./storage-cost)が発生し、料金はバックアップが保存されるクラウドリージョンに基づいて決まります。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュールする方法を説明します。オンデマンドバックアップを作成するには、[バックアップを作成する](./create-backup)を参照してください。

<Admonition type="info" icon="📘" title="注意">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ **カスタムロール** である必要があります。

- **バックアップ対象外**:

    - コレクション TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的スケーリング設定およびスケジュールスケーリング設定

- **クラスターのシャード設定**: バックアップされますが、クラスターの CU サイズが縮小された場合、CU ごとのシャード数制限により、復元時に調整されることがあります。詳細は [Zilliz Cloud Limits](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップの進行中は手動バックアップを開始できません。

    - 手動バックアップがすでに進行中であっても、自動バックアップは実行されます。

## 自動バックアップを有効にする\{#enable-automatic-backup}

自動バックアップ設定はクラスターごとに設定され、**デフォルトでは無効** です。バックアップにはストレージコストが発生するため、Zilliz Cloud がいつどのようにバックアップを作成するかを制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初回バックアップを生成し、その後、指定したスケジュールに基づいて定期的にバックアップを作成します。

災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、自動バックアップを有効にする際にコピーポリシーを設定できます。詳細は [他のリージョンにコピーする](./backup-to-other-regions) を参照してください。

### Web コンソール経由\{#via-web-console}

次のデモでは、自動バックアップを有効化して設定する方法を示します。

<Supademo id="cmcsqvpfk0gns9st8bd3faaje" title=""  />

<Procedures>

1. 対象のクラスターに移動します。

1. **Backups** タブをクリックします。

1. **Backup Policy** カードのスイッチをオンにします。

1. バックアップスケジュールを設定します。

    - **Timezone**: スケジュールされたバックアップイベントをトリガーする際に使用されるタイムゾーンです。

    - **Schedule**: 次のいずれかのモードを選択してスケジュールを定義します。

        - **Basic**: 頻度（毎週または毎月）を選択し、次に曜日または日付と時刻を選択します。

        - **Advanced**: cron 式を入力してスケジュールを定義します。詳細は [Cron 式を理解する](./cron-expression) を参照してください。

1. （任意）[クロスリージョンバックアップ](./backup-to-other-regions)機能を有効にすることもできます。

1. **Save** をクリックします。

</Procedures>

### RESTful API 経由\{#via-restful-api}

次の例では、クラスターの自動バックアップを有効にします。RESTful API の詳細は、[バックアップポリシーを設定する](/reference/restful/set-backup-policy-v2)を参照してください。

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

以下は出力例です。自動バックアップが有効になると、バックアップジョブが即座に生成されます。進行状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

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

自動バックアップを有効にすると、そのスケジュールを確認できます。

### Web コンソール経由\{#via-web-console}

次のデモでは、Zilliz Cloud Web コンソールで自動バックアップスケジュールを確認する方法を示します。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスターの自動バックアップポリシーを確認します。RESTful API の詳細は、[バックアップポリシーを取得する](/reference/restful/get-backup-policy-v2)を参照してください。

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

クラスターの自動バックアップを無効にすることもできます。

### Web コンソール経由\{#via-web-console}

次のデモでは、Zilliz Cloud Web コンソールで自動バックアップスケジュールを確認する方法を示します。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例では、クラスターの自動バックアップを無効にします。RESTful API の詳細は、[バックアップポリシーを設定する](/reference/restful/set-backup-policy-v2)を参照してください。

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

## FAQ\{#faqs}

**バックアップジョブにはどのくらい時間がかかりますか？**
バックアップ時間はデータサイズに依存します。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれている場合は、処理にやや時間がかかることがあります。

**バックアップ中に DDL（Data Definition Language）操作を実行できますか？**
バックアップの進行中は、コレクションの作成や削除などの主要な DDL（Data Definition Language）操作は避けることを推奨します。これらの操作はプロセスに干渉したり、一貫性のない結果を引き起こしたりする可能性があります。

**自動バックアップファイルの保持期間はどれくらいですか？**

自動バックアップのデフォルトの保持期間は 7 日間で、最大 30 日まで調整できます。

**元のクラスターが削除された場合、バックアップファイルも削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての自動バックアップは元のクラスターとともに削除されます。一方で、[手動クラスター バックアップ](./create-backup)は永続的に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。


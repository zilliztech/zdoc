---
title: "自動バックアップのスケジュール設定 | Cloud"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターの自動バックアップを有効化し、予期しない障害発生時のデータ復旧に備えることができます。自動バックアップはクラスター全体が対象であり、個別のコレクションを自動的にバックアップする機能はサポートされていません。 | Cloud"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自動バックアップのスケジュール設定

Zilliz Cloud では、クラスターの**自動バックアップ**を有効化し、予期しない障害発生時のデータ復旧に備えることができます。自動バックアップは**クラスター全体**が対象であり、個別のコレクションを自動的にバックアップする機能はサポートされていません。

バックアップの作成には追加の[料金](./storage-cost)が発生します。料金はバックアップの保存先クラウドリージョンによって異なります。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュールする方法を説明します。オンデマンドでバックアップを作成する場合は、[Create Backup](./create-backup) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**のいずれかである必要があります。

- **バックアップ対象外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよびスケジュールスケーリング設定

- **クラスターシャード設定**: バックアップに含まれますが、復元時にクラスターの CU サイズが縮小される場合、CU あたりのシャード数制限により調整されることがあります。詳細については、[Zilliz Cloud の制限事項](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップの実行中は、手動バックアップを開始できません。

    - 手動バックアップが実行中の場合でも、自動バックアップは通常通り実行されます。

- 組織が凍結されると、その 60 日後にバックアップは自動的に削除されます。

## 自動バックアップの有効化\{#enable-automatic-backup}

自動バックアップの設定はクラスターごとに独立しており、**デフォルトでは無効**になっています。バックアップにはストレージコストがかかるため、Zilliz Cloud がバックアップを作成するタイミングや方法を柔軟に制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初期バックアップを作成し、その後は指定したスケジュールに従って定期的にバックアップを実行します。

ディザスタリカバリを目的としてバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、自動バックアップの有効化時にコピーポリシーを設定できます。詳細については、[Copy To Other Regions](./backup-to-other-regions) を参照してください。

### Web コンソールでの操作\{#via-web-console}

以下のデモでは、自動バックアップを有効化および設定する手順を示します。

<Supademo id="cmcsqvpfk0gns9st8bd3faaje" title=""  />

<Procedures>

1. 対象のクラスターに移動します。

1. **Backups** タブをクリックします。

1. **Backup Policy** カードのスイッチをオンにします。

1. バックアップスケジュールを設定します。

    - **タイムゾーン**: スケジュールされたバックアップイベントのトリガーに使用されるタイムゾーンです。

    - **スケジュール**: 以下のいずれかのモードを選択してスケジュールを定義します。

        - **Basic**: 頻度（毎週または毎月）を選択した後、曜日と時刻を指定します。

        - **Advanced**: cron 式を入力してスケジュールを定義します。詳細については、[Understand Cron Expressions](./cron-expression) を参照してください。

1. （任意）[クロスリージョンバックアップ](./backup-to-other-regions)機能を有効にすることもできます。

1. **Save** をクリックします。

</Procedures>

### RESTful API での操作\{#via-restful-api}

以下の例では、クラスターの自動バックアップを有効にします。RESTful API の詳細については、[Set Backup Policy](/reference/restful/set-backup-policy-v2) を参照してください。

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

上記のポリシーで作成されたバックアップのクロスリージョンコピーも同時に作成するには、以下のように設定します。

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

以下は出力例です。自動バックアップを有効にすると、バックアップジョブが即座に生成されます。進行状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## バックアップスケジュールの確認\{#check-backup-schedule}

自動バックアップが有効になっている場合、そのスケジュールを確認できます。

### Web コンソールでの操作\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールで自動バックアップのスケジュールを確認する手順を示します。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API での操作\{#via-restful-api}

以下の例では、クラスターの自動バックアップポリシーを確認します。RESTful API の詳細については、[Get Backup Policy](/reference/restful/get-backup-policy-v2) を参照してください。

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

## 自動バックアップの無効化\{#disable-automatic-backup}

クラスターの自動バックアップを無効にすることもできます。

### Web コンソールでの操作\{#via-web-console}

以下のデモでは、Zilliz Cloud Web コンソールで自動バックアップのスケジュールを確認する手順を示します。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API での操作\{#via-restful-api}

以下の例では、クラスターの自動バックアップを無効にします。RESTful API の詳細については、[Set Backup Policy](/reference/restful/set-backup-policy-v2) を参照してください。

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

## よくある質問\{#faqs}

**バックアップジョブにはどのくらいの時間がかかりますか？**
バックアップ所要時間はデータサイズによって異なります。目安として、700 MB のデータのバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれる場合は、処理に若干時間がかかることがあります。

**バックアップ中に DDL（Data Definition Language）操作を実行できますか？**
バックアップの実行中は、コレクションの作成や削除といった大規模な DDL（Data Definition Language）操作を避けることを推奨します。これらの操作はバックアップ処理に干渉したり、結果の不整合を引き起こしたりする可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**

自動バックアップのデフォルト保持期間は 7 日間です。最大 30 日間まで延長できます。

**元のクラスターを削除した場合、バックアップファイルも削除されますか？**

バックアップファイルの作成方法によって異なります。自動バックアップはすべて、元のクラスターと同時に削除されます。一方、[手動で作成したクラスターバックアップ](./create-backup)は永続的に保持され、クラスター削除時にも自動的には削除されません。不要になった場合は手動で削除する必要があります。


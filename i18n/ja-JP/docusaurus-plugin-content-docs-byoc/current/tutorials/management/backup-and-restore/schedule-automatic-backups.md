---
title: "自動バックアップのスケジュール | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターの自動バックアップを有効化し、予期しない障害発生時のデータ復旧に備えることができます。自動バックアップはクラスター全体が対象であり、個別のコレクションを自動的にバックアップする機能はサポートされていません。 | BYOC"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 自動バックアップのスケジュール

Zilliz Cloud では、クラスターの**自動バックアップ**を有効化し、予期しない障害発生時のデータ復旧に備えることができます。自動バックアップは**クラスター全体**が対象であり、個別のコレクションを自動的にバックアップする機能はサポートされていません。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュールする方法について説明します。オンデマンドでバックアップを作成する場合は、[Create Backup](./create-backup) を参照してください。

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップ対象外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[restore](./restore-from-backup-files) 時に新しいパスワードが生成されます）

    - クラスターの動的スケーリングおよび定期スケーリングの設定

- **クラスターシャード設定**: バックアップに含まれますが、CU あたりのシャード数制限により、復元時にクラスターの CU サイズが縮小されている場合は調整される可能性があります。詳細については、[Zilliz Cloud の制限事項](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップの実行中は、手動バックアップを開始できません。

    - 手動バックアップが実行中の場合でも、自動バックアップは通常通り実行されます。

- 組織が凍結されると、その 60 日後にバックアップは自動的に削除されます。

## 自動バックアップの有効化\{#enable-automatic-backup}

自動バックアップの設定はクラスターごとに異なり、**デフォルトでは無効**になっています。バックアップにはストレージコストが発生するため、Zilliz Cloud がバックアップを作成するタイミングや方法を制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初期バックアップを作成し、その後は指定したスケジュールに従って定期的にバックアップを実行します。

### Web コンソールでの操作\{#via-web-console}

以下のデモでは、自動バックアップを有効化して設定する手順を示します。

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

以下は出力例です。自動バックアップを有効にすると、バックアップジョブが即座に作成されます。進捗状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

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
バックアップにかかる時間はデータサイズによって異なります。目安として、700 MB のデータのバックアップには通常約 1 秒かかります。クラスターに 1,000 を超えるコレクションが含まれる場合は、処理に若干時間がかかることがあります。

**バックアップ中に DDL（Data Definition Language）操作を実行できますか？**
バックアップの実行中は、コレクションの作成や削除といった大規模な DDL（Data Definition Language）操作を避けることを推奨します。これらの操作はバックアップ処理に干渉したり、不整合な結果を引き起こしたりする可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**

自動バックアップのデフォルトの保持期間は 7 日間ですが、最大 30 日間まで延長できます。

**元のクラスターを削除した場合、バックアップファイルも削除されますか？**

バックアップファイルの作成方法によって異なります。自動バックアップはすべて、元のクラスターとともに削除されます。一方、[手動で作成したクラスターバックアップ](./create-backup) は永続的に保持され、クラスターを削除しても消去されません。不要になった場合は、手動で削除する必要があります。


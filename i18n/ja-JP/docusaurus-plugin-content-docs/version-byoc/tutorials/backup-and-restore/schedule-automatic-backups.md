---
title: "自動バックアップのスケジュール設定 | BYOC"
slug: /schedule-automatic-backups
sidebar_key: schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール設定"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスター全体に対して自動バックアップを有効にでき、予期せぬ問題が発生した場合でもデータ復旧を支援します。なお、個別のコレクションに対する自動バックアップはサポートされていません。 | BYOC"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - 自動

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 自動バックアップのスケジュール設定

Zilliz Cloud では、クラスターに対して**自動バックアップ**を有効にすることで、予期せぬ問題が発生した場合でもデータ復旧を確保できます。自動バックアップは**クラスター全体**に適用され、個別のコレクションを自動的にバックアップすることはサポートされていません。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュールする方法について説明します。オンデマンドバックアップを作成するには、[バックアップの作成](./create-snapshot) を参照してください。

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**を持っている必要があります。

- **バックアップから除外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` の**パスワード**（[復元](./restore-from-snapshot) 中に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、シャードあたりの CU 数の制限により、クラスターの CU サイズが縮小された場合、復元時に調整される可能性があります。詳細については、[Zilliz Cloud の制限](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップが進行中の間は、手動バックアップを開始できません。

    - 手動バックアップがすでに進行中であっても、自動バックアップは実行されます。

## 自動バックアップの有効化\{#enable-automatic-backup}

自動バックアップの設定はクラスター固有であり、**デフォルトで無効**になっています。バックアップにはストレージコストがかかるため、Zilliz Cloud がいつどのようにバックアップを作成するかを制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初期バックアップを生成し、その後、指定されたスケジュールに基づいて定期的なバックアップを実行します。

### ウェブコンソール経由\{#via-web-console}

ウェブコンソールで自動バックアップを有効にすると、Zilliz Cloud はデフォルトで以下のように構成されます：

- **頻度**: 毎日バックアップを作成

- **バックアップ時間**: 午前 8 時〜午前 10 時（UTC +08:00）

- **期間**: 各バックアップを 7 日間保持

これらの設定は、ニーズに合わせて調整できます。

以下のデモでは、自動バックアップを有効にして構成する方法を示しています：

<Supademo id="cmcsqvpfk0gns9st8bd3faaje?utm_source=link" title=""  />

### RESTful API 経由\{#via-restful-api}

次の例は、クラスターの自動バックアップを有効にする方法です。RESTful API の詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2) を参照してください。

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

以下は出力例です。自動バックアップを有効にすると、バックアップジョブが即座に生成されます。進行状況は [プロジェクトジョブセンター](/docs/job-center) で確認できます。

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

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで自動バックアップのスケジュールを確認する方法を示します。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップポリシーを確認します。RESTful APIの詳細については、「[Get Backup Policy](/reference/restful/get-backup-policy-v2)」を参照してください。

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

### ウェブコンソール経由\{#via-web-console}

次のデモでは、Zilliz Cloud ウェブコンソールで自動バックアップのスケジュールを確認する方法を示しています。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

次の例では、クラスターの自動バックアップを無効にします。RESTful API の詳細については、「[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)」を参照してください。

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

**バックアップジョブはどのくらいの時間がかかりますか？**  
バックアップにかかる時間はデータのサイズによって異なります。目安として、700 MB のバックアップには通常約 1 秒かかります。クラスターに 1,000 個を超えるコレクションが含まれる場合、処理にやや時間がかかることがあります。

**バックアップ中に DDL（データ Definition 言語）操作を実行できますか？**  
バックアップ実行中は、コレクションの作成や削除など、大規模な DDL（データ Definition 言語）操作を避けることを推奨します。これらの操作はバックアッププロセスに干渉したり、結果が不整合になったりする可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**  

自動バックアップのデフォルト保持期間は 7 日間で、最大 30 日間まで延長可能です。

**元のクラスターを削除した場合、バックアップファイルも削除されますか？**  

これはバックアップファイルの作成方法によります。すべての自動バックアップは元のクラスターとともに削除されます。一方、[手動クラスターバックアップ](./create-snapshot) は永続的に保持され、クラスター削除時にも削除されません。不要になった場合は、手動で削除する必要があります。


---
title: "自動バックアップのスケジュール設定 | Cloud"
slug: /schedule-automatic-backups
sidebar_key: schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール設定"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターの自動バックアップを有効にでき、予期しない問題が発生した場合のデータ復旧を確保できます。自動バックアップはクラスター全体に適用され、個別のコレクションを自動的にバックアップすることはサポートされていません。 | Cloud"
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

Zilliz Cloud では、クラスターの**自動バックアップ**を有効にすることができ、予期しない問題が発生した場合のデータ復旧を確実にすることができます。自動バックアップは**クラスター全体**に適用され、個別のコレクションを自動的にバックアップすることはサポートされていません。

バックアップの作成には追加の[料金](./storage-cost)が発生し、価格はバックアップが保存されるクラウドリージョンに基づいて決定されます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2` のクラスターのバックアップは `AWS us-west-2` に保存されます。

このガイドでは、Zilliz Cloud で自動バックアップをスケジュール設定する方法について説明します。オンデマンドバックアップを作成するには、[バックアップの作成](./create-backup) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は **Dedicated** クラスターでのみ利用可能です。

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップから除外**:

    - コレクションの TTL 設定

    - デフォルトユーザー `db_admin` のパスワード（[復元](./restore-from-backup-files)時に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターの CU サイズが縮小される場合、shard-per-CU の制限により、復元時に調整されることがあります。詳細については、[Zilliz Cloud 制限s](./limits#shards) を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップ実行中は、手動バックアップを開始できません。

    - 手動バックアップ実行中でも、自動バックアップは引き続き実行されます。

- バックアップは、組織が凍結されてから60日後に自動的に削除されます。

## 自動バックアップの有効化\{#enable-automatic-backup}

自動バックアップの設定はクラスター固有であり、**デフォルトで無効**です。バックアップにはストレージコストが発生するため、Zilliz Cloud がバックアップを作成するタイミングと方法を制御できます。自動バックアップを有効にすると、Zilliz Cloud は直ちに初期バックアップを生成し、その後、指定したスケジュールに基づいて定期的なバックアップを実行します。

ディザスタリカバリのためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、自動バックアップの有効化時にコピーポリシーを設定できます。詳細については、[他のリージョンへのコピー](./backup-to-other-regions) を参照してください。

### ウェブコンソール経由\{#via-web-console}

ウェブコンソールで自動バックアップを有効にすると、Zilliz Cloud はデフォルトで以下のように設定されます:

- **頻度:** 毎日バックアップを作成

- **バックアップ時間:** 午前8時から午前10時の間（UTC +08:00）

- **保持期間:** 各バックアップを7日間保持

これらの設定は、必要に応じて調整できます。

以下のデモでは、自動バックアップを有効にして設定する方法を示しています:

<Supademo id="cmcsqvpfk0gns9st8bd3faaje?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップを有効にします。RESTful API の詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2) を参照してください。

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

上記のポリシーを使用して作成されたバックアップについてもクロスリージョンコピーを作成するには、以下のようにします。

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

自動バックアップを有効にすると、バックアップジョブが即時に生成されます。進捗状況は [プロジェクトジョブセンター](/docs/job-center) で確認できます。

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

以下のデモでは、Zilliz Cloud ウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップポリシーを確認します。RESTful API の詳細については、[バックアップポリシーの取得](/reference/restful/get-backup-policy-v2) を参照してください。

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

クラスターの自動バックアップを無効化することもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップを無効化します。RESTful API の詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2) を参照してください。

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

**バックアップジョブの所要時間はどのくらいですか？**
バックアップの所要時間は、データのサイズによって異なります。参考として、700 MB のバックアップには通常約 1 秒かかります。クラスタに 1,000 以上のコレクションが含まれている場合、処理がやや長くなる可能性があります。

**バックアップ中に DDL（データ Definition 言語）操作を実行できますか？**
バックアップ実行中は、コレクションの作成や削除などの主要な DDL（データ Definition 言語）操作を避けることを推奨します。これらの操作は処理を妨げたり、不整合な結果を招いたりする可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**

自動バックアップのデフォルトの保持期間は 7 日間で、最大 30 日間まで調整できます。

**元のクラスタが削除された場合、バックアップファイルも削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての自動バックアップは元のクラスタとともに削除されます。ただし、[手動クラスタバックアップ](./create-backup) は永久に保持され、クラスタが削除されても削除されません。不要になった場合は手動で削除する必要があります。


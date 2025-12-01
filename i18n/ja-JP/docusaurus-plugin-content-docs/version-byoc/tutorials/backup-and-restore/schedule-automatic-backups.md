---
title: "自動バックアップのスケジュール | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、クラスターの自動バックアップを有効にできます。これにより、予期しない問題が発生した場合でもデータの復旧が保証されます。自動バックアップは**クラスター全体**に適用されます。個々のコレクションを自動的にバックアップすることはサポートされていません。 | BYOC"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - バックアップ
  - 自動
  - milvusベクトルDB
  - Zilliz Cloud
  - Milvusとは
  - Milvusデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 自動バックアップのスケジュール

Zilliz Cloudでは、クラスターの**自動バックアップ**を有効にできます。これにより、予期しない問題が発生した場合でもデータの復旧が保証されます。自動バックアップは**クラスター全体**に適用されます。個々のコレクションを自動的にバックアップすることはサポートされていません。

このガイドでは、Zilliz Cloudで自動バックアップをスケジュールする方法を説明します。オンデマンドのバックアップを作成するには、[バックアップの作成](./create-snapshot)を参照してください。

## 制限事項\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織の所有者**、またはバックアップ権限を持つ**カスタムロール**である必要があります。

- **バックアップ対象外**:

    - コレクションTTL設定

    - デフォルトユーザー `db_admin` のパスワード（[リストア](./restore-from-snapshot)時に新しいパスワードが生成されます）

    - クラスターダイナミックスケーリングとスケジュールスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターCUサイズが縮小された場合、シャードあたりCU制限によりリストア時に調整される場合があります。詳細は[Zilliz Cloud制限事項](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップが進行中の間は、手動バックアップを開始できません。

    - 手動バックアップが既に進行中の場合でも、自動バックアップは実行され続けます。

## 自動バックアップの有効化\{#enable-automatic-backup}

自動バックアップ設定はクラスター固有であり、**デフォルトでは無効**になっています。バックアップはストレージコストが発生するため、Zilliz Cloudがバックアップを作成する時期と方法を制御できます。自動バックアップが有効になると、Zilliz Cloudはすぐに初期バックアップを生成し、その後は指定したスケジュールに基づいて定期的なバックアップを実行します。

### ウェブコンソール経由\{#via-web-console}

ウェブコンソールで自動バックアップを有効にすると、Zilliz Cloudはデフォルトで以下のように設定されます：

- **頻度**: 毎日バックアップを作成

- **バックアップ時間**: 午前8時から午前10時の間（UTC +08:00）

- **保持期間**: 各バックアップを7日間保持

これらの設定は必要に応じて調整できます。

以下のデモでは、自動バックアップを有効にして設定する方法を示しています：

<Supademo id="cmcsqvpfk0gns9st8bd3faaje?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップを有効にします。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

```bash
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

以下は出力例です。自動バックアップが有効になるとすぐにバックアップジョブが生成されます。[プロジェクトジョブセンター](/docs/job-center)で進捗を確認できます。

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

自動バックアップが有効な場合、そのスケジュールを確認できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップポリシーを確認します。RESTful APIの詳細については、[バックアップポリシーの取得](/reference/restful/get-backup-policy-v2)を参照してください。

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
        "retentionDays": 7
    }
}
```

## 自動バックアップの無効化\{#disable-automatic-backup}

クラスターの自動バックアップを無効にすることもできます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、クラスターの自動バックアップを無効にします。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

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

**バックアップジョブにはどれくらい時間がかかりますか？**
バックアップの所要時間はデータサイズに依存します。参考までに、700 MBのバックアップには通常約1秒かかります。クラスターに1,000以上のコレクションが含まれている場合、処理に少し時間がかかる場合があります。

**バックアップ中にDDL（データ定義言語）操作を実行できますか？**
バックアップが進行中の間は、コレクションの作成や削除などの主要なDDL（データ定義言語）操作を避けることをお勧めします。これらはプロセスに干渉するか、一貫性のない結果をもたらす可能性があります。

**自動バックアップファイルの保持期間はどれくらいですか？**

自動バックアップのデフォルト保持期間は7日間であり、最大30日まで調整できます。

**元のクラスターが削除された場合、バックアップファイルは削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての自動バックアップは元のクラスターとともに削除されます。しかし、[手動クラスターバックアップ](./create-snapshot)は永久に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。
---
title: "自動バックアップのスケジュール | Cloud"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップのスケジュール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、クラスターの自動バックアップを有効にでき、予期しない問題が発生した場合のデータ復旧を確実にできます。自動バックアップはクラスター全体に適用され、個々のコレクションを自動的にバックアップすることはサポートされていません。 | Cloud"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - バックアップ
  - 自動
  - DiskANN
  - スパースベクター
  - ベクター次元
  - ANN検索

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 自動バックアップのスケジュール

Zilliz Cloudでは、クラスターの **自動バックアップ** を有効にでき、予期しない問題が発生した場合のデータ復旧を確実にできます。自動バックアップは **クラスター全体** に適用され、個々のコレクションを自動的にバックアップすることはサポートされていません。

バックアップ作成には追加の[料金](./storage-cost)が発生し、価格はバックアップが保存されているクラウドリージョンに基づいて計算されます。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2`のクラスターでは、バックアップも`AWS us-west-2`に保存されます。

このガイドでは、Zilliz Cloudで自動バックアップのスケジュールを設定する方法を説明します。オンデマンドでバックアップを作成するには、[バックアップを作成](./create-snapshot)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>この機能は<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- **アクセス制御**: **プロジェクト管理者**、**組織オーナー**、またはバックアップ権限を持つ**カスタムロール**を持つユーザーである必要があります。

- **バックアップ対象外**:

    - コレクションTTL設定

    - デフォルトユーザー`db_admin`のパスワード（[リストア](./restore-from-snapshot)時に新しいパスワードが生成されます）

    - クラスターの動的およびスケジュールされたスケーリング設定

- **クラスターシャード設定**: バックアップされますが、クラスターCUサイズが縮小された場合、シャード毎CU制限によりリストア時に調整される可能性があります。詳細は[Zilliz Cloudの制限](./limits#shards)を参照してください。

- **バックアップジョブ制限**:

    - 自動バックアップが進行中の間は、手動バックアップを開始できません。

    - 手動バックアップが進行中でも、自動バックアップは引き続き実行されます。

## 自動バックアップを有効化\{#enable-automatic-backup}

自動バックアップ設定はクラスター固有であり、**デフォルトでは無効**になっています。バックアップにはストレージコストがかかるため、Zilliz Cloudがバックアップを作成するタイミングと方法を制御できます。自動バックアップが有効になると、Zilliz Cloudは最初のバックアップをすぐに生成し、その後は指定したスケジュールに基づいて定期的なバックアップを生成します。

災害復旧のためにバックアップファイルを他のクラウドリージョンにコピーする必要がある場合は、自動バックアップを有効にする際にコピーポリシーを設定できます。詳細は、[他のリージョンにコピー](./backup-to-other-regions)を参照してください。

### ウェブコンソール経由\{#via-web-console}

ウェブコンソールで自動バックアップを有効にすると、Zilliz Cloudはデフォルトで以下に設定されます：

- **頻度:** 日次でバックアップを作成

- **バックアップ時間:** 午前8時から午前10時（UTC +08:00）

- **保持期間:** 各バックアップを7日間保持

これらの設定を調整して、ニーズに合わせることができます。

以下は、自動バックアップを有効化および構成する方法を示すデモです：

<Supademo id="cmcsqvpfk0gns9st8bd3faaje?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、クラスターの自動バックアップを有効にする例です。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

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

以下は出力例です。自動バックアップが有効になるとすぐにバックアップジョブが生成されます。進行状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## バックアップスケジュールを確認\{#check-backup-schedule}

自動バックアップが有効になっている場合、そのスケジュールを確認できます。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールで自動バックアップのスケジュールを確認する方法を示すデモです。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、クラスターの自動バックアップポリシーを確認する例です。RESTful APIの詳細については、[バックアップポリシーの取得](/reference/restful/get-backup-policy-v2)を参照してください。

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

## 自動バックアップを無効化\{#disable-automatic-backup}

クラスターの自動バックアップを無効にすることもできます。

### ウェブコンソール経由\{#via-web-console}

以下は、Zilliz Cloudウェブコンソールで自動バックアップのスケジュールを確認する方法を示すデモです。

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### RESTful API経由\{#via-restful-api}

以下は、クラスターの自動バックアップを無効にする例です。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

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

**バックアップジョブにどれくらい時間がかかりますか？**
バックアップの所要時間はデータのサイズによって異なります。参考までに、700 MBのバックアップには通常約1秒かかります。クラスターに1,000以上のコレクションが含まれている場合、処理に少し時間がかかることがあります。

**バックアップ中にDDL（データ定義言語）操作を実行できますか？**
バックアップが進行中の間は、コレクションの作成や削除などの主要なDDL（データ定義言語）操作を避けることを推奨します。これらはプロセスを妨げたり、不整合な結果をもたらす可能性があります。

**自動バックアップファイルの保持期間はどのくらいですか？**

自動バックアップのデフォルトの保持期間は7日間であり、最大30日間まで調整できます。

**元のクラスターが削除された場合、バックアップファイルも削除されますか？**

これはバックアップファイルの作成方法によって異なります。すべての自動バックアップは、元のクラスターとともに削除されます。しかし、[手動クラスターバックアップ](./create-snapshot)は永久に保持され、クラスターが削除されても削除されません。不要になった場合は手動で削除する必要があります。

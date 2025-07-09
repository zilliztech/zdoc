---
title: "自動バックアップをスケジュールする | Cloud"
slug: /schedule-automatic-backups
sidebar_label: "自動バックアップをスケジュールする"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudを使用すると、クラスターの自動バックアップを有効にすることができ、予期せぬ問題が発生した場合にデータの回復を確実にすることができます。自動バックアップはクラスター全体に適用されますが、個々のコレクションの自動バックアップはサポートされていません。 | Cloud"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - automatic
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 自動バックアップをスケジュールする

Zilliz Cloudを使用すると、クラスターの**自動バックアップ**を有効にすることができ、予期せぬ問題が発生した場合にデータの回復を確実にすることができます。自動バックアップは**クラスター全体**に適用されますが、個々のコレクションの自動バックアップはサポートされていません。

バックアップの作成には、バックアップが保存されているクラウドリージョンに基づいた価格設定で、追加の[チャージ](./understand-cost#backup-cost)が発生します。すべてのバックアップファイルは、ソースクラスターと同じクラウドリージョンに保存されます。たとえば、`AWS us-west-2`のクラスターは、バックアップが`AWS us-west-2`に保存されます。

このガイドでは、Zilliz Cloudで自動バックアップをスケジュールする方法を説明します。オンデマンドバックアップを作成するには、[バックアップを作成](./create-snapshot)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>バックアップと復元機能は、専用クラスターでのみ利用可能です。 </p>

</Admonition>

</exclude>

## 限界{#limits}

- アクセス制御:プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールが必要です。

- **バックアップから除外**:

    - コレクションのTTL設定

    - デフォルトユーザー`db_admin`のパスワード(新しいパスワードは[復元する](./restore-from-snapshot)中に生成されます)

- クラスターシャード設定:バックアップされますが、CUあたりのシャード制限によりクラスターCU体格が低下した場合、復元中に調整される可能性があります。詳細については、[Zillizクラウドの制限](./limits#shards)を参照してください。

- **バックアップジョブの制限**:

    - 自動バックアップが進行中の場合、手動バックアップを開始できません。

    - 手動バックアップが既に進行中の場合でも、自動バックアップは実行されます。

## 自動バックアップを有効にする{#enable-automatic-backup}

自動バックアップ設定はクラスター固有で、デフォルトで無効になっています。バックアップにはストレージコストがかかるため、Zilliz Cloudが作成するタイミングと方法を制御できます。自動バックアップが有効になると、Zilliz Cloudはすぐに初期バックアップを生成し、指定されたスケジュールに基づいて定期的なバックアップを生成します。

### ウェブコンソールから{#via-web-console}

ウェブコンソールで自動バックアップを有効にすると、Zilliz Cloudはデフォルトで以下のように設定されます。

- **頻度:**毎日バックアップを作成する

- **バックアップ時間:**午前8時から午前10時（UTC+0 8: 0 0）の間

- **保持期間:**各バックアップを7日間保持します

必要に応じてこれらの設定を調整できます。 

次のデモは、自動バックアップを有効にして設定する方法を示しています

<Supademo id="cmcsqvpfk0gns9st8bd3faaje" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、クラスタの自動バックアップを有効にします。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

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

以下は出力例です。自動バックアップが有効になると、すぐにバックアップジョブが生成されます。進捗状況は[プロジェクトジョブセンター](/docs/job-center)で確認できます。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## バックアップスケジュールを確認する{#check-backup-schedule}

自動バックアップが有効になっている場合、スケジュールを確認できます。

### ウェブコンソールから{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr43kx02umxk0ih3i31jaq" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、クラスタの自動バックアップポリシーを確認します。RESTful APIの詳細については、[バックアップポリシーを取得](/reference/restful/get-backup-policy-v2)を参照してください。

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

## 自動バックアップを無効にする{#disable-automatic-backup}

クラスタの自動バックアップを無効にすることもできます。

### ウェブコンソールから{#via-web-console}

以下のデモでは、Zilliz Cloudウェブコンソールで自動バックアップスケジュールを確認する方法を示しています。

<Supademo id="cmcsr7chx0gu29st8s0obm37l" title=""  />

### RESTful APIを使用する{#via-restful-api}

次の例では、クラスタの自動バックアップを無効にします。RESTful APIの詳細については、[バックアップポリシーの設定](/reference/restful/set-backup-policy-v2)を参照してください。

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

## よくある質問(FAQ){#faqs}

バックアップジョブにはどのくらい時間がかかりますか?
バックアップの所要時間はデータの体格によって異なります。参考までに、700 MBのバックアップには通常約1秒かかります。クラスタに1,000以上のコレクションが含まれている場合、その過程には少し時間がかかる場合があります。

バックアップ中にDDL(データ定義言語)操作を実行できますか?
バックアップの実行中は、コレクションの作成や削除などの大規模なDDL(Data Definition Language)操作を避けることをお勧めします。これらの操作は、バックアップの過程を妨げたり、一貫性のない結果につながる可能性があります。

**自動バックアップファイルの保存期間は何ですか?**

自動バックアップのデフォルトの保存期間は7日間で、最大30日間まで調整できます。

**元のクラスタが削除された場合、バックアップファイルは削除されますか?**

バックアップファイルの作成方法によって異なります。すべての自動バックアップは元のクラスタとともに削除されますが、[クラスタの手動バックアップ](./create-snapshot)は永久に保持され、クラスタが削除されても削除されません。不要になった場合は手動で削除する必要があります。


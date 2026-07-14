---
title: "Scheduled Scaling | BYOC"
slug: /scheduled-scaling
sidebar_label: "Scheduled Scaling"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scheduled scaling を使用すると、事前定義した時刻に Dedicated serving cluster のサイズを変更できます。平日の営業時間帯のトラフィック、週末の低トラフィック期間、予測可能なバッチ/クエリウィンドウなど、ワークロードに繰り返し発生するパターンがある場合に使用します。 | BYOC"
type: origin
token: ZACVwXqTbiCqR3kS9YAccuaQnId
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Scheduled Scaling

Scheduled scaling を使用すると、事前定義した時刻に Dedicated serving cluster のサイズを変更できます。平日の営業時間帯のトラフィック、週末の低トラフィック期間、予測可能なバッチ/クエリウィンドウなど、ワークロードに繰り返し発生するパターンがある場合に使用します。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングはすべてのプランでサポートされています。

replica の手動スケーリングは Enterprise プラン以上でサポートされています。

自動スケーリングと Scheduled scaling は Enterprise プラン以上でサポートされています。

</Admonition>

## 始める前に\{#before-you-start}

始める前に、[Plan Cluster Scaling](./plan-cluster-scaling) を読んで、主要なスケーリングの概念を理解し、ワークロードに適したスケーリング方法を選択してください。

## Scheduled scaling の仕組み\{#how-scheduled-scaling-works}

Scheduled scaling は、定義したスケジュールに従って cluster リソースを変更します。各スケジュールには、時刻式と目標リソース値が含まれます。

| Resource | スケジュールで変更される内容 | 使用する場面 |
| --- | --- | --- |
| Query CU | cluster の Query CU 数を、スケジュールされた目標値に変更します。 | 繰り返し発生するピーク時間帯により多くのキャパシティが必要な場合、または予測可能な低トラフィック時間帯にキャパシティを下げたい場合。 |
| Replica | cluster の replica 数を、スケジュールされた目標値に変更します。 | 繰り返し発生するトラフィックピーク時に、より高いクエリスループットまたは可用性が必要な場合。 |

Scheduled scaling は [dynamic scaling](./auto-scaling) とは異なります。Scheduled scaling は、設定した時刻に実行されます。Dynamic scaling は、ワークロードメトリクスに基づいて、最小値と最大値の範囲内でリソースを自動的に調整します。

## Scheduled scaling を使用するタイミング\{#when-to-use-scheduled-scaling}

| シナリオ | 推奨スケジュール |
| --- | --- |
| アプリケーションのトラフィックが平日の営業時間帯に多い。 | 営業時間前にスケールアップし、営業時間後にスケールダウンするように Scheduled scaling を設定します。 |
| ワークロードが週末に軽くなる。 | 週末にスケールダウンし、月曜のトラフィックが始まる前にキャパシティを復元するように Scheduled scaling を設定します。 |
| 定期的に batch search、評価、または analytics ジョブを実行する。 | ジョブ時間帯の前にスケールアップし、ジョブ完了後にスケールダウンするように Scheduled scaling を設定します。 |
| 予測可能なトラフィックピークはあるが、メトリクスベースの自動スケーリングは不要である。 | リソース変更を決定論的に行うために、dynamic scaling の代わりに Scheduled scaling を使用します。 |

## Web コンソールで Scheduled scaling を設定する\{#configure-scheduled-scaling-via-web-console}

スケジュール間の間隔は 30 分を超える必要があります。 

### Query CU Scheduled scaling\{#query-cu-scheduled-scaling}

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **CU Settings** カードで **Scale** をクリックします。

1. Scheduled scaling を有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、basic モードまたは advanced モード（cron 式を記述）を使用できます。advanced モードでの cron 式の記述方法については、[Understand cron expressions](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

### Replica Scheduled scaling\{#replica-scheduled-scaling}

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Replica Settings** カードで **Scale** をクリックします。

1. Scheduled scaling を有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、basic モードまたは advanced モード（cron 式を記述）を使用できます。advanced モードでの cron 式の記述方法については、[Understand cron expressions](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

## RESTful API で Scheduled scaling を設定する\{#configure-scheduled-scaling-via-restful-api}

RESTful API を使用すると、単一の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで、Query CU と replica の両方に対する Scheduled scaling を設定できます。

advanced モードでの cron 式の記述方法については、[Understand cron expressions](./scheduled-scaling) を参照してください。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
  --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Accept: application/json" \
  --header "Content-Type: application/json" \
  -d '{
    "autoscaling": {
      "cu": {
        "schedules": [
          {
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
      },
      "replica": {
        "schedules": [
          {
            "cron": "0 9 * * 1-5",
            "target": 2
          }
        ]
      }
    }
  }'
```

## スケーリングの進行状況を確認する\{#view-scaling-progress}

スケーリングイベントがトリガーされると、Zilliz Cloud はジョブレコードを生成します。進行状況は Jobs ページで確認できます。

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトに移動します。

1. **Jobs** に移動します。

1. 対象 cluster のスケーリングジョブを見つけます。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの進行中は、cluster ステータスは `Modifying` です。ジョブが成功すると、cluster ステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブの実行中、Zilliz Cloud は以前の設定に基づいて cluster の課金を継続します。新しい Query CU または replica の設定が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これはスケールアップ操作とスケールダウン操作の両方に適用されます。

</Admonition>

## FAQ\{#faq}

**2 つのスケジュールの間隔が近すぎる場合はどうなりますか？**

スケジュール間の間隔は 30 分を超える必要があります。トリガー頻度が高すぎるスケジュールや、互いに重複するスケジュールの作成は避けてください。

**cron はどのタイムゾーンを使用しますか？**

cron スケジュールは、Scheduled scaling の設定時に選択したタイムゾーンで評価されます。



import DocCardList from '@theme/DocCardList';

<DocCardList />

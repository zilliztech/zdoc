---
title: "スケジュールスケーリング | Cloud"
slug: /scheduled-scaling
sidebar_label: "スケジュールスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の営業時間帯のトラフィック、週末の低トラフィック期間、予測可能なバッチ/クエリの時間帯など、ワークロードに繰り返し発生するパターンがある場合に使用します。 | Cloud"
type: origin
token: ZACVwXqTbiCqR3kS9YAccuaQnId
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スケジュールスケーリング

スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の営業時間帯のトラフィック、週末の低トラフィック期間、予測可能なバッチ/クエリの時間帯など、ワークロードに繰り返し発生するパターンがある場合に使用します。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

レプリカの手動スケーリングは、Enterprise プラン以上でサポートされています。

自動スケーリングとスケジュールスケーリングは、Enterprise プラン以上でサポートされています。

</Admonition>

## 始める前に\{#before-you-start}

始める前に、[Plan Cluster Scaling](./plan-cluster-scaling) を読んで、主要なスケーリングの概念を理解し、ワークロードに適したスケーリング方法を選択してください。

## スケジュールスケーリングの仕組み\{#how-scheduled-scaling-works}

スケジュールスケーリングは、定義したスケジュールに従ってクラスターリソースを変更します。各スケジュールには、時間式とターゲットのリソース値が含まれます。

| リソース | スケジュールで変更される内容 | 使用する場面 |
| --- | --- | --- |
| Query CU | クラスターの Query CU 数を、スケジュールされたターゲット値に変更します。 | 定期的なピーク時間帯により多くのキャパシティが必要な場合、または予測可能な低トラフィック期間にキャパシティを下げたい場合。 |
| レプリカ | クラスターのレプリカ数を、スケジュールされたターゲット値に変更します。 | 定期的なトラフィックピーク時に、より高いクエリスループットまたは可用性が必要な場合。 |

スケジュールスケーリングは、[動的スケーリング](./auto-scaling) とは異なります。スケジュールスケーリングは、設定した時刻に実行されます。動的スケーリングは、ワークロードメトリクスに基づいて最小値と最大値の範囲内でリソースを自動的に調整します。

## スケジュールスケーリングを使用する場面\{#when-to-use-scheduled-scaling}

| シナリオ | 推奨スケジュール |
| --- | --- |
| アプリケーションのトラフィックが平日の営業時間中に多くなる。 | 営業時間の前にスケールアップし、営業時間後にスケールダウンするようにスケジュールスケーリングを設定します。 |
| ワークロードが週末は軽くなる。 | 週末にスケールダウンし、月曜日のトラフィックが始まる前にキャパシティを復元するようにスケジュールスケーリングを設定します。 |
| 定期的なバッチ検索、評価、または分析ジョブを実行する。 | ジョブ時間帯の前にスケールアップし、ジョブ完了後にスケールダウンするようにスケジュールスケーリングを設定します。 |
| 予測可能なトラフィックピークはあるが、メトリクスベースの自動スケーリングは不要である。 | 予測可能なリソース変更のために、動的スケーリングの代わりにスケジュールスケーリングを使用します。 |

## Web コンソールでスケジュールスケーリングを設定する\{#configure-scheduled-scaling-via-web-console}

スケジュール間の間隔は 30 分より長くする必要があります。 

### Query CU のスケジュールスケーリング\{#query-cu-scheduled-scaling}

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **CU Settings** カードで **Scale** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは高度なモード（cron 式を記述）を使用できます。高度なモードで cron 式を記述する方法の詳細については、[Understand cron expressions](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

### レプリカのスケジュールスケーリング\{#replica-scheduled-scaling}

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Replica Settings** カードで **Scale** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは高度なモード（cron 式を記述）を使用できます。高度なモードで cron 式を記述する方法の詳細については、[Understand cron expressions](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

## RESTful API でスケジュールスケーリングを設定する\{#configure-scheduled-scaling-via-restful-api}

RESTful API を使用すると、単一の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU とレプリカの両方のスケジュールスケーリングを設定できます。

高度なモードで cron 式を記述する方法の詳細については、[Understand cron expressions](./scheduled-scaling) を参照してください。

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

1. 対象クラスターのスケーリングジョブを見つけます。

1. ジョブのステータスを確認します。

</Procedures>

スケーリングジョブの進行中は、クラスターのステータスは `Modifying` です。ジョブが成功すると、クラスターのステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブの実行中、Zilliz Cloud は以前の構成に基づいてクラスターの課金を継続します。新しい Query CU またはレプリカ構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これは、スケールアップ操作とスケールダウン操作の両方に適用されます。

</Admonition>

## FAQ\{#faq}

**2 つのスケジュールの間隔が近すぎる場合はどうなりますか？**

スケジュール間の間隔は 30 分より長くする必要があります。頻繁にトリガーされたり、互いに重なったりするスケジュールは作成しないでください。

**cron はどのタイムゾーンを使用しますか？**

cron スケジュールは、スケジュールスケーリングの設定時に選択したタイムゾーンで評価されます。



import DocCardList from '@theme/DocCardList';

<DocCardList />

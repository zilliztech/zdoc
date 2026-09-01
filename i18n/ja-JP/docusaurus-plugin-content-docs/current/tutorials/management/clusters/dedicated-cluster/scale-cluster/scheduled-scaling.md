---
title: "スケジュールスケーリング | Cloud"
slug: /scheduled-scaling
sidebar_label: "スケジュールスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の業務時間帯のトラフィック増加、週末の低トラフィック期間、予測可能なバッチ/query ウィンドウなど、ワークロードに定期的なパターンがある場合に有効です。 | Cloud"
type: origin
token: ZACVwXqTbiCqR3kS9YAccuaQnId
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スケジュールスケーリング

スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の業務時間帯のトラフィック増加、週末の低トラフィック期間、予測可能なバッチ/query ウィンドウなど、ワークロードに定期的なパターンがある場合に有効です。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングは、すべてのプランで利用できます。

レプリカの手動スケーリングは、Enterprise プラン以上で利用できます。

自動スケーリングおよびスケジュールスケーリングは、Enterprise プラン以上で利用できます。

</Admonition>

## 事前準備\{#before-you-start}

作業を始める前に、[クラスタースケーリングの計画](./plan-cluster-scaling) を参照し、スケーリングの主要な概念を理解した上で、ワークロードに適したスケーリング方法を選択してください。

## スケジュールスケーリングの仕組み\{#how-scheduled-scaling-works}

スケジュールスケーリングは、ユーザーが定義したスケジュールに従ってクラスターリソースを変更します。各スケジュールには、時刻式とターゲットとなるリソース値が含まれます。

| リソース | 変更内容 | 推奨される使用場面 |
| --- | --- | --- |
| Query CU | クラスターの Query CU 数をスケジュールされたターゲット値に変更します。 | 定期的なピーク時にキャパシティを増強したい場合や、予測可能な低トラフィック期間にキャパシティを削減したい場合。 |
| レプリカ | クラスターのレプリカ数をスケジュールされたターゲット値に変更します。 | 定期的なトラフィックのピーク時に、クエリスループットや可用性を高めたい場合。 |

スケジュールスケーリングは [動的スケーリング](./auto-scaling) とは異なります。スケジュールスケーリングは設定した時刻に実行されますが、動的スケーリングはワークロードのメトリクスに基づき、最小値と最大値の範囲内でリソースを自動的に調整します。

## スケジュールスケーリングの使用例\{#when-to-use-scheduled-scaling}

| シナリオ | 推奨スケジュール |
| --- | --- |
| 平日の業務時間帯にアプリケーションのトラフィックが増加する。 | 業務開始前にスケールアップし、業務終了後にスケールダウンするようにスケジュールを設定します。 |
| 週末はワークロードが軽減する。 | 週末にスケールダウンし、月曜日のトラフィック増加前にキャパシティを復元するようにスケジュールを設定します。 |
| 定期的なバッチ検索、評価、分析ジョブを実行する。 | ジョブウィンドウの開始前にスケールアップし、ジョブ完了後にスケールダウンするようにスケジュールを設定します。 |
| トラフィックのピークは予測可能だが、メトリクスに基づく自動スケーリングは不要である。 | リソース変更を確実に行うため、動的スケーリングの代わりにスケジュールスケーリングを使用します。 |

## Web コンソールでのスケジュールスケーリング設定\{#configure-scheduled-scaling-via-web-console}

スケジュールの間隔は 30 分以上空けてください。

### Query CU のスケジュールスケーリング\{#query-cu-scheduled-scaling}

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

<Procedures>

1. **クラスター Details** ページに移動します。

1. **CU Settings** カード内の **Scale** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは詳細モード（cron 式の記述）のいずれかを使用できます。詳細モードでの cron 式の記述方法については、[cron 式の理解](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

### レプリカのスケジュールスケーリング\{#replica-scheduled-scaling}

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

<Procedures>

1. **クラスター Details** ページに移動します。

1. **Replica Settings** カード内の **Scale** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは詳細モード（cron 式の記述）のいずれかを使用できます。詳細モードでの cron 式の記述方法については、[cron 式の理解](./scheduled-scaling) を参照してください。

1. **Save** をクリックします。

</Procedures>

## RESTful API でのスケジュールスケーリング設定\{#configure-scheduled-scaling-via-restful-api}

RESTful API を使用すると、1 回の [Modify クラスター](/reference/restful/modify-cluster-v2) リクエストで Query CU とレプリカの両方のスケジュールスケーリングを設定できます。

詳細モードでの cron 式の記述方法については、[cron 式の理解](./scheduled-scaling) を参照してください。

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

## スケーリング進捗の確認\{#view-scaling-progress}

スケーリングイベントがトリガーされると、Zilliz Cloud がジョブレコードを生成します。進捗状況は Jobs ページで確認できます。

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトに移動します。

1. **Jobs** に移動します。

1. 対象クラスターのスケーリングジョブを探します。

1. ジョブのステータスを確認します。

</Procedures>

スケーリングジョブの進行中は、クラスターのステータスは `Modifying` になります。ジョブが成功すると、クラスターのステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブの実行中は、Zilliz Cloud は変更前の構成に基づいてクラスターへの課金を継続します。新しい Query CU またはレプリカの構成が課金に反映されるのは、スケーリングジョブが正常に完了した後です。これはスケールアップとスケールダウンの両方に適用されます。

</Admonition>

## FAQ\{#faq}

**2 つのスケジュールの間隔が短すぎる場合はどうなりますか？**

スケジュールの間隔は 30 分以上空けてください。頻繁にトリガーされたり、互いに重複したりするスケジュールの作成は避けてください。

**cron はどのタイムゾーンを使用しますか？**

cron スケジュールは、スケジュールスケーリングの設定時に選択したタイムゾーンに基づいて評価されます。

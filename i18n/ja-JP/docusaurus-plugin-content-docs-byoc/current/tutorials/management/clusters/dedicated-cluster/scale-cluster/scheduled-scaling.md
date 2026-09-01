---
title: "スケジュールスケーリング | BYOC"
slug: /scheduled-scaling
sidebar_label: "スケジュールスケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の業務時間中のトラフィック増加、週末の低トラフィック期間、予測可能なバッチ/queryウィンドウなど、ワークロードに繰り返しのパターンがある場合に有効です。 | BYOC"
type: origin
token: ZACVwXqTbiCqR3kS9YAccuaQnId
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# スケジュールスケーリング

スケジュールスケーリングを使用すると、事前に定義した時刻に Dedicated サービングクラスターのサイズを変更できます。平日の業務時間中のトラフィック増加、週末の低トラフィック期間、予測可能なバッチ/queryウィンドウなど、ワークロードに繰り返しのパターンがある場合に有効です。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングは、すべてのプランで利用できます。

レプリカの手動スケーリングは、Enterprise プラン以上で利用できます。

自動スケーリングおよびスケジュールスケーリングは、Enterprise プラン以上で利用できます。

</Admonition>

## 事前準備\{#before-you-start}

作業を始める前に、[クラスタースケーリングの計画](./plan-cluster-scaling) を参照し、スケーリングの主要な概念を理解した上で、ワークロードに適したスケーリング方法を選択してください。

## スケジュールスケーリングの仕組み\{#how-scheduled-scaling-works}

スケジュールスケーリングは、定義したスケジュールに従ってクラスターのリソースを変更します。各スケジュールには、時刻式とターゲットリソース値が含まれます。

| リソース | 変更内容 | 推奨される使用場面 |
| --- | --- | --- |
| Query CU | クラスターの Query CU 数をスケジュールされたターゲット値に変更します。 | 定期的なピーク時にキャパシティを増強したい場合や、予測可能な低トラフィック期間にキャパシティを削減したい場合。 |
| レプリカ | クラスターのレプリカ数をスケジュールされたターゲット値に変更します。 | 定期的なトラフィックピーク時に、クエリスループットや可用性を向上させたい場合。 |

スケジュールスケーリングは [動的スケーリング](./auto-scaling) とは異なります。スケジュールスケーリングは設定した時刻に実行されますが、動的スケーリングはワークロードのメトリクスに基づき、最小値と最大値の範囲内でリソースを自動的に調整します。

## スケジュールスケーリングの使用場面\{#when-to-use-scheduled-scaling}

| シナリオ | 推奨スケジュール |
| --- | --- |
| 平日の業務時間中にトラフィックが増加するアプリケーション。 | 業務時間開始前にスケールアップし、終了後にスケールダウンするように設定します。 |
| 週末にワークロードが軽減する場合。 | 週末にスケールダウンし、月曜日のトラフィック増加前にキャパシティを復元するように設定します。 |
| 定期的なバッチ検索、評価、分析ジョブを実行する場合。 | ジョブウィンドウの開始前にスケールアップし、完了後にスケールダウンするように設定します。 |
| トラフィックピークが予測可能で、メトリクスベースの自動スケーリングが不要な場合。 | リソース変更を確実に行うため、動的スケーリングの代わりにスケジュールスケーリングを使用します。 |

## Web コンソールでのスケジュールスケーリング設定\{#configure-scheduled-scaling-via-web-console}

スケジュールの間隔は 30 分以上空けてください。

### Query CU のスケジュールスケーリング\{#query-cu-scheduled-scaling}

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

<Procedures>

1. **クラスター詳細** ページに移動します。

1. **CU 設定** カードの **スケール** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは詳細モード（cron 式の記述）を使用できます。詳細モードでの cron 式の記述方法については、[cron 式の理解](./scheduled-scaling) を参照してください。

1. **保存** をクリックします。

</Procedures>

### レプリカのスケジュールスケーリング\{#replica-scheduled-scaling}

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

<Procedures>

1. **クラスター詳細** ページに移動します。

1. **レプリカ設定** カードの **スケール** をクリックします。

1. スケジュールスケーリングを有効にします。

1. タイムゾーンとスケジュールを設定します。スケジュールの設定には、基本モードまたは詳細モード（cron 式の記述）を使用できます。詳細モードでの cron 式の記述方法については、[cron 式の理解](./scheduled-scaling) を参照してください。

1. **保存** をクリックします。

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

スケーリングイベントがトリガーされると、Zilliz Cloud がジョブレコードを生成します。進捗状況はジョブページで確認できます。

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトに移動します。

1. **ジョブ** に移動します。

1. 対象クラスターのスケーリングジョブを探します。

1. ジョブのステータスを確認します。

</Procedures>

スケーリングジョブの実行中、クラスターのステータスは `Modifying` です。ジョブが成功すると、クラスターのステータスは `Running` に戻ります。

<Admonition type="info" icon="📘" title="Note">

スケーリングジョブの実行中も、Zilliz Cloud は変更前の構成に基づいてクラスターに課金します。新しい Query CU またはレプリカ構成での課金が適用されるのは、スケーリングジョブが正常に完了した後です。これはスケールアップ、スケールダウンの両方に適用されます。

</Admonition>

## FAQ\{#faq}

**2 つのスケジュールの間隔が短すぎる場合はどうなりますか？**

スケジュールの間隔は 30 分以上空けてください。頻繁にトリガーされたり、互いに重複したりするスケジュールの作成は避けてください。

**cron で使用されるタイムゾーンは何ですか？**

cron スケジュールは、スケジュールスケーリングの設定時に選択したタイムゾーンに基づいて評価されます。

---
title: "スケールクラスタ | Cloud"
slug: /scale-cluster
sidebar_label: "スケールクラスタ"
beta: FALSE
notebook: FALSE
description: "ワークロードが増加し、より多くのデータが書き込まれると、クラスタは容量制限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。 | Cloud"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data

---

import Admonition from '@theme/Admonition';


# スケールクラスタ

ワークロードが増加し、より多くのデータが書き込まれると、クラスタは容量制限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを積極的に管理するには、[メトリクス](./metrics-alerts-reference)ページで**CU Capacity**を監視して、スケーリングが必要な時期を判断できます。ビジネスのニーズやパターンに基づいて、クラスタ容量を拡大するためにCU体格を増やすか、需要が減少した場合に減らしてコストを節約することができます。

このガイドでは、変化するワークロードに合わせてクラスターのサイズを変更する方法について説明します。

<Admonition type="caution" icon="🚧" title="undefined">

<p>クエリのパフォーマンス(QPS)または可用性を向上させるには、<a href="./manage-replica">レプリカ</a>を増やします。</p>

</Admonition>

## Zilliz Cloudのスケーリングオプション{#scaling-options-in-zilliz-cloud}

Zilliz Cloudには、クラスターをスケーリングするためのいくつかの方法があります

- [手動スケーリング](./scale-cluster#manual-scaling):いつでも手動でCU体格を調整して完全に制御できます。ワークロードパターンを明確に理解している場合に最適です。

- [ダイナミックオートスケーリング](./scale-cluster#dynamic-auto-scaling):リアルタイムのメトリクスに基づいてCU体格を自動的に調整します。1日を通して急激に変化したり低下したりする予測不可能なワークロードに最適です。

- [スケジュールされた自動スケーリング](./scale-cluster#scheduled-auto-scaling):事前に定義されたタイムスケジュールに基づいてCU体格を自動的に調整します。営業日のピークや週末の需要の低下など、繰り返し発生するワークロードパターンに最適です。

## 考慮事項{#considerations}

- スケーリングは、専用クラスターでのみ使用できます。

- ダウンワードオートスケーリングは現在、ダイナミックオートスケーリングではサポートされていません。

- スケーリングはわずかなサービスジッターを引き起こす可能性があります。完了時間はデータ量によって異なります。

## 手動スケーリング{#manual-scaling}

Zilliz CloudコンソールまたはRESTful APIを使用して、クラスターを手動でスケールアップまたはスケールダウンできます。

以下は、手動スケーリングの制限と考慮事項です。

- **スケールアップ**

    - 専用（標準）クラスタ:最大32 CU

        企業向けの専用クラスタ:最大256 CU

        大きなCUサイズの場合は、[お問い合わせ](http://zilliz.com/contact-sales).

    - **CU体格**×**レプリカ数**の積は256を超えてはいけません

- **スケールダウン**

    - レプリカを持つクラスターは8 CU小なりにスケールダウンできません

    - スケールダウンリクエストは、次の場合にのみ成功します:

        - 現在のデータ量は、新しいCU体格のCU容量の80%未満です。

        - 現在のコレクション数<新しいCU体格で許可される[最大コレクション数](./limits#collections)。

#### ウェブコンソールから{#via-web-console}

次のデモでは、Zilliz Cloud Webコンソールでクラスタを手動でスケールアップおよびスケールダウンする方法を示します。

[Supdemo]

#### RESTful APIを使用する{#via-restful-api}

次の例では、既存のクラスタを2 CUにスケーリングします。詳細については、[クラスタの変更](/reference/restful/modify-cluster-v2)を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

以下は出力例です。

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```

## オートスケーリング{#auto-scaling}

オペレーションのオーバーヘッドを減らし、サービスの中断を避けるために、Zilliz Cloudウェブコンソールで自動スケーリングを有効にすることができます。ダイナミックモードとスケジュールモードの2つのモードがあり、どちらかまたは両方を有効にすることができます。

以下は、自動スケーリングの制限と考慮事項です。

- 現在、動的自動スケーリングでは下方自動スケーリングはサポートされていません。

- 2つの自動スケーリングイベントの間には、10分間のクールダウンがあります。

### 動的な自動スケーリング{#dynamic-auto-scaling}

次のデモでは、Zilliz Cloud Webコンソールで動的自動スケーリングを設定する方法を示します。 

[スパデモ]

**CU容量閾値**:過去2分間にすべてのサンプルポイントで一貫して超過した場合に自動スケーリングをトリガーする使用率(デフォルト70%)。書き込みレートが高すぎると、クラスタがスケーリングを完了する前にCU容量が100%になり、書き込み禁止になるため、あまり高く設定しないでください(例:>90%)。

### スケジュールされた自動スケーリング{#scheduled-auto-scaling}

次のデモでは、Zilliz Cloudウェブコンソールでスケジュールされた自動スケーリングを設定する方法を示しています。

[スパデモ]


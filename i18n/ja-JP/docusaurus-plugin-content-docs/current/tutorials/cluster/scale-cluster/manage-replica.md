---
title: "レプリカのスケーリング | Cloud"
slug: /manage-replica
sidebar_key: manage-replica
sidebar_label: "レプリカのスケーリング"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud はクラスターレベルのレプリケーションをサポートしています。各レプリカは、クラスター内のリソースとデータの完全なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。| Cloud"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター
  - 管理

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# レプリカ数のスケール

Zilliz Cloud はクラスタレベルのレプリケーションをサポートしています。各レプリカは、クラスタ内のリソースとデータの完全なコピーです。レプリカを使用することで、クエリスループットと可用性を向上させることができます。

QPS のボトルネックが発生しているユーザーにとって、レプリカを追加することでクエリワークロードを分散し、全体のクエリスループットを強化できます。パフォーマンスを事前に最適化するには、[メトリクス](./metrics-alerts-reference) ページで**クエリ** **CU計算**を監視し、レプリカ数のスケールが必要な時期を判断してください。

なお、レプリカを追加してもクラスタ容量は増加しません。クラスタ容量は、各クラスタのクエリ CU 数によってのみ決定されるためです。クラスタ容量を増やしたい場合は、[クラスタのスケール](./scale-query-cu) を参照してください。

このガイドでは、Zilliz Cloud において**サービングクラスタ**のレプリカを設定する手順について説明します。

このページのコンテンツはサービングクラスタにのみ適用されます。オンデマンドクラスタは自動的にスケールします。リクエストが到着すると起動し、アイドル状態になるとゼロまでスケールバックするため、手動での介入は不要です。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスタでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

以下の条件を満たす場合、既存の Dedicated クラスタに対してレプリカ数を設定できます。

- クラスタに 12 以上のクエリ CU があること

- クラスタのクエリ CU 数 x レプリカ数 の積が 10,240 を超えないこと

<Admonition type="caution" icon="🚧" title="Warning">

<p>レプリカ設定の更新により、わずかなサービスのジッターが発生する可能性があります。ご注意ください。</p>

</Admonition>

## 手動スケール\{#manual-scaling}

既存の Dedicated クラスタのレプリカ数は、コンソール上で手動で、またはプログラム的に調整できます。

以下のデモでは、Zilliz Cloud Web コンソールでレプリカを設定する方法を示します。

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

また、RESTful API を使用して、クラスタ内のレプリカ数を手動で調整することもできます。詳細については、[クラスタレプリカの変更](/reference/restful/modify-cluster-replica-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "replica": 2
}'
```

## スケジュールされたスケーリング\{#scheduled-scaling}

Zilliz Cloud ウェブコンソールまたは RESTful API を使用して、事前に定義された時間スケジュールに基づくレプリカのスケーリングを設定できます。

スケジュール間の間隔は 30 分以上である必要があります。

高度なモードを使用して cron 式を記述する方法の詳細については、[Cron Expression](./cron-expression) を参照してください。

以下のデモでは、レプリカの自動スケーリングを有効にする方法を示します。

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

RESTful API を使用してレプリカのスケジュールされたスケーリングを設定することもできます。詳細については、[Modify Cluster](/reference/restful/modify-cluster-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "replica": {
            "schedules": [
                {
                    "cron": "10 0 0 0 0 ?",
                    "target": 2
                }
            ]
        }
    }
}'
```

## 動的スケーリング\{#dynamic-scaling}

Zilliz Cloud はレプリカの動的スケーリングをサポートしており、手動での介入なしにパフォーマンスを維持できるようにします。この機能を有効にすると、システムはリアルタイムの **CU計算** メトリクスに基づいて自動的に **レプリカ数** を調整し、サービスの中断なくワークロードを効率的に処理します。

動的スケーリングを設定する際には、以下の境界値を設定できます：

- **最小レプリカ**: デフォルトは現在のレプリカ数です。

- **最大レプリカ**: デフォルトは現在の CU サイズの 1 倍です。最大レプリカ数は 10 を超えることはできません。この上限を引き上げる必要がある場合は、[サポートチームにお問い合わせください](http://support.zilliz.com)。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>現在の値より小さい最大レプリカ数を選択すると、即座にスケールインが実行されます。</p></li>
<li><p>現在の値より大きい最小レプリカ数を選択すると、即座にスケールアウトが実行されます。</p></li>
</ul>

</Admonition>

### トリガー条件\{#trigger-conditions}

- スケールアウト: CU計算が 2 分間連続で 60% を超えた場合にトリガーされます。

- スケールイン: CU計算が 10 分間連続で 40% を下回った場合にトリガーされます。

### スケーリングサイズの計算方法\{#scaling-size-calculation}

以下の式は、Zilliz Cloud が動的スケーリングイベント時の目標レプリカ数をどのように計算するかを示しています。動的スケーリングの計算式は、CU計算を目標値である 50% に維持することを目的としています。

```plaintext
Target Replica Count = Current Replica Count × (Current Metric Value / Target Metric Value) 
```

<table>
   <tr>
     <th><p>変数名</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>ターゲットレプリカ数</p></td>
     <td><p>システムがスケーリングを試みる新しいレプリカ数。</p></td>
   </tr>
   <tr>
     <td><p>現在のレプリカ数</p></td>
     <td><p>クラスターの現在のレプリカ数。</p></td>
   </tr>
   <tr>
     <td><p>現在のメトリクス値</p></td>
     <td><p>CU計算メトリクスの現在の測定値。</p></td>
   </tr>
   <tr>
     <td><p>ターゲットメトリクス値</p></td>
     <td><p>スケーリング後の期待されるCU計算値で、50%となる。</p></td>
   </tr>
</table>

たとえば、レプリカの動的スケーリングが有効になっており、以下の条件が満たされている場合：

- **現在のレプリカ数：1**

- **クラスターのCU計算：** 10分間60%を超える

動的スケーリングイベントがトリガーされます。ターゲットクエリCU数は次のように計算されます：

```plaintext
1 × (60 / 50) = 1.2
```

この値はその後、切り上げられて 2 となり、新しいレプリカ数が **2** になります。

### Procedures\{#procedures}

以下のデモでは、Zilliz Cloud ウェブコンソールで動的オートスケーリングを設定する方法を示します。

<Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

また、RESTful API を使用して動的スケーリングを設定することもできます。詳細については、[Modify Cluster](/reference/restful/modify-cluster-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "autoscaling": {
        "replica": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## スケーリングの進行状況を確認する\{#view-scaling-progress}

手動スケーリングのリクエストが送信された後、またはスケジュール済みもしくは動的スケーリングのイベントがトリガーされると、ジョブレコードが生成されます。進行状況は [ジョブ](./job-center) ページで確認できます。

スケーリングジョブが進行中の間、クラスターのステータスは「変更中」に変更されます。スケーリングジョブが成功すると、クラスターステータスは「Running」に変更されます。
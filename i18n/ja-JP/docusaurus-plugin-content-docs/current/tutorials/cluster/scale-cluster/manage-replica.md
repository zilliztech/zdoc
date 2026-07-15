---
title: "レプリカのスケーリング | Cloud"
slug: /manage-replica
sidebar_key: manage-replica
sidebar_label: "レプリカをスケーリング"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud はクラスターレベルのレプリケーションをサポートしています。各レプリカはクラスター内のリソースとデータの完全なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。 | Cloud"
type: origin
token: W8Mhwa4faiQqtRkH4t9cdexCnlf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - manage

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# レプリカのスケーリング

Zilliz Cloud はクラスタレベルのレプリケーションをサポートしています。各レプリカは、クラスタ内のリソースとデータの完全なコピーです。レプリカを使用することで、クエリのスループットと可用性を向上させることができます。

QPS のボトルネックが発生しているユーザーにとって、レプリカを追加することでクエリワークロードを分散させ、全体的なクエリスループットを向上させることができます。パフォーマンスを事前に最適化するために、[メトリクス](./metrics-alerts-reference) ページで **Query** **CU計算** を監視し、レプリカのスケーリングが必要なタイミングを判断することができます。

レプリカを追加してもクラスタ容量は増加しないことに注意してください。クラスタ容量は各クラスタのクエリ CU 数のみによって決定されるためです。クラスタ容量を増やしたい場合は、[クラスタのスケーリング](./scale-query-cu) を参照してください。

このガイドでは、Zilliz Cloud で **serving cluster** のレプリカを構成する手順について説明します。

このページの内容は serving cluster のみに適用されます。On-demand クラスタは自動的にスケールします — リクエストが到着すると起動し、アイドル時にはゼロにスケールバックし、手動での介入は不要です。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスタでのみ利用可能です。</p>

</Admonition>

## 考慮事項\{#considerations}

- **リソースの制限**: 以下の条件を満たしている場合、既存の Dedicated クラスタに対してレプリカを構成できます。

    - クラスタに 8 クエリ CU 以上があること

    - クラスタのクエリ CU 数 × レプリカ数 の積が 204,800 を超えないこと

- **スケーリング中の課金:** レプリカのスケーリングジョブ中、Zilliz Cloud は以前のレプリカ構成に基づいてクラスタに課金し続けます。新しいレプリカ数は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。スケーリングジョブが進行中の場合や完了しなかった場合、課金は以前のレプリカ構成に基づいたままです。

- **パフォーマンスへの影響**: スケーリングにより、わずかなサービスジッターが発生し、一時的にデータ読み取りへ影響する可能性があります。

## 手動スケーリング\{#manual-scaling}

既存の Dedicated クラスタのレプリカ数は、コンソールから手動で、またはプログラムで調整できます。

以下のデモでは、Zilliz Cloud Web コンソールでレプリカを構成する方法を示しています。

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

RESTful API を使用してクラスタ内のレプリカ数を手動で調整することもできます。詳細については、[クラスタレプリカの変更](/reference/restful/modify-cluster-replica-v2) を参照してください。

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

Zilliz Cloud Web コンソールまたは RESTful API を使用して、事前に定義された時間スケジュールに基づいてレプリカのスケーリングを構成できます。

スケジュール間の間隔は 30 分以上である必要があります。

高度なモードを使用して cron 式を記述する方法の詳細については、[Cron 式](./cron-expression) を参照してください。

次のデモでは、レプリカの自動スケーリングを有効にする方法を示しています。

<Supademo id="cmd2s33ac35zhc4kjj2zemejj" title=""  />

RESTful API を使用してレプリカのスケジュールされたスケーリングを構成することもできます。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

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

Zilliz Cloud は、手動介入を不要にしながらパフォーマンスを維持するためのレプリカの動的スケーリングをサポートしています。有効にすると、システムはリアルタイムの **CU計算** メトリクスに基づいて **レプリカ数** を自動的に調整し、サービス中断なくワークロードを効率的に処理します。

動的スケーリングを設定する際、以下の制限を設定できます:

- **最小レプリカ**: デフォルトは現在の数値です。

- **最大レプリカ**: デフォルトは現在の CU サイズの 1 倍です。最大レプリカは 100 を超えることはできません。この制限を引き上げる必要がある場合は、[サポートにお問い合わせ](http://support.zilliz.com) ください。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>現在の値より低い最大レプリカを選択すると、即座にスケールインがトリガーされます。</p></li>
<li><p>現在の値より高い最小レプリカを選択すると、即座にスケールアウトがトリガーされます。</p></li>
</ul>

</Admonition>

### トリガー条件\{#trigger-conditions}

- スケールアウト: CU計算が 2 分間 60% を超えた場合にトリガーされます。

- スケールイン: CU計算が 10 分間 40% を下回った場合にトリガーされます。

### スケーリングサイズの計算\{#scaling-size-calculation}

以下の式は、Zilliz Cloud が動的スケーリングイベントの目標レプリカ数を計算する方法を説明しています。動的スケーリングの式は、CU計算を 50% の目標値に維持することを目的としています。

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

この値は切り上げられて 2 となり、新しい **レプリカ数** は **2** になります。

### 手順\{#procedures}

以下のデモでは、Zilliz Cloud Web コンソールで動的オートスケーリングを設定する方法を示しています。

<Supademo id="cmk2agfmh01n4zk0iy6iu4vix" title=""  />

さらに、RESTful API を使用して動的スケーリングを設定することもできます。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

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

## スケーリングの進捗を確認する\{#view-scaling-progress}

手動スケーリングのリクエストが送信された、またはスケジュールされたスケーリングまたは動的スケーリングのイベントがトリガーされると、ジョブのレコードが生成されます。進捗は [ジョブ](./job-center) ページで確認できます。

スケーリング ジョブが進行中の場合、クラスターのステータスは "変更中" に変わります。スケーリング ジョブが成功すると、クラスターのステータスは "Running" に変わります。

---
title: "クエリ CU のスケール | Cloud"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "クエリ CU のスケール"
beta: FALSE
notebook: FALSE
description: "ワークロードの増加やデータ書き込みの拡大に伴い、サービングクラスターが容量制限に達する可能性があります。その場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。 | Cloud"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - クラスター
  - スケール
  - 管理
  - クエリ CU

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クエリ CU のスケーリング

ワークロードが増大し、より多くのデータが書き込まれるにつれて、サービングクラスターが容量制限に達する可能性があります。そのような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを事前に管理するために、[メトリクス](./metrics-alerts-reference) ページで**クエリ** **CU 容量**を監視し、クエリ CU のスケーリングが必要な時期を判断できます。ビジネスのニーズとパターンに基づいて、クエリ CU 数を増やしてクラスター容量を拡張したり、需要が減少した際にコスト削減のために減らしたりすることができます。

なお、1〜12 CU のサービングクラスターでは、クエリ CU を直接スケールできます。12 CU を超えるサービングクラスターの場合は、[レプリカ](./manage-replica) を増やす必要があります。

このガイドでは、変化するワークロードに合わせてサービングクラスターのサイズを変更する方法について説明します。

このページのコンテンツはサービングクラスターにのみ適用されます。オンデマンドクラスターは自動的にスケールします。リクエストが届くと起動し、アイドル状態になるとゼロまでスケールバックするため、手動での介入は不要です。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 考慮事項\{#considerations}

- **リソースの制限**: 

    - **スケールアップ**

        - Dedicated (Standard) クラスター: 最大 32 CU

            Dedicated (Enterprise) クラスター: 最大 1,024 CU

        - **クエリ CU 数** × **レプリカ数** の積は 10,240 を超えてはなりません

        より大きなクエリ CU については、[営業担当者にお問い合わせください](http://zilliz.com/contact-sales)。

    - **スケールダウン**

        - レプリカを持つクラスターは、12 CU 未満にスケールダウンできません

        - スケールダウンリクエストが成功するのは、以下の条件を満たす場合のみです:

            - 現在のデータ量が、新しい CU サイズの CU 容量の 80% 未満であること。

            - 現在のコレクションおよびパーティション数が、新しい CU サイズで許可される [コレクションおよびパーティションの最大数](./limits#collections) 未満であること。

- **スケーリング中**: クラスターのステータスが「変更中」に変化し、その間は操作を実行できません。複数のスケーリングタスクがトリガーされた場合、トリガータイムスタンプに基づいて順次処理されます。完了時間はデータ量に依存します。

- **パフォーマンスへの影響**: スケーリングにより、わずかなサービスのジッターが発生する可能性があります。

- **バックアップの制限**: 動的およびスケジュールされたスケーリング設定は [バックアップ](./create-snapshot) に含まれません。クラスターを復元した後、これらの設定を手動で再構成してください。

## 手動スケーリング\{#manual-scaling}

Zilliz Cloud コンソールまたは RESTful API を使用して、クラスターを手動でスケールアップまたはスケールダウンできます。

以下のデモでは、Zilliz Cloud Web コンソール上でクラスターを手動でスケールアップおよびスケールダウンする方法を示しています。

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

さらに、RESTful API を使用してクエリ CU を手動でスケールすることもできます。

以下の例では、既存のクラスターを 2 CU にスケールしています。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2
}'
```

## スケジュールされたスケーリング\{#scheduled-scaling}

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

スケジュール間の間隔は 30 分より大きくする必要があります。

cron 式を記述するための詳細モードの使用方法については、[Cron Expression](./cron-expression) を参照してください。

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

さらに、以下のようにしてスケジュールされたスケーリングを有効にすることもできます。詳細については、[Modify Cluster](/reference/restful/modify-cluster-v2) を参照してください。

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
        "cu": {
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

## Dynamic scaling\{#dynamic-scaling}

https://zilliverse.feishu.cn/sync/EaQKd6kURsSBc1bD8Loc4RsjnCg

Zilliz Cloud は、パフォーマンスを維持しつつ手動介入を不要にするための動的スケーリングをサポートしています。有効にすると、システムはリアルタイムの CU 容量メトリクスに基づいて**クエリ CU**リソースを自動的に調整し、サービス中断なくワークロードを効率的に処理します。

動的スケーリングを設定する際、以下の範囲を構成できます：

- **最小クエリ CU**: デフォルトは現在のサイズです。

- **最大クエリ CU**: デフォルトは現在の CU サイズの 4 倍です。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>現在の値よりも低い最大クエリ CU を選択すると、即座にスケールダウンがトリガーされます。</p></li>
<li><p>現在の値よりも高い最小クエリ CU を選択すると、即座にスケールアップがトリガーされます。</p></li>
</ul>

</Admonition>

### Trigger conditions\{#trigger-conditions}

- スケールアップ: CU 容量が 10 分間 80% を超えた場合にトリガーされます。または、CU 容量が 100% に達すると、即座にスケールアップがトリガーされます。

- スケールダウン: CU 容量が 30 分間 60% 未満の状態が続いた場合にトリガーされます。

- スケールアップイベントの間には 10 分間のクールダウン期間が適用され、スケールダウンイベントの間には 30 分間のクールダウン期間が適用されます。スケールダウンは、目標メトリクス値に達するまでサイズごとに実行されます。

### Scaling size calculation\{#scaling-size-calculation}

以下の数式は、動的スケーリングイベントにおける目標クエリ CU 数を Zilliz Cloud がどのように計算するかを説明しています。動的スケーリングの数式は、CU 容量を目標値である 70% に維持することを目的としています。

```plaintext
Target Query CU Number = Current Query CU Number × (Current Metric Value / Target Metric Value) 
```

<table>
   <tr>
     <th><p>変数名</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>ターゲットクエリCU数</p></td>
     <td><p>システムがクラスターをスケーリングしようとする新しいサイズ。</p></td>
   </tr>
   <tr>
     <td><p>現在のクエリCU数</p></td>
     <td><p>クラスターの現在のクエリCU数。</p></td>
   </tr>
   <tr>
     <td><p>現在のメトリクス値</p></td>
     <td><p>CU容量メトリクスの現在の測定値。</p></td>
   </tr>
   <tr>
     <td><p>ターゲットメトリクス値</p></td>
     <td><p>スケーリング後の期待されるCU容量値で、これは70である。</p></td>
   </tr>
</table>

たとえば、クエリCUの動的スケーリングが有効になっており、以下の条件が満たされている場合：

- **現在のクエリCU数：** 60 CU

- **クラスターのCU容量：** 10分間80%を超える

動的スケーリングイベントがトリガーされます。このとき、ターゲットクエリCU数は次のように計算されます：

```plaintext
60 × (80 / 70) ≈ 68.57 CU
```

この値は次に利用可能な CU 数に切り上げられ、新しいサイズは **72 CU** になります。

### 手順\{#procedures}

以下のデモでは、Zilliz Cloud ウェブコンソールで動的オートスケーリングを設定する方法を示します。

<Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

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
        "cu": {
            "min": 1,
            "max": 2
        }
    }
}'
```

## スケーリングの進捗を確認する\{#view-scaling-progress}

手動スケーリングのリクエストが送信された場合、またはスケジュール済みもしくは動的スケーリングのイベントがトリガーされると、ジョブレコードが生成されます。進捗状況は [ジョブ](./job-center) ページで確認できます。

スケーリングジョブが進行中の間、クラスターのステータスは「変更中」に変化します。スケーリングジョブが成功すると、クラスターステータスは「Running」に変化します。

## FAQ\{#faq}

1. **クラスターをスケールダウンする際の制限事項は何ですか？**

    レプリカを持つクラスターは、8 CU未満にスケールダウンできません。

    スケールダウンのリクエストが成功するのは、以下の両方の条件を満たす場合のみです。

    - 現在のデータ量が、新しいCUサイズの容量の80%未満であること。

    - コレクション数およびパーティション数が、新しいCUサイズで許容される上限内であること。


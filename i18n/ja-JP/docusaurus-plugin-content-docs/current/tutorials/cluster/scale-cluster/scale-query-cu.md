---
title: "クエリCUのスケーリング | Cloud"
slug: /scale-query-cu
sidebar_key: scale-query-cu
sidebar_label: "クエリCUをスケーリング"
beta: FALSE
notebook: FALSE
description: "ワークロードの増加やデータの書き込み量が多くなると、サービングクラスターが容量上限に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作が失敗する可能性があります。"
type: origin
token: ExUFwDY1siCa2Bkp4incCvxFnlh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - scale
  - manage
  - query cu

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クエリCUのスケーリング

ワークロードの増加とデータの書き込みが進むにつれて、サービングクラスターは容量の限界に達する可能性があります。このような場合、読み取り操作は引き続き機能しますが、新しい書き込み操作は失敗する可能性があります。

これを事前に管理するため、[メトリクス](./metrics-alerts-reference) ページで **Query** **CU容量** を監視し、クエリCUのスケーリングが必要なタイミングを判断できます。ビジネスニーズとパターンに基づいて、クラスター容量を拡張するためにクエリCU数を増やしたり、需要が減少した際にコストを削減するために減らしたりすることができます。

1 - 12 CUのサービングクラスターでは、クエリCUを直接スケーリングできます。12 CUを超えるサービングクラスターについては、[レプリカ](./manage-replica) を増やしてください。

このガイドでは、変化するワークロードに合わせてサービングクラスターのサイズを変更する方法について説明します。

このページの内容はサービングクラスターのみに適用されます。オンデマンドクラスターは自動的にスケーリングされます — リクエストが到着すると起動し、アイドル時にゼロにスケールバックし、手動での介入は不要です。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 考慮事項\{#considerations}

- **リソースの制限**: 

    - **スケールアップ**

        - Dedicated (Standard) クラスター: 最大32 CU

            Dedicated (Enterprise) クラスター: 最大1,024 CU

        - **クエリCU数** × **レプリカ数** の積は10,240を超えてはいけません

        より大きなクエリCUが必要な場合は、[営業部門にお問い合わせください](http://zilliz.com/contact-sales)。

    - **スケールダウン**

        - レプリカを持つクラスターは12 CU未満にスケールダウンできません

        - スケールダウンのリクエストは、以下の条件を満たす場合にのみ成功します:

            - 現在のデータ量 < 新しいCUサイズのCU容量の80%

            - 現在のコレクション数とパーティション数 < 新しいCUサイズで許可される[コレクションとパーティションの最大数](./limits#collections)

- **スケーリング中**: クラスターのステータスが「変更中」に変わり、この間は操作を実行できません。複数のスケーリングタスクがトリガーされた場合、トリガー時刻に基づいて順次処理されます。完了時間はデータ量に依存します。

- **スケーリング中の課金:** クエリ CU のスケーリングジョブ中、Zilliz Cloud は以前のクエリ CU 構成に基づいてクラスタに課金し続けます。新しいクエリ CU 数は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。スケーリングジョブが進行中の場合や完了しなかった場合、課金は以前のクエリ CU 構成に基づいたままです。

- **パフォーマンスへの影響**: スケーリングにより、わずかなサービスの揺らぎが発生する可能性があります。

- **バックアップの制限**: 動的およびスケジュールされたスケーリング設定は、[バックアップ](./create-backup) に含まれません。クラスターを復元後、これらの設定を手動で再構成してください。

## 手動スケーリング\{#manual-scaling}

Zilliz Cloud コンソールまたは RESTful API を使用して、クラスターを手動でスケールアップまたはスケールダウンできます。

以下のデモでは、Zilliz Cloud Web コンソールでクラスターを手動でスケールアップおよびスケールダウンする方法を示しています。

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

さらに、RESTful API を使用してクエリCUを手動でスケーリングすることもできます。

以下の例では、既存のクラスターを2 CUにスケーリングします。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

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

## Scheduled scaling\{#scheduled-scaling}

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクトの <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

スケジュール間の間隔は30分以上である必要があります。

詳細については、高度なモードを使用して cron 式を記述する方法について [Cron Expression](./cron-expression) を参照してください。

<Supademo id="cmj8904vh05581w0jubkrtlqk" title=""  />

さらに、以下のように スケジュールされたスケーリング を有効にすることもできます。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

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

この値は次に利用可能な CU 数に切り上げられ、新しいサイズは **72 CU** となります。

### 手順\{#procedures}

以下のデモでは、Zilliz Cloud Web コンソールで動的オートスケーリングを設定する方法を示しています。

<Supademo id="cmd2r7eqb34nbc4kj3wly357s?utm_source=link" title=""  />

また、RESTful API を使用して動的スケーリングを設定することもできます。詳細については、[クラスターの変更](/reference/restful/modify-cluster-v2) を参照してください。

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

手動スケーリングのリクエストが送信された、またはスケジュールされたスケーリングまたは動的スケーリングのイベントがトリガーされると、ジョブのレコードが生成されます。進捗は [ジョブ](./job-center) ページで確認できます。

スケーリングジョブが進行中の場合、クラスタのステータスは「変更中」に変わります。スケーリングジョブが成功すると、クラスタのステータスは「Running」に変わります。

## FAQ\{#faq}

**クラスタをスケールダウンする際の制限事項は何ですか？**

レプリカを持つクラスタは、8 CU 未満にスケールダウンすることはできません。

スケールダウンのリクエストは、以下の両方の条件が満たされた場合にのみ成功します。

- 現在のデータ量が、新しい CU サイズの容量の 80% 未満であること。

- コレクション数およびパーティション数が、新しい CU サイズで許可される上限内であること。

**Dedicated クラスタをスケーリングする場合、スケーリング中は古い構成と新しい構成のどちらに基づいて課金されますか？**

[スケーリング](./scale-cluster)中は、以前の構成に基づいて課金されます。新しい構成は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。

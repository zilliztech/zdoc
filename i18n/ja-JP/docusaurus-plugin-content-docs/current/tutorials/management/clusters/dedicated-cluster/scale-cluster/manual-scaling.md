---
title: "手動スケーリング | Cloud"
slug: /manual-scaling
sidebar_label: "手動スケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Manual scaling lets you resize a Dedicated serving クラスター when you know the target resource configuration you need. You can increase or decrease Query CU to adjust クラスター capacity, or increase or decrease replicas to adjust query throughput and availability. | Cloud"
type: origin
token: ByBTwOfgIie7e2k090Mc1EPknSf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 手動スケーリング

Manual scaling lets you resize a Dedicated serving クラスター when you know the target resource configuration you need. You can increase or decrease Query CU to adjust クラスター capacity, or increase or decrease replicas to adjust query throughput and availability.

手動スケーリングは、本番リリース、負荷テスト、移行期間、予測可能なトラフィック増加、またはトラフィック減少後の一時的なコスト最適化など、計画的な変更に役立ちます。

Note that manual scaling applies to serving クラスター only. On-demand クラスター scale automatically when requests arrive and scale back to zero when idle.

<Admonition type="info" title="Note">

Query CU の手動スケーリングはすべてのプランでサポートされています。

replica の手動スケーリングは Enterprise プラン以上でサポートされています。

オートスケーリングとスケジュールスケーリングは Enterprise プラン以上でサポートされています。

</Admonition>

## 開始前に\{#before-you-start}

Before you start, read [Plan クラスター Scaling](./plan-cluster-scaling) to understand the key scaling concepts and choose the right scaling approach for your workload.

## Web コンソールでの手動スケーリング\{#manual-scaling-via-web-console}

### Query CU を手動でスケーリングする\{#scale-query-cu-manually}

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Procedures>

1. Navigate to the **クラスター Details** page.

1. **Query** **CU Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、希望する新しい Query CU サイズを設定します。

1. **Save** をクリックします。

</Procedures>

### Replica を手動でスケーリングする\{#scale-replica-manually}

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Procedures>

1. Navigate to the **クラスター Details** page.

1. **Replica Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、希望する新しい replica 数を設定します。

1. **Save** をクリックします。

</Procedures>

## RESTful API による手動スケーリング\{#manual-scaling-via-restful-api}

With the RESTful API, you can manually scale Query CU and replica in a single [Modify クラスター](/reference/restful/modify-cluster-v2) request.

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/modify" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
-d '{
    "cuSize": 2,
    "replica": 2
}'
```

## スケーリングの進行状況を確認する\{#view-scaling-progress}

手動スケーリングリクエストが送信されると、Zilliz Cloud は job レコードを作成します。

<Procedures>

1. Zilliz Cloud コンソールで、対象の project に移動します。

1. **Jobs** に移動します。

1. Find the scaling job for the target クラスター.

1. job のステータスを確認します。

</Procedures>

When the scaling job is in progress, the クラスター status is `Modifying`. When the job succeeds, the クラスター status changes back to `Running`.

## FAQ\{#faq}

**新しい構成の課金はいつ開始されますか？**

新しい構成の課金は、スケーリング job が正常に完了した後にのみ開始されます。job がまだ実行中である場合、または完了しない場合、課金は以前の構成に基づいたままです。

**スケールダウンが許可されない場合はどうなりますか？**

A scale-down request may fail if the target Query CU size cannot support the current data volume, コレクション count, or partition count. In this case, keep the current size or choose a larger target configuration.

**手動スケーリング、スケジュールスケーリング、動的スケーリングのどれを使うべきですか？**

いつ、どの程度スケーリングするかが正確に分かっている場合は手動スケーリングを使用してください。繰り返し発生するトラフィックパターンにはスケジュールスケーリングを使用してください。予測不能なワークロードで、設定した範囲内で Zilliz Cloud に自動的にリソース調整を行わせたい場合は動的スケーリングを使用してください。


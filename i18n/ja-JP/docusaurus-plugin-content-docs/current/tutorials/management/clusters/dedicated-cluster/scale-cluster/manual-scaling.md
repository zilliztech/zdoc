---
title: "手動スケーリング | Cloud"
slug: /manual-scaling
sidebar_label: "手動スケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "手動スケーリングでは、必要なターゲットリソース構成が分かっている場合に Dedicated serving cluster のサイズを変更できます。Query CU を増減して cluster capacity を調整したり、replica を増減して query throughput と可用性を調整したりできます。 | Cloud"
type: origin
token: ByBTwOfgIie7e2k090Mc1EPknSf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 手動スケーリング

手動スケーリングでは、必要なターゲットリソース構成が分かっている場合に Dedicated serving cluster のサイズを変更できます。Query CU を増減して cluster capacity を調整したり、replica を増減して query throughput と可用性を調整したりできます。

手動スケーリングは、本番リリース、負荷テスト、移行期間、予測可能なトラフィック増加、またはトラフィック減少後の一時的なコスト最適化など、計画的な変更に役立ちます。

手動スケーリングは serving cluster にのみ適用される点に注意してください。On-demand cluster はリクエストの到着時に自動的にスケールし、アイドル時にはゼロまでスケールダウンします。

<Admonition type="info" icon="📘" title="注">

Query CU の手動スケーリングはすべてのプランでサポートされています。

replica の手動スケーリングは Enterprise プラン以上でサポートされています。

オートスケーリングとスケジュールスケーリングは Enterprise プラン以上でサポートされています。

</Admonition>

## 開始前に\{#before-you-start}

開始する前に、[Plan Cluster Scaling](./plan-cluster-scaling) を読んで、主要なスケーリングの概念を理解し、ワークロードに適したスケーリング方法を選択してください。

## Web コンソールでの手動スケーリング\{#manual-scaling-via-web-console}

### Query CU を手動でスケーリングする\{#scale-query-cu-manually}

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Query** **CU Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、希望する新しい Query CU サイズを設定します。

1. **Save** をクリックします。

</Procedures>

### Replica を手動でスケーリングする\{#scale-replica-manually}

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Replica Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、希望する新しい replica 数を設定します。

1. **Save** をクリックします。

</Procedures>

## RESTful API による手動スケーリング\{#manual-scaling-via-restful-api}

RESTful API を使用すると、1 回の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU と replica を手動でスケーリングできます。

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

1. 対象 cluster のスケーリング job を見つけます。

1. job のステータスを確認します。

</Procedures>

スケーリング job の進行中は、cluster のステータスは `Modifying` になります。job が成功すると、cluster のステータスは再び `Running` に戻ります。

## FAQ\{#faq}

**新しい構成の課金はいつ開始されますか？**

新しい構成の課金は、スケーリング job が正常に完了した後にのみ開始されます。job がまだ実行中である場合、または完了しない場合、課金は以前の構成に基づいたままです。

**スケールダウンが許可されない場合はどうなりますか？**

現在のデータ量、collection 数、または partition 数をターゲットの Query CU サイズでサポートできない場合、スケールダウンリクエストは失敗することがあります。この場合は、現在のサイズを維持するか、より大きいターゲット構成を選択してください。

**手動スケーリング、スケジュールスケーリング、動的スケーリングのどれを使うべきですか？**

いつ、どの程度スケーリングするかが正確に分かっている場合は手動スケーリングを使用してください。繰り返し発生するトラフィックパターンにはスケジュールスケーリングを使用してください。予測不能なワークロードで、設定した範囲内で Zilliz Cloud に自動的にリソース調整を行わせたい場合は動的スケーリングを使用してください。


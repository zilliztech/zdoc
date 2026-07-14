---
title: "手動スケーリング | BYOC"
slug: /manual-scaling
sidebar_label: "手動スケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "手動スケーリングでは、必要な目標リソース構成が分かっている場合に Dedicated serving cluster のサイズを変更できます。cluster 容量を調整するには Query CU を増減し、クエリスループットと可用性を調整するには replicas を増減できます。 | BYOC"
type: origin
token: ByBTwOfgIie7e2k090Mc1EPknSf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 手動スケーリング

手動スケーリングでは、必要な目標リソース構成が分かっている場合に Dedicated serving cluster のサイズを変更できます。cluster 容量を調整するには Query CU を増減し、クエリスループットと可用性を調整するには replicas を増減できます。

手動スケーリングは、本番リリース、負荷テスト、移行期間、予測可能なトラフィック増加、またはトラフィック減少後の一時的なコスト最適化など、計画的な変更に役立ちます。

手動スケーリングは serving cluster にのみ適用される点に注意してください。オンデマンド cluster は、リクエストが到着すると自動的にスケールし、アイドル時にはゼロまでスケールダウンします。

<Admonition type="info" icon="📘" title="注">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

replicas の手動スケーリングは、Enterprise プラン以上でサポートされています。

オートスケーリングとスケジュールスケーリングは、Enterprise プラン以上でサポートされています。

</Admonition>

## 開始前に\{#before-you-start}

始める前に、[Plan Cluster Scaling](./plan-cluster-scaling) を読んで、主要なスケーリングの概念を理解し、ワークロードに適したスケーリング方法を選択してください。

## Web コンソールでの手動スケーリング\{#manual-scaling-via-web-console}

### Query CU を手動でスケーリングする\{#scale-query-cu-manually}

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Query** **CU Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、必要な新しい query CU サイズを設定します。

1. **Save** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="注意">

**Scale Query Node CU** ダイアログボックスで **Save** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。十分でない場合は、次のいずれかを実行できます。 

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する、または

- **Back to Last Step** をクリックして、cluster 設定を変更する。

この処理中、ローリングのために追加のリソースが一時的に必要になります。これらのリソースは使用後に解放されます。

</Admonition>

### Replica を手動でスケーリングする\{#scale-replica-manually}

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Procedures>

1. **Cluster Details** ページに移動します。

1. **Replica Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、必要な新しい replica 数を設定します。

1. **Save** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="注意">

**Scale Cluster Replicas** ダイアログボックスで **Save** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。十分でない場合は、次のいずれかを実行できます。 

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する、または

- **Back to Last Step** をクリックして、cluster 設定を変更する。

この処理中、ローリングのために追加のリソースが一時的に必要になります。これらのリソースは使用後に解放されます。

</Admonition>

## RESTful API による手動スケーリング\{#manual-scaling-via-restful-api}

RESTful API を使用すると、単一の [Modify Cluster](/reference/restful/modify-cluster-v2) リクエストで Query CU と replica を手動でスケーリングできます。

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

手動スケーリングのリクエストが送信されると、Zilliz Cloud はジョブレコードを作成します。

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトに移動します。

1. **Jobs** に移動します。

1. 対象 cluster のスケーリングジョブを見つけます。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの進行中は、cluster ステータスは `Modifying` です。ジョブが成功すると、cluster ステータスは `Running` に戻ります。

## FAQ\{#faq}

**新しい構成はいつから課金されますか？**

新しい構成での課金は、スケーリングジョブが正常に完了した後にのみ開始されます。ジョブがまだ実行中であるか、完了しない場合、課金は以前の構成に基づいたままです。

**スケールダウンが許可されない場合はどうなりますか？**

ターゲットの Query CU サイズが現在のデータ量、collection 数、または partition 数をサポートできない場合、スケールダウンのリクエストは失敗することがあります。この場合は、現在のサイズを維持するか、より大きいターゲット構成を選択してください。

**手動スケーリング、スケジュールスケーリング、または動的スケーリングのどれを使うべきですか？**

いつ、どの程度スケーリングするかが正確に分かっている場合は、手動スケーリングを使用してください。定期的に繰り返すトラフィックパターンには、スケジュールスケーリングを使用してください。予測不可能なワークロードで、Zilliz Cloud が設定済みの範囲内で自動的にリソースを調整すべき場合は、動的スケーリングを使用してください。


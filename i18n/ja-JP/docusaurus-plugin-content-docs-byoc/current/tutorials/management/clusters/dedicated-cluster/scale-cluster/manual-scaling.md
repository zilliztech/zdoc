---
title: "手動スケーリング | BYOC"
slug: /manual-scaling
sidebar_label: "手動スケーリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "手動スケーリングを使用すると、必要なターゲットリソース構成が分かっている場合に、Dedicated サービングクラスターのサイズを変更できます。Query CU を増減してクラスターの容量を調整することも、レプリカを増減してクエリのスループットと可用性を調整することもできます。 | BYOC"
type: origin
token: ByBTwOfgIie7e2k090Mc1EPknSf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 手動スケーリング

手動スケーリングを使用すると、必要なターゲットリソース構成が分かっている場合に、Dedicated サービングクラスターのサイズを変更できます。Query CU を増減してクラスターの容量を調整することも、レプリカを増減してクエリのスループットと可用性を調整することもできます。

手動スケーリングは、本番リリース、負荷テスト、移行期間、予測可能なトラフィック増加、またはトラフィック減少後の一時的なコスト最適化など、計画的な変更に役立ちます。

手動スケーリングはサービングクラスターにのみ適用されます。オンデマンドクラスターは、リクエストが到着すると自動的にスケーリングされ、アイドル状態になるとゼロにスケールバックされます。

<Admonition type="info" title="Note">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

replicas の手動スケーリングは、Enterprise プラン以上でサポートされています。

オートスケーリングとスケジュールスケーリングは、Enterprise プラン以上でサポートされています。

</Admonition>

## 開始前に\{#before-you-start}

作業を始める前に、[クラスタースケーリングの計画](./plan-cluster-scaling) を参照し、スケーリングの主要な概念を理解した上で、ワークロードに適したスケーリング方法を選択してください。

## Web コンソールでの手動スケーリング\{#manual-scaling-via-web-console}

### Query CU を手動でスケーリングする\{#scale-query-cu-manually}

<Supademo id="cmd2r0jc634jlc4kju69onxyh?utm_source=link" title=""  />

<Procedures>

1. **クラスター Details** ページに移動します。

1. **Query** **CU Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、必要な新しい query CU サイズを設定します。

1. **Save** をクリックします。

</Procedures>

<Admonition type="info" title="Notes">

**Scale Query Node CU** ダイアログボックスで **Save** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。十分でない場合は、次のいずれかを実行できます。 

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する、または

- **Back to Last Step** をクリックして、クラスター設定を変更します。

この処理中、ローリングのために追加のリソースが一時的に必要になります。これらのリソースは使用後に解放されます。

</Admonition>

### Replica を手動でスケーリングする\{#scale-replica-manually}

<Supademo id="cmd2rwczv35ktc4kjyxwa5xwr" title=""  />

<Procedures>

1. **クラスター Details** ページに移動します。

1. **Replica Settings** カードの **Scale** をクリックします。

1. スケーリング方法として **Manual** を選択し、必要な新しい replica 数を設定します。

1. **Save** をクリックします。

</Procedures>

<Admonition type="info" title="Notes">

**Scale クラスター Replicas** ダイアログボックスで **Save** をクリックすると、プロジェクトのリソースクォータを確認するよう求められます。リソースが十分であれば、確認完了後にダイアログボックスは閉じます。十分でない場合は、次のいずれかを実行できます。 

- **Go To Project Resource Settings** をクリックして、プロジェクトのリソース設定を編集する、または

- **Back to Last Step** をクリックして、クラスター設定を変更します。

この処理中、ローリングのために追加のリソースが一時的に必要になります。これらのリソースは使用後に解放されます。

</Admonition>

## RESTful API による手動スケーリング\{#manual-scaling-via-restful-api}

RESTful API を使用すると、1 回の [Modify クラスター](/reference/restful/modify-cluster-v2) リクエストで Query CU とレプリカを手動でスケーリングできます。

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

1. 対象クラスターのスケーリングジョブを探します。

1. ジョブステータスを確認します。

</Procedures>

スケーリングジョブの実行中、クラスターのステータスは `Modifying` です。ジョブが成功すると、クラスターのステータスは `Running` に戻ります。

## FAQ\{#faq}

**新しい構成はいつから課金されますか？**

新しい構成での課金は、スケーリングジョブが正常に完了した後にのみ開始されます。ジョブがまだ実行中であるか、完了しない場合、課金は以前の構成に基づいたままです。

**スケールダウンが許可されない場合はどうなりますか？**

対象の Query CU サイズが現在のデータ量、コレクション数、またはパーティション数をサポートできない場合、スケールダウンリクエストが失敗することがあります。その場合は、現在のサイズを維持するか、より大きなターゲット構成を選択してください。

**手動スケーリング、スケジュールスケーリング、または動的スケーリングのどれを使うべきですか？**

いつ、どの程度スケーリングするかが正確に分かっている場合は、手動スケーリングを使用してください。定期的に繰り返すトラフィックパターンには、スケジュールスケーリングを使用してください。予測不可能なワークロードで、Zilliz Cloud が設定済みの範囲内で自動的にリソースを調整すべき場合は、動的スケーリングを使用してください。


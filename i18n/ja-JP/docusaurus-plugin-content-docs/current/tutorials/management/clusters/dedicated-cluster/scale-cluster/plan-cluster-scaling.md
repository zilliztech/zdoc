---
title: "クラスタースケーリングを計画する | Cloud"
slug: /plan-cluster-scaling
sidebar_label: "クラスタースケーリングを計画する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スケーリングは、データ量、collection 数、トラフィック、または可用性要件の増加に応じて、Dedicated serving cluster を健全に保つのに役立ちます。Zilliz Cloud では、通常 2 つの理由でスケールします | Cloud"
type: origin
token: GOCJwJktXizGTXkRfCEc9GGLnsb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラスタースケーリングを計画する

スケーリングは、データ量、collection 数、トラフィック、または可用性要件の増加に応じて、Dedicated serving cluster を健全に保つのに役立ちます。Zilliz Cloud では、通常 2 つの理由でスケールします。

- **容量圧力**: cluster がデータ、collection、partition、または index を保持して提供するために、より多くのリソースを必要としています。

- **クエリ計算圧力**: cluster はデータを保持できますが、クエリの同時実行数、QPS、またはレイテンシの要件により、より高い並列 serving 能力が必要です。

Dedicated serving clusters では、Query CUs または replicas を手動でスケールするか、auto-scaling または scheduled scaling を設定できます。 

オンデマンド cluster は自動的にスケールされるため、手動スケーリングは不要です。

<Admonition type="info" icon="📘" title="Note">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

replicas の手動スケーリングは、Enterprise プラン以上でサポートされています。

auto-scaling と scheduled scaling は、Enterprise プラン以上でサポートされています。

</Admonition>

## 何をスケールするかを理解する\{#understand-what-to-scale}

cluster に影響している圧力の種類に基づいて、スケーリング対象を選択します。

- cluster がロード済みデータ、collection、partition、または index を保持して提供するためにより多くの容量を必要とする場合は、Query CU をスケールします。

- cluster がすでにデータを保持できているものの、クエリトラフィックにより、より高い並列 serving 容量が必要な場合は、replicas をスケールします。

ほとんどの場合:

- Query CU は容量圧力に対応します。

- replicas はスループットと可用性の圧力に対応します。

<Admonition type="info" icon="📘" title="Note">

Query CU が限られている小規模な cluster では、**Query CU** を増やすことで QPS が向上する場合もあります。ただし、ほとんどの場合、検索スループットと可用性を向上させるには **replicas** をスケールしてください。

</Admonition>

## スケーリングのシグナルを特定する\{#identify-scaling-signals}

以下の症状を使用して、スケーリングが必要かどうか、およびどのリソースを調整するべきかを判断します。

| 症状 | 考えられる原因 | 推奨される対応 |
| --- | --- | --- |
| 書き込み操作が失敗し始めたが、クエリは引き続き動作する。 | cluster が容量上限に近づいている。 | Query CU を増やす。 |
| データ量が増え続けている。 | 容量要件が増加している。 | Query CU を増やす。 |
| collection または partition の数が、現在の仕様の上限に近づいている。 | 現在の cluster サイズでは十分な容量を提供できない。 | Query CU を増やす。 |
| QPS が増加し、クエリレイテンシが高くなっている。 | クエリ同時実行の圧力が増加している。 | replica を増やす。 |
| ピーク時間帯にはクエリが遅いが、オフピーク時間帯には正常である。 | 予測可能なピーク時にリソースが不足している。 | scheduled scaling または auto-scaling を有効にする。 |
| トラフィックが予測できない。 | ワークロードが大きく変動する。 | auto-scaling を有効にする。 |
| オフピーク時間帯にリソースがアイドル状態になっている。 | cluster が過剰にプロビジョニングされている。 | scheduled scaling または auto-scaling を有効にする。 |

## メトリクスを使ってスケーリングを判断する\{#use-metrics-to-guide-scaling}

Zilliz Cloud では、Query CU と replicas のどちらをスケールすべきかを判断するための 2 つのメトリクスを提供しています。

| Metric | 説明 | スケーリングの指針 |
| --- | --- | --- |
| Query CU Capacity | 現在の Query CU が容量上限にどれだけ近いかを測定します。これは、ロード済みデータが使用するメモリ量と、cluster のストレージクォータに対する保存データサイズのうち、高い方のシグナルを使用します。 | 継続的に高い値である場合、現在の Query CU サイズに十分な容量がない可能性があります。auto scaling が有効な場合、Zilliz Cloud はより多くの容量を提供するために Query CU をスケールアップすることがあります。 |
| Query CU Computation | クエリ実行が CPU リソースをどれだけ使用しているかを測定します。これは、CPU 上限に対する QueryNode の CPU 使用率から計算されます。 | 継続的に高い値は、クエリ実行が CPU ボトルネックになっていることを意味します。Zilliz Cloud は、並列クエリ処理能力を高めるために replicas をスケールアウトすることがあります。 |

## スケーリング方法を選択する\{#choose-a-scaling-method}

ワークロードの予測可能性と運用意図に基づいて、スケーリング方法を選択します。

| スケーリング方法 | 最適な用途 | 例 |
| --- | --- | --- |
| 手動スケーリング | タイミングと目標サイズが分かっている一度限りの変更。たとえば、ローンチ、負荷テスト、移行、大規模データインポートなど。 | 新しい RAG アプリケーションをローンチする前に、最初のユーザー群に備えて容量とクエリスループットを確保するため、Query CU と replica を増やします。 |
| scheduled scaling | 予測可能なトラフィックパターン、営業時間中に繰り返されるピーク、または固定時間のバッチ検索・評価ジョブ。 | 社内向けの AI Agent またはナレッジベースアプリケーションは、平日の営業時間中にトラフィックの大半を受けるため、cluster は朝にスケールアップし、夕方にスケールダウンします。 |
| auto-scaling | 予測不可能なワークロード、AI agents、インタラクティブなアプリケーション、カスタマーサポートボット、マルチモーダル検索。 | AI Agent は何時間もアイドル状態のままになることがある一方、複雑なプロンプトを処理したり長期記憶を取得したりする際に、多数の検索を突然トリガーする場合があります。auto-scaling はスパイク時にリソースを追加し、その後スケールダウンします。 |

## スケーリング動作を理解する\{#understand-scaling-behavior}

スケーリングリクエストが送信またはトリガーされると、Zilliz Cloud は要求された設定を検証し、スケーリングジョブを作成します。

スケーリングジョブの実行中:

- cluster のステータスは **Modifying** に変わります。

- suspend、migrate、drop などの一部の管理操作は一時的に利用できなくなります。

- 新しい設定の準備が整うまで、現在の設定で serving が継続されます。

- Zilliz Cloud はスケーリングのために [canary upgrade](./canary-upgrade) の仕組みを使用し、限定的な範囲で新しい設定を検証してから段階的にロールアウトします。その結果、スケーリング中に既存の接続が切断されることはありません。

- 新しい設定は、スケーリングジョブが正常に完了した後にのみ有効になります。

- スケーリングジョブが完了しない場合、cluster は引き続き以前の設定を使用します。

スケーリング操作により、一時的なサービスの揺らぎが発生する可能性があります。

進行状況は Jobs ページで追跡できます。ジョブが完了すると、cluster のステータスは Running に戻ります。

## スケーリング中の課金を理解する\{#understand-billing-during-scaling}

スケーリングジョブの実行中、Zilliz Cloud はスケーリング前の設定に基づいて cluster への課金を継続します。

新しい Query CU または replica の設定が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。このルールは、スケールアップとスケールダウンの両方に適用されます。

スケーリングジョブがまだ進行中であるか完了しない場合、課金は以前の設定に基づいたままです。

言い換えると、スケーリングジョブが正常に完了するまで、目標設定に対して課金されることはありません。

## 制限事項と要件を確認する\{#review-limits-and-requirements}

スケーリングを設定する前に、以下の制限事項を確認してください。

- replica のスケーリングには、最小 4 CUs の Query CU 設定が必要です。

- Query CU × replica には上限があります。詳細については、[Zilliz Cloud Limits](./limits#replicas) を参照してください。

- スケールダウンは、現在のデータ量、および現在の collection 数と partition 数が、目標仕様内に収まる場合にのみ成功します。

- scheduled scaling では、30 分を超えるスケジュール間隔が必要です。

## スケーリング結果を検証する\{#validate-scaling-results}

スケーリング後、以下のシグナルを確認して、変更が想定どおりに機能したことを確認します。

| Signal | 検証内容 |
| --- | --- |
| Query CU Capacity | 容量圧力が低下した。 |
| Query CU Computation | クエリ計算圧力が低下した。 |
| QPS と読み取りレイテンシ | クエリ性能が向上した。 |
| ジョブステータス | スケーリングジョブが正常に完了した。 |
| cluster ステータス | cluster が **Modifying** から **Running** に戻った。 |
| 課金または使用量データ | ジョブ完了後、課金が新しい設定に切り替わった。 |

## グローバル cluster のスケーリングを計画する\{#plan-global-cluster-scaling}

Global Cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なるルールに従います。

- **Query CU** はプライマリ cluster からスケールします。

- プライマリで Query CU をスケールすると、Zilliz Cloud は同じ Query CU 数をすべてのセカンダリ cluster に自動的に適用します。

- セカンダリ cluster は Query CU を個別にスケールできません。

- **Replica** は各プライマリまたはセカンダリ cluster ごとに個別にスケールします。

- 高トラフィック地域にはより多くの serving 容量を、低トラフィック地域またはスタンバイ地域にはより少ない replicas を割り当てるために、独立した replica 設定を使用します。

詳細については、[Global Cluster をスケールする](/docs/scale-global-cluster) を参照してください。

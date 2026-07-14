---
title: "クラスターのスケーリングを計画する | BYOC"
slug: /plan-cluster-scaling
sidebar_label: "クラスターのスケーリングを計画する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ量、collection 数、トラフィック、可用性要件の増加に応じて、Dedicated serving cluster を健全な状態に保つにはスケーリングが役立ちます。Zilliz Cloud では、通常 2 つの理由でスケーリングを行います | BYOC"
type: origin
token: GOCJwJktXizGTXkRfCEc9GGLnsb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラスターのスケーリングを計画する

データ量、collection 数、トラフィック、可用性要件の増加に応じて、Dedicated serving cluster を健全な状態に保つにはスケーリングが役立ちます。Zilliz Cloud では、通常 2 つの理由でスケーリングを行います。

- **容量の逼迫**: cluster がデータ、collections、partitions、または indexes を保持して提供するために、より多くのリソースを必要としています。

- **クエリ計算リソースの逼迫**: cluster はデータを保持できますが、クエリの同時実行数、QPS、またはレイテンシの要件により、より高い並列 serving 能力が必要です。

Dedicated serving clusters では、Query CUs または replicas を手動でスケーリングするか、自動スケーリングまたはスケジュールスケーリングを構成できます。 

オンデマンド cluster は自動的にスケーリングされるため、手動スケーリングは不要です。

<Admonition type="info" icon="📘" title="注">

Query CU の手動スケーリングは、すべてのプランでサポートされています。

replicas の手動スケーリングは、Enterprise プラン以上でサポートされています。

自動スケーリングとスケジュールスケーリングは、Enterprise プラン以上でサポートされています。

</Admonition>

## 何をスケーリングするかを理解する\{#understand-what-to-scale}

cluster に影響している逼迫の種類に基づいて、スケーリング対象を選択します。

- loaded data、collections、partitions、または indexes を保持して提供するために、cluster がより多くの容量を必要とする場合は、Query CU をスケーリングします。

- cluster がすでにデータを保持できていても、クエリトラフィックにより、より高い並列 serving 容量が必要な場合は、replicas をスケーリングします。

ほとんどの場合:

- Query CU は容量の逼迫に対応します。

- replicas はスループットと可用性の逼迫に対応します。

<Admonition type="info" icon="📘" title="注">

Query CUs が限られた小規模 cluster では、**Query CU** を増やすことで QPS も改善する場合があります。ただし、ほとんどの場合、検索スループットと可用性を改善するには **replicas** をスケーリングしてください。

</Admonition>

## スケーリングのシグナルを特定する\{#identify-scaling-signals}

スケーリングが必要かどうか、またどのリソースを調整すべきかを判断するには、次の症状を使用します。

| 症状 | 考えられる原因 | 推奨される対応 |
| --- | --- | --- |
| 書き込み操作が失敗し始めるが、クエリは引き続き動作する。 | cluster が容量上限に近づいている。 | Query CU を増やす。 |
| データ量が増え続けている。 | 容量要件が増加している。 | Query CU を増やす。 |
| collections または partitions の数が、現在の仕様の上限に近づいている。 | 現在の cluster サイズでは十分な容量が提供されていない。 | Query CU を増やす。 |
| QPS が増加し、クエリレイテンシが高くなる。 | クエリ同時実行の負荷が増加している。 | replica を増やす。 |
| ピーク時間帯にクエリが遅くなるが、オフピーク時間帯では正常である。 | 予測可能なピーク時にリソースが不足している。 | スケジュールスケーリングまたは自動スケーリングを有効にする。 |
| トラフィックが予測できない。 | ワークロードが大きく変動している。 | 自動スケーリングを有効にする。 |
| オフピーク時間帯にリソースがアイドル状態である。 | cluster が過剰にプロビジョニングされている。 | スケジュールスケーリングまたは自動スケーリングを有効にする。 |

## メトリクスを使ってスケーリングを判断する\{#use-metrics-to-guide-scaling}

Zilliz Cloud は、Query CU と replicas のどちらをスケーリングすべきか判断するために、2 つのメトリクスを提供します。

| Metric | 説明 | スケーリングの指針 |
| --- | --- | --- |
| Query CU Capacity | 現在の Query CU が容量上限にどれだけ近いかを測定します。これは、loaded data により使用されているメモリと、cluster のストレージクォータに対する保存データサイズという 2 つのシグナルのうち高い方を使用します。 | 高い値が継続する場合、現在の Query CU サイズでは十分な容量がない可能性があります。自動スケーリングが有効になっている場合、Zilliz Cloud はより多くの容量を提供するために Query CU をスケールアップすることがあります。 |
| Query CU Computation | クエリ実行が CPU リソースをどれだけ集中的に使用しているかを測定します。これは QueryNode の CPU 使用率をその CPU 上限に対して計算したものです。 | 高い値が継続する場合、クエリ実行が CPU ボトルネックになっています。Zilliz Cloud は、並列クエリ処理容量を増やすために replicas をスケールアウトすることがあります。 |

## スケーリング方法を選択する\{#choose-a-scaling-method}

ワークロードの予測可能性と運用意図に基づいて、スケーリング方法を選択します。

| Scaling method | 最適な用途 | 例 |
| --- | --- | --- |
| 手動スケーリング | ローンチ、負荷テスト、移行、大規模データインポートなど、タイミングと目標サイズが分かっている一度限りの変更。 | 新しい RAG アプリケーションをローンチする前に、最初のユーザー群に対応する容量とクエリスループットを確保するため、Query CU と replica を増やします。 |
| スケジュールスケーリング | 予測可能なトラフィックパターン、営業時間中の定期的なピーク、または固定時刻のバッチ検索や評価ジョブ。 | 社内 AI Agent またはナレッジベースアプリケーションは平日の業務時間中にトラフィックの大半を受けるため、cluster は朝にスケールアップし、夕方にスケールダウンします。 |
| 自動スケーリング | 予測不可能なワークロード、AI agents、インタラクティブアプリケーション、カスタマーサポート bots、マルチモーダル検索。 | AI Agent は何時間もアイドル状態のままのこともありますが、その後、複雑なプロンプトを処理したり長期記憶を取得したりする際に、多数の検索をトリガーすることがあります。自動スケーリングは、そのスパイク時にリソースを追加し、その後スケールダウンします。 |

## スケーリング動作を理解する\{#understand-scaling-behavior}

スケーリングリクエストが送信またはトリガーされると、Zilliz Cloud は要求された構成を検証し、スケーリングジョブを作成します。

スケーリングジョブ中は、次のようになります。

- cluster ステータスは **Modifying** に変わります。

- suspend、migrate、drop などの一部の管理操作は一時的に利用できなくなります。

- 現在の構成は、新しい構成の準備ができるまで引き続き serving を行います。

- Zilliz Cloud はスケーリングに [canary upgrade](./canary-upgrade) メカニズムを使用し、限定的な範囲で新しい構成を検証してから、段階的にロールアウトします。その結果、スケーリング中に既存の接続が切断されることはありません。

- 新しい構成は、スケーリングジョブが正常に完了した後にのみ有効になります。

- スケーリングジョブが完了しない場合、cluster は以前の構成を引き続き使用します。

スケーリング操作により、一時的なサービスのジッターが発生する場合があります。

進行状況は Jobs ページで追跡できます。ジョブが完了すると、cluster ステータスは Running に戻ります。

## 制限事項と要件を確認する\{#review-limits-and-requirements}

スケーリングを構成する前に、次の制限事項を確認してください。

- replica のスケーリングには、最低 4 CUs の Query CU 構成が必要です。

- Query CU × replica には上限があります。詳細については、[Zilliz Cloud Limits](./limits#replicas) を参照してください。

- スケールダウンは、現在のデータ量と現在の collections および partitions 数が、ターゲット仕様に収まる場合にのみ成功します。

- スケジュールスケーリングには、30 分を超えるスケジュール間隔が必要です。

## スケーリング結果を検証する\{#validate-scaling-results}

スケーリング後、次のシグナルを確認して、変更が期待どおりに機能したことを確認します。

| Signal | 検証内容 |
| --- | --- |
| Query CU Capacity | 容量の逼迫が低下した。 |
| Query CU Computation | クエリ計算リソースの逼迫が低下した。 |
| QPS と読み取りレイテンシ | クエリパフォーマンスが改善した。 |
| Job status | スケーリングジョブが正常に完了した。 |
| Cluster status | cluster が **Modifying** から **Running** に戻った。 |
| 請求または使用量データ | ジョブ完了後、請求が新しい構成に切り替わった。 |

## Global Cluster のスケーリングを計画する\{#plan-global-cluster-scaling}

Global Cluster のスケーリングは、通常の Dedicated cluster のスケーリングとは異なるルールに従います。

- **Query CU** は primary cluster からスケーリングします。

- primary で Query CU をスケーリングすると、Zilliz Cloud は自動的に同じ Query CU 数をすべての secondary clusters に適用します。

- secondary clusters は Query CU を個別にスケーリングできません。

- **Replica** は、各 primary または secondary cluster ごとに個別にスケーリングします。

- 高トラフィック地域にはより多くの serving 容量を、低トラフィック地域またはスタンバイ地域にはより少ない replicas を割り当てるために、独立した replica 設定を使用します。

詳細については、[Global Cluster をスケーリングする](/docs/scale-global-cluster) を参照してください。

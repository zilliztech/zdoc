---
title: "クラスターメトリックチャートの表示 | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "クラスターメトリックチャートの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供します。この機能にアクセスするには、クラスターのいずれかで「メトリクス」タブに移動します。 | BYOC"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - view
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS

---

import Admonition from '@theme/Admonition';


# クラスターメトリックチャートの表示

Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供します。この機能にアクセスするには、クラスターのいずれかで **メトリクス** タブに移動します。

![view_metric_charts](/img/view_metric_charts.png)

## クラスターメトリックチャートへのアクセス\{#access-cluster-metric-charts}

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login) で、ターゲットクラスターを検索し、**メトリクス** タブを選択します。

Zilliz Cloudのメトリックチャートは、リソース使用量、1秒あたりのクエリ数（QPS）、リクエスト結果、およびデータ操作に関するパフォーマンスデータを提供し、特定の時間範囲内で詳細な分析を可能にします。

<Admonition type="info" icon="📘" title="ノート">

<p>右側の<strong>アラート設定の表示</strong>をクリックすると、<strong>アラート設定</strong>ページにリダイレクトされ、アラート管理のショートカットが提供されます。</p>

</Admonition>

各メトリックチャートの詳細については、[メトリックチャートの表示](./view-cluster-metric-charts#view-metric-charts)を参照してください。

## 曲線ウィンドウサイズの変更\{#modify-curve-window-size}

**メトリクス** タブでは、2種類のウィンドウサイズが使用できます。

- **相対範囲**： 現在の時刻に対する事前定義された時間期間から選択します。相対時間範囲を使用すると、特定の開始時刻と終了時刻を入力する必要なく、定期的かつ便利な方法でメトリクスを確認できます。選択肢は以下の通りです。

    - 過去10分

    - 過去1時間

    - 過去6時間

    - 過去12時間

    - 過去1日

    - 過去1週間

    - 過去1か月

- **絶対範囲**： 始点時刻と終了時刻を正確に入力します。絶対範囲を使用すると、より微調整された方法で表示するメトリクスを制御できます。

    - 開始時刻と終了時刻の時間差は10分以上である必要があります。

## メトリックチャートの表示\{#view-metric-charts}

Zilliz Cloudは、さまざまな側面からクラスターパフォーマンスを監視するためのメトリックチャートを提供します。

### Podリソース\{#pod-resources}

Podリソース消費を効果的に追跡するには、**メトリクス** タブを選択し、**Podリソース** エリアを参照してください。ここには、各PodのCPU、ストレージ、およびネットワーク使用量を表示する簡潔なグラフが表示されます。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

### リソース\{#resources}

リソース使用量のメトリックチャートを表示するには、**メトリクス** タブを選択し、**リソース** エリアを参照してください。これらのチャートは、計算、容量、およびストレージを含むクラスターのリソース使用量のスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

### パフォーマンス\{#performance}

パフォーマンスのメトリックチャートを表示するには、**メトリクス** タブを選択し、**パフォーマンス** エリアを参照してください。これらのチャートは、QPS、VPS、レイテンシ、およびリクエストを含むクラスターパフォーマンスのスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

### データ\{#data}

ビジネスデータのメトリックチャートを表示するには、**メトリクス** タブを選択し、**データ** エリアを参照してください。これらのチャートは、クラスター内のコレクション数、エンティティ数、およびロードされたエンティティ数を示すことで、クラスターのエンティティデータのスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

## 関連トピック\{#related-topics}

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)

- [メトリクスおよびアラートリファレンス](./metrics-alerts-reference)
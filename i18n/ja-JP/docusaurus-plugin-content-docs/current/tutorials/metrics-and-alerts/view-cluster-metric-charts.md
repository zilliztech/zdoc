---
title: "クラスタのメトリックチャートを表示する | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "クラスタのメトリックチャートを表示する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供しています。この機能にアクセスするには、クラスター内のメトリクスタブに移動してください。 | Cloud"
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
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# クラスタのメトリックチャートを表示する

Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供しています。この機能にアクセスするには、クラスター内の**メトリクス**タブに移動してください。

<Admonition type="info" icon="📘" title="ノート">

<p>無料クラスタでは、読み書き可能なvCUのみが利用可能です。高度なメトリックの範囲を解除するには、<a href="./manage-cluster">プランレベルをアップグレードする</a>を使用してください。</p>

</Admonition>

</exclude>

![view_metric_charts](/img/view_metric_charts.png)

## クラスタメトリックチャートへのアクセス{#access-cluster-metric-charts}

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)で、ターゲットクラスターを見つけ、**メトリックス**タブを選択してください。

Zilliz Cloudのメトリックチャートは、リソース使用量、1秒あたりのクエリ数（QPS）、リクエスト結果、およびデータ操作に関するパフォーマンスデータを提供し、特定の時間範囲内で細かい分析を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>右側の「アラート設定の表示」をクリックすると、「アラート設定」ページにリダイレクトされ、アラートを管理するためのショートカットが提供されます。</p>

</Admonition>

各メトリックチャートの詳細については、[メトリックチャートを表示する](./view-cluster-metric-charts#view-metric-charts)を参照してください。

## カーブウィンドウの体格を変更{#modify-curve-window-size}

「メトリクス」タブでは、2種類のウィンドウサイズが可能です。

- 相対範囲:現在時刻に対して事前に定義された時間帯のセットから選択してください。相対時間範囲を使用すると、特定の開始時間と終了時間を入力する必要がなく、定期的かつ便利な方法でメトリックをチェックできます。選択肢には、以下が含まれます:

    - ラスト10分

    - 最後の1時間

    - 最後の6時間

    - 最後の12時間

    - 最後の日

    - 先週

    - 先月

- **絶対範囲**:正確な開始時刻と終了時刻を入力してください。絶対範囲を使用すると、表示されるメトリックをより細かく制御できます。

    - 開始時間と終了時間の時間差は大なり10分です。

## メトリックチャートを表示する{#view-metric-charts}

Zilliz Cloudは、さまざまな側面からクラスターのパフォーマンスを監視するためのメトリックチャートを提供しています。

### ポッドのリソース{#pod-resources}

ポッドのリソース消費を効果的に追跡するには、**メトリックス**タブを選択し、**ポッドリソース**エリアを参照してください。ここでは、各ポッドのCPU、ストレージ、およびネットワーク使用状況を示す簡潔なグラフが表示されます。利用可能なメトリックスの概要については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference#cluster-metrics)を参照してください。

</include>

### リソース{#resources}

リソース使用状況のメトリックチャートを表示するには、**Metrics**タブを選択し、**Resources**エリアを参照してください。これらのチャートは、計算、容量、ストレージを含むクラスタのリソース使用状況のスナップショットを提供します。利用可能なメトリックの簡単な概要については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference#cluster-metrics)を参照してください。

### パフォーマンス{#performance}

パフォーマンスのメトリックチャートを表示するには、**Metrics**タブを選択し、**Performance**エリアを参照してください。これらのチャートは、QPS、VPS、レイテンシ、およびリクエストを含むクラスターパフォーマンスのスナップショットを提供します。利用可能なメトリックの簡単な概要については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference#cluster-metrics)を参照してください。

### データ{#data}

ビジネスデータのメトリックチャートを表示するには、**メトリックス**タブを選択し、**データ**エリアを参照してください。これらのチャートは、クラスター内のコレクション、エンティティ、およびロードされたエンティティの数を示すことで、クラスターのエンティティデータのスナップショットを提供します。利用可能なメトリックの概要については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference#cluster-metrics)を参照してください。

## 関連するトピック{#related-topics}

- [組織のアラートを管理する](./manage-organization-alerts)

- [プロジェクトのアラートを管理する](./manage-project-alerts)

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)


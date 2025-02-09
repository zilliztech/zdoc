---
title: "クラスタのメトリックチャートを表示する | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "クラスタのメトリックチャートを表示する"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスタ固有のメトリクスを観察するためのダッシュボードを提供しています。この機能にアクセスするには、クラスタ内のメトリクスタブに移動してください。 | BYOC"
type: origin
token: QvFswrMqhiWBwjkI58NcY5X1nTd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - metrics
  - alerts
  - view
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database

---

import Admonition from '@theme/Admonition';


# クラスタのメトリックチャートを表示する

Zilliz Cloudは、クラスタ固有のメトリクスを観察するためのダッシュボードを提供しています。この機能にアクセスするには、クラスタ内の**メトリクス**タブに移動してください。

![view_metric_charts](/byoc/ja-JP/view_metric_charts.png)

## クラスタメトリックチャートへのアクセス{#access-cluster-metric-charts}

Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)でターゲットクラスタを探し、**メトリクス**タブを選択します。

Zilliz Cloudのメトリックチャートは、リソース使用量、1秒あたりのクエリ数(QPS)、リクエスト結果、データ操作に関するパフォーマンスデータを提供し、特定の時間範囲内で詳細な分析を提供します。

<Admonition type="info" icon="Notes" title="undefined">

<p>右側の[<strong>アラート設定</strong>の表示]をクリックすると、<strong>アラート設定</strong>ページにリダイレクトされ、アラートを管理するためのショートカットが表示されます。</p>

</Admonition>

各メトリックチャートの詳細については、「[メトリックチャートの表示](./view-cluster-metric-charts#view-metric-charts)」を参照してください。

## カーブウィンドウの体格を変更{#modify-curve-window-size}

[**メトリック**]タブでは、2種類のウィンドウサイズを使用できます。

- **相対範囲**:現在時刻に対して事前に定義された時間帯のセットから選択してください。相対時間範囲を使用すると、特定の開始時間と終了時間を入力する必要なく、定期的かつ便利な方法でメトリックをチェックできます。選択肢には以下が含まれます:

    - ラスト10分

    - 最後の1時間

    - 最後の6時間

    - 最後の12時間

    - 最後の日

    - 先週

    - 先月

- **絶対範囲**:正確な開始時刻と終了時刻を入力します。絶対範囲を使用すると、表示されるメトリックをより細かく制御できます。

    - 開始時間と終了時間の時間差は大なり10分です。

## メトリックチャートを表示する{#view-metric-charts}

Zilliz Cloudは、さまざまな側面からクラスターのパフォーマンスを監視するためのメトリックチャートを提供しています。

### ポッドのリソース{#pod-resources}

ポッドリソースの消費を効果的に追跡するには、**メトリクス**タブを選択し、**ポッドリソース**エリアを参照してください。ここでは、各ポッドのCPU、ストレージ、およびネットワーク使用状況を示す簡潔なグラフが表示されます。利用可能なメトリクスの概要については、[メトリクスとアラートのリファレンス](./metrics-alerts-reference)を参照してください。

### リソース{#resources}

リソース使用量のメトリックチャートを表示するには、「**メトリック**」タブを選択し、「**リソース**」エリアを参照してください。これらのチャートは、計算、容量、ストレージを含むクラスタのリソース使用量のスナップショットを提供します。利用可能なメトリックの概要については、「[メトリクスとアラートのリファレンス](./metrics-alerts-reference)」を参照してください。

### パフォーマンス{#performance}

パフォーマンスのメトリックチャートを表示するには、[**メトリック**]タブを選択し、[**パフォーマンス**]領域を参照してください。これらのチャートには、QPS、VPS、レイテンシ、リクエストなどのクラスターパフォーマンスのスナップショットが表示されます。利用可能なメトリックの概要については、「[メトリクスとアラートのリファレンス](./metrics-alerts-reference)」を参照してください。

### データ{#data}

ビジネスデータのメトリックチャートを表示するには、「**メトリック**」タブを選択し、「**データ**」エリアを参照してください。これらのチャートは、クラスタ内のコレクション、エンティティ、ロードされたエンティティの数を示すことで、クラスタのエンティティデータのスナップショットを提供します。利用可能なメトリックの概要については、「[メトリクスとアラートのリファレンス](./metrics-alerts-reference)」を参照してください。

## 関連するトピック{#related-topics}

- [組織のアラートを管理する](./manage-organization-alerts)

- [プロジェクトのアラートを管理する](./manage-project-alerts)

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)


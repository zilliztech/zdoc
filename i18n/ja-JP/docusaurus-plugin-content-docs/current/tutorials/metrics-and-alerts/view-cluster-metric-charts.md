---
title: "クラスターメトリクスチャートを表示 | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "クラスターメトリクスチャートを表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供します。この機能にアクセスするには、クラスターの1つ内でメトリクスタブに移動します。 | Cloud"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - メトリクス
  - アラート
  - 表示
  - Faissベクターデータベース
  - Chromaベクターデータベース
  - nlp検索
  - ハルシネーションllm

---

import Admonition from '@theme/Admonition';


# クラスターメトリクスチャートを表示

Zilliz Cloudは、クラスター固有のメトリクスを観察するためのダッシュボードを提供します。この機能にアクセスするには、クラスターの1つ内で**メトリクス**タブに移動します。

<Admonition type="info" icon="📘" title="注意">

<p>無料クラスターでは、読取りおよび書込みvCUのみが利用可能です。高度なメトリクスの範囲を解放するには、<a href="./manage-cluster#upgrade-deployment-option">プランティアをアップグレード</a>してください。</p>

</Admonition>

![view_metric_charts](/img/view_metric_charts.png)

## クラスターメトリクスチャートにアクセス\{#access-cluster-metric-charts}

[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)で、対象クラスターを見つけ、**メトリクス**タブを選択します。

Zilliz Cloudのメトリクスチャートは、リソース使用量、1秒あたりのクエリ数（QPS）、リクエスト結果、およびデータ操作に関するパフォーマンスデータを提供し、特定の時間範囲内で詳細な分析を提供します。

<Admonition type="info" icon="📘" title="注意">

<p>右側の<strong>アラート設定を表示</strong>をクリックすると、<strong>アラート設定</strong>ページにリダイレクトされ、アラートを管理するためのショートカットが提供されます。</p>

</Admonition>

各メトリクスチャートの詳細については、[メトリクスチャートを表示](./view-cluster-metric-charts#view-metric-charts)を参照してください。

## 曲線ウィンドウサイズを変更\{#modify-curve-window-size}

**メトリクス**タブでは、2種類のウィンドウサイズが可能です。

- **相対範囲**: 現在の時間に対する事前定義された時間期間から選択します。相対時間範囲を使用すると、特定の開始時間と終了時間を入力する必要なく、期間的に便利な方法でメトリクスを確認できます。選択肢：

    - 遫分前

    - 遫時間前

    - 遫6時間前

    - 火12時間前

    - 火日前

    - 火週間前

    - 火月間前

- **絶対範囲**: 精確な開始時間と終了時間を入力します。絶対範囲を使用すると、より細かく調整された方法で確認するメトリクスを制御できます。

    - 開始時間と終了時間の時間差は10分より大きくする必要があります。

## メトリクスチャートを表示\{#view-metric-charts}

Zilliz Cloudは、さまざまな側面からクラスターパフォーマンスを監視するためのメトリクスチャートを提供します。

### リソース\{#resources}

リソース使用量のメトリクスチャートを表示するには、**メトリクス**タブを選択し、**リソース**領域を参照してください。これらのチャートは、計算、容量、およびストレージを含むクラスターのリソース使用量のスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

### パフォーマンス\{#performance}

パフォーマンスのメトリクスチャートを表示するには、**メトリクス**タブを選択し、**パフォーマンス**領域を参照してください。これらのチャートは、QPS、VPS、待機時間、およびリクエストを含むクラスターパフォーマンスのスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

### データ\{#data}

ビジネスデータのメトリクスチャートを表示するには、**メトリクス**タブを選択し、**データ**領域を参照してください。これらのチャートは、クラスター内のコレクション数、エンティティ数、およびロードされたエンティティ数を示すことで、クラスターのエンティティデータのスナップショットを提供します。利用可能なメトリクスの概要については、[メトリクスおよびアラートリファレンス](./metrics-alerts-reference#project-level-metrics-cluster-metrics)を参照してください。

## 関連トピック\{#related-topics}

- [組織アラートを管理](./manage-organization-alerts)

- [プロジェクトアラートを管理](./manage-project-alerts)

- [メトリクスおよびアラートリファレンス](./metrics-alerts-reference)

---
title: "メトリックチャートを表示 | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "メトリックチャートを表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、クラスター レベルとコレクション レベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリックチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、およびデータ操作のパフォーマンスデータを確認できます。 | BYOC"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# メトリックチャートを表示

Zilliz Cloud は、クラスター レベルとコレクション レベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリックチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、およびデータ操作のパフォーマンスデータを確認できます。

## クラスター メトリクスを表示\{#view-cluster-metrics}

クラスター全体のメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)で対象のクラスターに移動し、**Metrics** タブを選択します。

Zilliz Cloud のメトリックチャートでは、リソース使用量、1 秒あたりのクエリ数（QPS）、リクエスト結果、およびデータ操作に関するパフォーマンスデータが提供され、特定の時間範囲内で詳細な分析を行えます。

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

クラスターのメトリックチャートは、以下のグループに整理されています。

### Pod とコンテナのリソース\{#pod-and-container-resources}

Pod のリソース消費を効果的に追跡するには、**Metrics** タブを選択し、**Pod Resources** エリアを参照してください。ここでは、各 Pod の CPU、ストレージ、およびネットワーク使用量を表示する簡潔なグラフを確認できます。利用可能なメトリクスの概要については、[Metrics Reference](./metrics-alerts-reference#pod-and-container-resources) を参照してください。

### リソース\{#resources}

これらのチャートは、CU computation、CU capacity、ストレージを含むクラスターのリソース使用状況を示します。リソースメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#resources) を参照してください。

### パフォーマンス\{#performance}

これらのチャートは、QPS、レイテンシ、リクエスト失敗率、およびスループットを含むクラスターのパフォーマンスを示します。パフォーマンスメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#performance) を参照してください。

### データ\{#data}

これらのチャートは、コレクション数、エンティティ数、ロード済みエンティティ数を含むクラスターのデータ状態を示します。データメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#data) を参照してください。

右側の **View Alerts Settings** をクリックすると、**Alert Settings** ページにリダイレクトされ、アラートを管理するためのショートカットとして利用できます。

## コレクション メトリクスを表示\{#view-collection-metrics}

クラスター メトリクスの一部は、**コレクション レベルでも**利用可能であり、個々のコレクションのパフォーマンス問題を特定し、容量計画を立てるのに役立ちます。

コレクション レベルのメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)で対象のコレクションに移動し、**Metrics** タブを選択します。

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

チャートのレイアウトと時間範囲のコントロールは、クラスターの **Metrics** タブと同一です。各チャートには、クラスター全体ではなく、選択したコレクションにスコープされた同じメトリクス定義が表示されます。

## カーブのウィンドウサイズを変更\{#modify-curve-window-size}

**Metrics** タブでは、2 種類のウィンドウサイズを使用できます。

- **Relative Range**: 現在時刻に対する事前定義済みの時間期間セットから選択します。相対時間範囲を使用すると、開始時刻と終了時刻を個別に入力する必要なく、定期的かつ便利にメトリクスを確認できます。選択肢は次のとおりです。

    - Last 10 minutes

    - Last hour

    - Last 6 hours

    - Last 12 hours

    - Last day

    - Last week

    - Last month

- **Absolute Range**: 正確な開始時刻と終了時刻を入力します。絶対範囲を使用すると、表示するメトリクスをより細かく制御できます。

    - 開始時刻と終了時刻の差は 10 分より長くする必要があります。

## 関連トピック\{#related-topics}

- [Organization アラートを管理](./manage-organization-alerts)

- [Project アラートを管理](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)


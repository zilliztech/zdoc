---
title: "メトリックチャートの表示 | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "メトリックチャートの表示"
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

# メトリックチャートの表示

Zilliz Cloud は、クラスター レベルとコレクション レベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリックチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、およびデータ操作のパフォーマンスデータを確認できます。

## クラスター メトリクスを表示する\{#view-cluster-metrics}

クラスター全体のメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)で対象のクラスターに移動し、**Metrics** タブを選択します。

Zilliz Cloud のメトリックチャートでは、リソース使用量、1 秒あたりのクエリ数（QPS）、リクエスト結果、およびデータ操作に関するパフォーマンスデータが提供され、特定の時間範囲内で詳細な分析を行えます。

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

クラスターのメトリックチャートは、以下のグループに整理されています。

### Pod & container resources\{#pod-and-container-resources}

Pod のリソース消費を効果的に追跡するには、**Metrics** タブを選択し、**Pod Resources** エリアを参照してください。ここでは、各 Pod の CPU、ストレージ、ネットワーク使用量を表示する簡潔なグラフを確認できます。利用可能なメトリクスの概要については、[Metrics Reference](./metrics-alerts-reference#pod-and-container-resources) を参照してください。

### Resources\{#resources}

これらのチャートには、CU computation、CU capacity、ストレージを含む、クラスターのリソース使用状況が表示されます。リソースメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#resources) を参照してください。

### Performance\{#performance}

これらのチャートには、QPS、レイテンシ、リクエスト失敗率、スループットを含む、クラスターのパフォーマンスが表示されます。パフォーマンスメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#performance) を参照してください。

### Data\{#data}

これらのチャートには、コレクション数、エンティティ数、ロード済みエンティティ数を含む、クラスターのデータ状態が表示されます。データメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#data) を参照してください。

右側の **View Alerts Settings** をクリックすると、**Alert Settings** ページに移動し、アラートを管理するためのショートカットとして利用できます。

## コレクション メトリクスを表示する\{#view-collection-metrics}

クラスター メトリクスの一部は **コレクション レベルでも** 利用でき、個々のコレクションにおけるパフォーマンスの問題の特定や容量計画に役立ちます。

コレクション レベルのメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)で対象のコレクションに移動し、**Metrics** タブを選択します。

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

チャートのレイアウトと時間範囲のコントロールは、クラスターの **Metrics** タブにあるものと同じです。各チャートには、クラスター全体ではなく、選択したコレクションを対象範囲とした同じメトリクス定義が表示されます。

## カーブのウィンドウサイズを変更する\{#modify-curve-window-size}

**Metrics** タブでは、2 種類のウィンドウサイズを使用できます。

- **Relative Range**: 現在時刻を基準にした、あらかじめ定義された時間範囲のセットから選択します。相対時間範囲を使用すると、特定の開始時刻と終了時刻を入力する必要がなく、定期的かつ便利にメトリクスを確認できます。選択肢は次のとおりです。

    - 過去 10 分

    - 過去 1 時間

    - 過去 6 時間

    - 過去 12 時間

    - 過去 1 日

    - 過去 1 週間

    - 過去 1 か月

- **Absolute Range**: 正確な開始時刻と終了時刻を入力します。絶対時間範囲を使用すると、表示するメトリクスをより細かく制御できます。

    - 開始時刻と終了時刻の差は 10 分を超えている必要があります。

## 関連トピック\{#related-topics}

- [組織のアラートを管理する](./manage-organization-alerts)

- [プロジェクトのアラートを管理する](./manage-project-alerts)

- [Metrics & Alerts リファレンス](./metrics-alerts-reference)


---
title: "メトリックチャートを表示 | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "メトリックチャートを表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はクラスター レベルとコレクション レベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリックチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、データ操作のパフォーマンスデータを確認できます。 | Cloud"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# メトリックチャートを表示

Zilliz Cloud はクラスター レベルとコレクション レベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリックチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、データ操作のパフォーマンスデータを確認できます。

## クラスター メトリクスを表示する\{#view-cluster-metrics}

クラスター全体のメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で対象のクラスターに移動し、**Metrics** タブを選択します。

Zilliz Cloud のメトリックチャートでは、リソース使用量、1 秒あたりのクエリ数（QPS）、リクエスト結果、データ操作のパフォーマンスデータを提供し、特定の時間範囲内で詳細な分析を行えます。

<Admonition type="info" icon="📘" title="📘 注記">

無料クラスターでは、読み取り & 書き込み vCU のみ利用可能です。さまざまな高度なメトリクスを利用するには、[プランのティアをアップグレード](./manage-cluster)してください。

</Admonition>

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

クラスターのメトリックチャートは、次のグループに整理されています。

### リソース\{#resources}

これらのチャートは、CU コンピュート、CU 容量、ストレージを含むクラスターのリソース使用量を表示します。リソースメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#resources) を参照してください。

### パフォーマンス\{#performance}

これらのチャートは、QPS、レイテンシ、リクエスト失敗率、スループットを含むクラスターのパフォーマンスを表示します。パフォーマンスメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#performance) を参照してください。

### データ\{#data}

これらのチャートは、コレクション数、エンティティ数、ロード済みエンティティ数を含むクラスターのデータ状態を表示します。データメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#data) を参照してください。

右側の **View Alerts Settings** をクリックすると、**Alert Settings** ページにリダイレクトされ、アラートを管理するためのショートカットとして利用できます。

## コレクション メトリクスを表示する\{#view-collection-metrics}

クラスター メトリクスの一部は **コレクション レベル** でも利用可能で、個々のコレクションのパフォーマンス問題を特定し、容量計画を立てるのに役立ちます。

コレクション レベルのメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でコレクションに移動し、**Metrics** タブを選択します。

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

チャートのレイアウトと時間範囲のコントロールは、クラスターの **Metrics** タブのものと同一です。各チャートには、クラスター全体ではなく、選択したコレクションにスコープされた同じメトリクス定義が表示されます。

## カーブのウィンドウサイズを変更する\{#modify-curve-window-size}

**Metrics** タブでは、2 種類のウィンドウサイズを利用できます。

- **Relative Range**: 現在時刻を基準とした、あらかじめ定義された時間範囲のセットから選択します。相対時間範囲を使用すると、特定の開始時刻と終了時刻を入力する必要なく、定期的かつ便利にメトリクスを確認できます。選択肢は次のとおりです。

    - 過去 10 分

    - 過去 1 時間

    - 過去 6 時間

    - 過去 12 時間

    - 過去 1 日

    - 過去 1 週間

    - 過去 1 か月

- **Absolute Range**: 正確な開始時刻と終了時刻を入力します。絶対範囲を使用すると、表示するメトリクスをより細かく制御できます。

    - 開始時刻と終了時刻の差は 10 分より長くする必要があります。

## 関連トピック\{#related-topics}

- [Organization アラートを管理する](./manage-organization-alerts)

- [Project アラートを管理する](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)


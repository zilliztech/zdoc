---
title: "メトリクスチャートの表示 | Cloud"
slug: /view-cluster-metric-charts
sidebar_label: "メトリクスチャートの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、クラスターレベルとコレクションレベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリクスチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、データ操作のパフォーマンスデータを確認できます。 | Cloud"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# メトリクスチャートの表示

Zilliz Cloud は、クラスターレベルとコレクションレベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリクスチャートでは、特定の時間範囲内におけるリソース使用量、1 秒あたりのクエリ数（QPS）、レイテンシ、データ操作のパフォーマンスデータを確認できます。

## クラスターメトリクスを表示する\{#view-cluster-metrics}

クラスター全体のメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で対象のクラスターに移動し、**Metrics** タブを選択します。

Zilliz Cloud のメトリクスチャートは、リソース使用量、1 秒あたりのクエリ数（QPS）、リクエスト結果、データ操作のパフォーマンスデータを提供し、特定の時間範囲内で詳細な分析を行えます。

<Admonition type="info" title="Notes">

無料クラスターでは、読み取り & 書き込み vCU のみ利用可能です。さまざまな高度なメトリクスを利用するには、[プラン階層をアップグレード](./manage-cluster)してください。

</Admonition>

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

クラスターメトリクスチャートは、次のグループに分類されています。

### リソース\{#resources}

これらのチャートは、CU コンピュート、CU 容量、ストレージなど、クラスターのリソース使用量を表示します。リソースメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#resources) を参照してください。

### パフォーマンス\{#performance}

これらのチャートは、QPS、レイテンシ、リクエスト失敗率、スループットなど、クラスターのパフォーマンスを表示します。パフォーマンスメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#performance) を参照してください。

### データ\{#data}

これらのチャートは、コレクション数、エンティティ数、ロード済みエンティティ数など、クラスターのデータ状態を表示します。データメトリクスの完全な一覧については、[Metrics Reference](./metrics-alerts-reference#data) を参照してください。

右側の **View Alerts Settings** をクリックすると **Alert Settings** ページにリダイレクトされ、アラートを管理するためのショートカットとして利用できます。

## コレクションメトリクスを表示する\{#view-collection-metrics}

クラスターメトリクスの一部は **コレクションレベル** でも利用でき、個々のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

コレクションレベルのメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で対象のコレクションに移動し、**Metrics** タブを選択します。

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

チャートのレイアウトと時間範囲のコントロールは、クラスターの **Metrics** タブと同一です。各チャートには、クラスター全体ではなく、選択したコレクションにスコープされた同一のメトリクス定義が表示されます。

## カーブのウィンドウサイズを変更する\{#modify-curve-window-size}

**Metrics** タブでは、2 種類のウィンドウサイズを利用できます。

- **Relative Range**: 現在の時刻を基準とした、あらかじめ定義された期間の中から選択します。相対時間範囲を使用すると、特定の開始時刻と終了時刻を入力することなく、定期的かつ手軽にメトリクスを確認できます。選択できる範囲は次のとおりです。

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

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)

- [Metrics & Alerts Reference](./metrics-alerts-reference)


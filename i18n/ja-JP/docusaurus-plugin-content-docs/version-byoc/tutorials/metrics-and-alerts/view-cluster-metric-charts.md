---
title: "メトリクスチャートの表示 | BYOC"
slug: /view-cluster-metric-charts
sidebar_key: view-cluster-metric-charts
sidebar_label: "メトリクスチャートの表示"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、クラスターレベルとコレクションレベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリクスチャートでは、特定期間内のリソース使用量、クエリ毎秒数（QPS）、レイテンシ、データ操作に関するパフォーマンスデータを確認できます。| BYOC"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - メトリクス
  - アラート
  - 表示

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# メトリクスチャートの表示

Zilliz Cloud は、クラスターレベルとコレクションレベルの両方でメトリクスを監視するためのダッシュボードを提供します。メトリクスチャートは、特定の日時範囲内におけるリソース使用量、秒間クエリ数 (QPS)、レイテンシ、およびデータ操作に関するパフォーマンスデータを提供します。

## クラスターメトリクスの表示\{#view-cluster-metrics}

クラスター全体のメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で対象のクラスターに移動し、**Metrics** タブを選択します。

Zilliz Cloud のメトリクスチャートは、リソース使用量、秒間クエリ数 (QPS)、リクエスト結果、およびデータ操作に関するパフォーマンスデータを提供し、特定の日時範囲内できめ細かい分析を可能にします。

<Supademo id="cmn429im00fjyz3qmh6bt98w5" title=""  />

クラスターメトリクスチャートは、以下のグループに分類されます。

### Pod & container resources\{#pod-and-container-resources}

Pod リソースの消費状況を効果的に追跡するには、**Metrics** タブを選択し、**Pod リソース** エリアを参照してください。ここでは、各 Pod の CPU、ストレージ、ネットワークの使用状況を表示する簡潔なグラフを確認できます。利用可能なメトリクスの概要については、[メトリクスリファレンス](./metrics-alerts-reference#pod-and-container-resources) を参照してください。

### リソース\{#resources}

これらのチャートは、CU 計算、CU 容量、ストレージを含むクラスターのリソース使用状況を示します。リソースメトリクスの完全なリストについては、[メトリクスリファレンス](./metrics-alerts-reference#resources) を参照してください。

### パフォーマンス\{#performance}

これらのチャートは、QPS、レイテンシ、リクエスト失敗率、スループットを含むクラスターのパフォーマンスを示します。パフォーマンスメトリクスの完全なリストについては、[メトリクスリファレンス](./metrics-alerts-reference#performance) を参照してください。

### データ\{#data}

これらのチャートは、コレクション数、エンティティ数、ロードされたエンティティ数を含むクラスターのデータステータスを示します。データメトリクスの完全なリストについては、[メトリクスリファレンス](./metrics-alerts-reference#data) を参照してください。

右側にある **View Alerts Settings** をクリックすると **アラート設定** ページにリダイレクトされ、アラートを管理するためのショートカットが提供されます。

## コレクションメトリクスの表示\{#view-collection-metrics}

クラスターメトリクスのサブセットは、**コレクションレベル** でも利用可能であり、個々のコレクションのパフォーマンス問題の特定や容量計画に役立ちます。

コレクションレベルのメトリクスを表示するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で対象のコレクションに移動し、**Metrics** タブを選択します。

<Supademo id="cmn42p79v0gcpz3qmql1xx412" title=""  />

チャートのレイアウトと日時範囲のコントロールは、クラスターの **Metrics** タブのものと同じです。各チャートは、クラスター全体ではなく、選択されたコレクションに限定された同じメトリクス定義を示します。

## カーブのウィンドウサイズの変更\{#modify-curve-window-size}

**Metrics** タブでは、2 種類のウィンドウサイズを使用できます。

- **相対範囲**: 現在時刻からの相対的な事前定義された時間期間から選択します。相対時間範囲を使用することで、特定の開始時刻と終了時刻を入力することなく、定期的かつ便利な方法でメトリクスを確認できます。選択肢は以下の通りです。

    - 過去 10 分

    - 過去 1 時間

    - 過去 6 時間

    - 過去 12 時間

    - 過去 1 日

    - 過去 1 週間

    - 過去 1 ヶ月

- **絶対範囲**: 正確な開始時刻と終了時刻を入力します。絶対範囲を使用することで、表示されるメトリクスをより細かく制御できます。

    - 開始時刻と終了時刻の時間差は 10 分より大きくなければなりません。

## 関連トピック\{#related-topics}

- [組織アラートの管理](./manage-organization-alerts)

- [プロジェクトアラートの管理](./manage-project-alerts)

- [メトリクスとアラートのリファレンス](./metrics-alerts-reference)


---
title: "メトリックチャートの表示 | BYOC"
slug: /view-cluster-metric-charts
sidebar_label: "メトリックチャートの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "メトリクスチャートを使用すると、サービングクラスターまたは個々のコレクションのトラフィック、レイテンシ、リソース使用量を追跡できます。オンデマンドクラスターのチャートを表示するには、「オンデマンドクラスターの監視」を参照してください。 | BYOC"
type: origin
token: DbPIw4jLOiEabCk5uptc6EZ1nbf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# メトリックチャートの表示

メトリクスチャートを使用すると、サービングクラスターまたは個々のコレクションのトラフィック、レイテンシ、リソース使用量を追跡できます。オンデマンドクラスターのチャートを表示するには、[オンデマンドクラスターの監視](./monitor-on-demand-cluster) を参照してください。

## クラスターチャート\{#cluster-charts}

<Supademo id="cmwu34ytl00lmqmq1do1j6xfd" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) でプロジェクトを開き、**Serving Clusters**（サービングクラスター）を選択します。

1. 調査するクラスターを選択します。複数のクラスターでベクトル検索が遅い場合を調査しているときは、リストの上にある **Latency (P99)** を選択し、各行の **Search** 値を比較します。クラスター名を選択して **Metrics** を開くと、クラスター全体のチャートを表示できます。

1. 時間範囲を選択します。最近のアクティビティには相対時間範囲を使用するか、インシデントに合わせて開始時刻と終了時刻を入力します。同じタイムスタンプのメトリクスを比較するには、**Sync Tooltips** をオンにして、チャート内のデータポイントにカーソルを合わせます。

1. Dedicated クラスターでは、**Key Metrics** から始め、次に以下から調査するチャートグループを選択します。利用可能なチャートはクラスタータイプによって異なります。

    | チャートグループ | 確認するポイント |
    | --- | --- |
    | Performance | 検索が遅くなった場合は、同じ期間の検索レイテンシと検索 QPS を比較します。これにより、速度低下がトラフィックの変化と同時に発生したかどうかを確認できます。 |
    | Resources | 速度低下中の CPU 負荷については Query CU Computation を確認します。クラスターがメモリまたはストレージの上限にどの程度近づいているかを確認するには、Query CU Capacity を確認します。 |
    | Data | データ量の変化については Entity Count を、コレクション数の変化については Collection Count（コレクション数）を確認します。 |

    定義、単位、クラスタータイプごとの利用可否については、リソースメトリクス、パフォーマンスメトリクス、データメトリクスを参照してください。

</Procedures>

## コレクションチャート\{#collection-charts}

これらのチャートは、サービングクラスター内の 1 つのコレクションのメトリクスを表示します。オンデマンドデータベース内のコレクションについては、[オンデマンドデータベースとコレクションのメトリクス](./on-demand-metrics-reference#on-demand-database-and-collection-metrics) を参照してください。

<Supademo id="cmwu3bdzt00q6qmq1j8730zt5" title=""  />

<Procedures>

1. **Serving Clusters**（サービングクラスター）を開き、アプリケーションにサービスを提供しているクラスターを見つけます。

1. 調査するコレクションのメトリクスチャートを開きます。

    - 名前がわかっている場合は、クラスターを開き、リソースツリーでデータベースを展開してコレクション名を選択し、**Metrics** を開きます。

    - 先にコレクションを比較する場合は、**Cluster**（クラスター）列でクラスター名を確認します。名前のすぐ右、**ID** バッジの前にある小さなウィンドウ型のボタンをクリックします。**Collection Overview**（コレクションの概要）が開きます。 

        たとえば、**Latency (P99)** を選択して **Search** 値を比較し、検索が遅いコレクションを見つけます。その名前をクリックしてチャートを開きます。

1. **Key Metrics** の下で、**QPS (Read)** を使用して、選択したコレクションが 1 秒あたりに受信した読み取りリクエスト数を確認します。

    コレクションレベルのリクエストメトリクスについては、Performance を参照してください。エンティティ数については、Data を参照してください。

</Procedures>

---
title: "適切なクラスタータイプを選択する | Cloud"
slug: /cu-types-explained
sidebar_label: "クラスタータイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud でクラスターを作成する際、適切な Compute Unit (CU) を選択することは重要なステップです。CU はデータの並列処理に使用されるコンピュートリソースの基本単位であり、クラスタータイプごとに CPU、メモリ、ストレージの組み合わせが異なります。 | Cloud"
type: origin
token: UgqvwKh2QiKE1kkYNLJcaHt0nkg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 適切なクラスタータイプを選択する

Zilliz Cloud でクラスターを作成する際、適切な Compute Unit (CU) を選択することは重要なステップです。CU はデータの並列処理に使用されるコンピュートリソースの基本単位であり、クラスタータイプごとに CPU、メモリ、ストレージの組み合わせが異なります。

## クラスタータイプを理解する\{#understand-cluster-types}

Zilliz Cloud では、**Performance-optimized、Capacity-optimized、Tiered-storage** のクラスタータイプを提供しています。

次の表は、3 つのクラスタータイプをさまざまな観点から簡単に比較したものです。クラスタータイプ間の容量とパフォーマンスの詳細な比較については、[最適なクラスタータイプを選択する](./cu-types-explained#select-an-optimal-cluster-type) に進んでください。

| クラスタータイプ | 検索 QPS | 検索レイテンシー | クエリ CU あたりの容量 | 100 万ベクトルあたりのコスト |
| --- | --- | --- | --- | --- |
| **Performance-optimized** | 500-1500 | 10 ms | 768 次元ベクトル 200 万件 | from &#36;63/mo. |
| **Capacity-optimized** | 100-300 | 50-100 ms | 768 次元ベクトル 800 万件 | from &#36;16/mo. |
| **Tiered-storage** | 10-50 | 100-1000 ms | 768 次元ベクトル 4,000 万件 | from &#36;5/mo. |

### Performance-optimized クラスター\{#performance-optimized-cluster}

- 低レイテンシーと高スループットを重視するシナリオ向けに設計されています。

- 生成 AI、レコメンデーションシステム、チャットボットなどのリアルタイムアプリケーションに最適です。

### Capacity-optimized クラスター\{#capacity-optimized-cluster}

- 大規模データセットの処理向けに設計されており、検索性能は控えめである一方、Performance-optimized に比べて 5 倍のデータ容量を備えています。

- 大規模な非構造化データ検索、著作権検出、本人確認に最適です。

### Tiered-storage クラスター\{#tiered-storage-cluster}

- 超大規模でコスト重視のワークロードに最適です。

- Ideal for applications that need to store massive volumes of data at a low cost. The capacity of a Tiered-storage クラスター is 4 times that of a Capacity-optimized クラスター.

## 最適なクラスタータイプを選択する\{#select-an-optimal-cluster-type}

クラスタータイプを選択する際は、データ量、期待するパフォーマンス、予算を考慮してください。ベクトルデータの規模は、ベクトル数と次元数の両面において、クラスターリソースの割り当てを決定する上で重要な役割を果たします。

### 容量を評価する\{#assess-capacity}

クラスターが収容できるエンティティ数は、クラスターのクエリ CU 容量によって決まります。

データ量に対して必要なクエリ CU 数を見積もるには、[計算ツール](https://zilliz.com/pricing#calculator) をご利用ください。

### パフォーマンスを評価する\{#evaluate-performance}

パフォーマンス指標、特にレイテンシーと 1 秒あたりのクエリ数 (QPS) は重要です。 

The Performance-optimized クラスター distinctly outperforms Capacity-optimized クラスター in latency and throughput, particularly for standard `top-k` values ranging from 10 to 250.

The following table shows the test result of how performance-optimized クラスター and capacity-optimized クラスター perform in terms of QPS.

| top_k | QPS for Performance-optimized クラスター (768-dim 1M ベクトル) | QPS for Capacity-optimized クラスター (768-dim 5M ベクトル) |
| --- | --- | --- |
| 10 | 520 | 100 |
| 100 | 440 | 80 |
| 250 | 270 | 60 |
| 1000 | 150 | 40 |

次の表は、各クラスタータイプのレイテンシーに関するテスト結果を示しています。

| top_k | Latency of Performance-optimized クラスター (768-dim 1M ベクトル) | Latency of Capacity-optimized クラスター (768-dim 5M ベクトル) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

## シナリオ別の内訳\{#scenario-breakdown}

800 万枚の画像ライブラリを持つ画像レコメンデーションアプリケーションを構築しているとします。ライブラリ内の各画像は、768 次元の埋め込みベクトルで表現されています。目標は、1,000 QPS のレコメンデーションリクエストを迅速に処理し、上位 100 件の画像レコメンデーションを 30 ミリ秒未満で返すことです。

この要件に適したクラスタータイプとクエリ CU を選択するには、次の手順に従ってください。

1. **Evaluate Latency**: The Performance-optimized クラスター is the only type that meets the 30-millisecond latency requirement.

1. **Assess Capacity**: A single Performance-optimized クラスター with 1 query CU accommodates 2 million 768-dimensional ベクトル. To store all 8 million ベクトル, you would need at least 4 query CUs.

1. **Check Throughput**: With a `top-k` setting of 100, the Performance-optimized クラスター can achieve a QPS of 440. To sustain a consistent 1,000 QPS, you would need to triple the number of replicas.

In conclusion, for this scenario, the Performance-optimized クラスター is your best bet. A configuration of 3 replicas, with each replica consisting of 4 query CUs, should serve you perfectly.


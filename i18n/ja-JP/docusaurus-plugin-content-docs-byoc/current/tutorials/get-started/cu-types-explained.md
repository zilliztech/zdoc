---
title: "適切なクラスタータイプを選択する | BYOC"
slug: /cu-types-explained
sidebar_label: "クラスタータイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud でクラスターを作成する際には、適切な Compute Unit (CU) を選択することが重要です。CU はデータの並列処理に使用される計算リソースの基本単位であり、クラスタータイプごとに CPU、メモリ、ストレージの組み合わせが異なります。 | BYOC"
type: origin
token: UgqvwKh2QiKE1kkYNLJcaHt0nkg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 適切なクラスタータイプを選択する

Zilliz Cloud でクラスターを作成する際には、適切な Compute Unit (CU) を選択することが重要です。CU はデータの並列処理に使用される計算リソースの基本単位であり、クラスタータイプごとに CPU、メモリ、ストレージの組み合わせが異なります。

## クラスタータイプを理解する\{#understand-cluster-types}

Zilliz Cloud では、**Performance-optimized、Capacity-optimized、Tiered-storage** のクラスタータイプを提供しています。

次の表では、3 つのクラスタータイプをさまざまな観点から簡単に比較しています。クラスタータイプ間の容量とパフォーマンスの詳細な比較については、[最適なクラスタータイプを選択する](./cu-types-explained#select-an-optimal-cluster-type) に進んでください。

| クラスタータイプ | 検索 QPS | 検索レイテンシ | クエリ CU あたりの容量 |
| --- | --- | --- | --- |
| **Performance-optimized** | 500-1500 | 10 ms | 200 万個の 768 次元ベクトル |
| **Capacity-optimized** | 100-300 | 50-100 ms | 800 万個の 768 次元ベクトル |
| **Tiered-storage** | 10-50 | 100-1000 ms | 4000 万個の 768 次元ベクトル |

### Performance-optimized クラスター\{#performance-optimized-cluster}

- 低レイテンシと高スループットを重視するシナリオ向けに設計されています。

- 生成 AI、レコメンデーションシステム、チャットボットなどのリアルタイムアプリケーションに最適です。

### Capacity-optimized クラスター\{#capacity-optimized-cluster}

- 膨大なデータセットの処理向けに作られており、Performance-optimized の同等構成と比べて 5 倍のデータ容量を備える一方で、検索パフォーマンスは控えめです。

- 大規模な非構造化データ検索、著作権検出、本人確認に最適です。

### Tiered-storage クラスター\{#tiered-storage-cluster}

- 超大規模かつコスト重視のワークロードに最適です。

- 低コストで大量のデータを保存する必要があるアプリケーションに適しています。Tiered-storage クラスターの容量は Capacity-optimized クラスターの 4 倍です。

## 最適なクラスタータイプを選択する\{#select-an-optimal-cluster-type}

クラスタータイプを選択する際は、データ量、期待するパフォーマンス、予算を考慮してください。ベクトルデータの規模は、ベクトル数と次元数の両方の観点から、クラスターのリソース割り当てを決定するうえで重要な役割を果たします。

### 容量を評価する\{#assess-capacity}

クラスターが収容できるエンティティ数は、そのクラスターのクエリ CU 容量によって決まります。

データ量に対して必要なクエリ CU 数を見積もるには、[当社の計算ツール](https://zilliz.com/pricing#calculator) を使用してください。

### パフォーマンスを評価する\{#evaluate-performance}

パフォーマンス指標、特にレイテンシと 1 秒あたりのクエリ数（QPS）は重要です。 

Performance-optimized クラスターは、特に標準的な `top-k` の値が 10 ～ 250 の範囲において、レイテンシとスループットの両面で Capacity-optimized クラスターを明確に上回ります。

次の表は、Performance-optimized クラスターと Capacity-optimized クラスターの QPS に関するテスト結果を示しています。

| top_k | Performance-optimized クラスターの QPS（768 次元、100 万ベクトル） | Capacity-optimized クラスターの QPS（768 次元、500 万ベクトル） |
| --- | --- | --- |
| 10 | 520 | 100 |
| 100 | 440 | 80 |
| 250 | 270 | 60 |
| 1000 | 150 | 40 |

次の表は、各クラスタータイプのレイテンシに関するテスト結果を示しています。

| top_k | Performance-optimized クラスターのレイテンシ（768 次元、100 万ベクトル） | Capacity-optimized クラスターのレイテンシ（768 次元、500 万ベクトル） |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

## シナリオ別の内訳\{#scenario-breakdown}

800 万枚の画像ライブラリを持つ画像レコメンデーションアプリケーションを構築しているとします。ライブラリ内の各画像は、768 次元の埋め込みベクトルで表現されています。目標は、1,000 QPS のレコメンデーションリクエストを迅速に処理し、上位 100 件の画像レコメンデーションを 30 ミリ秒未満で返すことです。

この要件に適したクラスタータイプとクエリ CU を選択するには、次の手順に従います。

1. **レイテンシを評価する**: 30 ミリ秒のレイテンシ要件を満たすのは Performance-optimized クラスターだけです。

1. **容量を評価する**: 1 クエリ CU を持つ単一の Performance-optimized クラスターでは、200 万個の 768 次元ベクトルを収容できます。800 万個すべてのベクトルを保存するには、少なくとも 4 クエリ CU が必要です。

1. **スループットを確認する**: `top-k` を 100 に設定した場合、Performance-optimized クラスターは 440 QPS を達成できます。安定して 1,000 QPS を維持するには、レプリカ数を 3 倍にする必要があります。

結論として、このシナリオでは Performance-optimized クラスターが最適です。各レプリカが 4 クエリ CU で構成される 3 レプリカの構成であれば、要件を十分に満たせます。


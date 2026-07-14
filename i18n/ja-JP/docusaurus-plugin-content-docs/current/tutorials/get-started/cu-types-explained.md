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
sidebar_position: 5
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
| **Performance-optimized** | 500-1500 | 10 ms | 768 次元ベクトル 200 万件 | 月額 &#36;63〜 |
| **Capacity-optimized** | 100-300 | 50-100 ms | 768 次元ベクトル 800 万件 | 月額 &#36;16〜 |
| **Tiered-storage** | 10-50 | 100-1000 ms | 768 次元ベクトル 4,000 万件 | 月額 &#36;5〜 |

### Performance-optimized cluster\{#performance-optimized-cluster}

- 低レイテンシーと高スループットを重視するシナリオ向けに設計されています。

- 生成 AI、レコメンデーションシステム、チャットボットなどのリアルタイムアプリケーションに最適です。

### Capacity-optimized cluster\{#capacity-optimized-cluster}

- 大規模データセットの処理向けに設計されており、検索性能は控えめである一方、Performance-optimized に比べて 5 倍のデータ容量を備えています。

- 大規模な非構造化データ検索、著作権検出、本人確認に最適です。

### Tiered-storage cluster\{#tiered-storage-cluster}

- 超大規模でコスト重視のワークロードに最適です。

- 大量のデータを低コストで保存する必要があるアプリケーションに最適です。Tiered-storage cluster の容量は Capacity-optimized cluster の 4 倍です。

## 最適なクラスタータイプを選択する\{#select-an-optimal-cluster-type}

クラスタータイプを選択する際は、データ量、期待するパフォーマンス、予算を考慮してください。ベクトルデータの規模は、ベクトル数と次元数の両面において、クラスターリソースの割り当てを決定する上で重要な役割を果たします。

### 容量を評価する\{#assess-capacity}

クラスターが収容できるエンティティ数は、クラスターのクエリ CU 容量によって決まります。

データ量に対して必要なクエリ CU 数を見積もるには、[計算ツール](https://zilliz.com/pricing#calculator) をご利用ください。

### パフォーマンスを評価する\{#evaluate-performance}

パフォーマンス指標、特にレイテンシーと 1 秒あたりのクエリ数 (QPS) は重要です。 

Performance-optimized cluster は、特に標準的な `top-k` 値が 10 から 250 の範囲において、レイテンシーとスループットの両面で Capacity-optimized cluster を明確に上回ります。

次の表は、Performance-optimized cluster と Capacity-optimized cluster の QPS に関するテスト結果を示しています。

| top_k | Performance-optimized cluster の QPS (768 次元、100 万ベクトル) | Capacity-optimized cluster の QPS (768 次元、500 万ベクトル) |
| --- | --- | --- |
| 10 | 520 | 100 |
| 100 | 440 | 80 |
| 250 | 270 | 60 |
| 1000 | 150 | 40 |

次の表は、各クラスタータイプのレイテンシーに関するテスト結果を示しています。

| top_k | Performance-optimized cluster のレイテンシー (768 次元、100 万ベクトル) | Capacity-optimized cluster のレイテンシー (768 次元、500 万ベクトル) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

## シナリオ別の内訳\{#scenario-breakdown}

800 万枚の画像ライブラリを持つ画像レコメンデーションアプリケーションを構築しているとします。ライブラリ内の各画像は、768 次元の埋め込みベクトルで表現されています。目標は、1,000 QPS のレコメンデーションリクエストを迅速に処理し、上位 100 件の画像レコメンデーションを 30 ミリ秒未満で返すことです。

この要件に適したクラスタータイプとクエリ CU を選択するには、次の手順に従ってください。

1. **レイテンシーを評価する**: 30 ミリ秒のレイテンシー要件を満たすのは Performance-optimized cluster のみです。

1. **容量を評価する**: クエリ CU が 1 の Performance-optimized cluster 1 つで、768 次元ベクトルを 200 万件収容できます。800 万件すべてのベクトルを保存するには、少なくとも 4 クエリ CU が必要です。

1. **スループットを確認する**: `top-k` を 100 に設定した場合、Performance-optimized cluster は 440 QPS を実現できます。1,000 QPS を安定して維持するには、レプリカ数を 3 倍にする必要があります。

結論として、このシナリオでは Performance-optimized cluster が最適です。各レプリカが 4 クエリ CU で構成される 3 レプリカの構成で、要件を十分に満たせます。


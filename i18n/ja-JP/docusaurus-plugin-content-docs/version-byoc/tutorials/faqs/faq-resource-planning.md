---
title: "FAQ: リソースプランニング | BYOC"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソースプランニング"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでリソースを計画する際に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6

---

# FAQ: リソースプランニング

このトピックでは、Zilliz Cloudでリソースを計画する際に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [コンピュートユニット（CU）とは何ですか？](#what-is-a-compute-unit-cu)
- [使用していないクラスターの費用をどのように回避できますか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [特定のコレクションに必要なクエリCU数はいくつですか？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どのタイプのクラスターを選択すべきですか？](#which-type-of-cluster-should-i-pick)
- [パフォーマンス最適化型CUと容量最適化型CUの違いは何ですか？](#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu)

## よくある質問




### コンピュートユニット（CU）とは何ですか？\{#what-is-a-compute-unit-cu}

コンピュートユニット（CU）は、インデックスと検索リクエストを処理するためのハードウェアリソースのグループです。検索サービスを展開するための完全に管理された物理ノードとしてCUをシンプルに考えることができます。

詳細については、[適切なCUの選択](./cu-types-explained)を参照してください。

### 使用していないクラスターの費用をどのように回避できますか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するために、使用していないクラスターを一時停止することをお勧めします。必要時に再開できます。

### 特定のコレクションに必要なクエリCU数はいくつですか？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- パフォーマンス最適化型: 最大150万個の768次元ベクトルをサポートします。

- 容量最適化型: 最大500万個の768次元ベクトルをサポートします。

- レイヤードストレージ: 最大2000万個の768次元ベクトルをサポートします。

これらの推定値は、主キーのみを持つベクトルに基づいています。IDやラベルなどの追加のスカラー値フィールドがあると容量が減少する可能性があります。正確な評価のために独自のテストを実施することをお勧めします。

### どのタイプのクラスターを選択すべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーションで即時検索結果と高同時通信量が必要な場合はパフォーマンス最適化型を選択してください。
信頼性の高い検索速度を維持しながら大規模なベクトルデータセットを処理する必要がある場合は容量最適化型を選択してください。
ホットデータとコールドデータの明確なパターンを持つ超大規模でコストに敏感なワークロードを処理する必要がある場合は、レイヤードストレージクラスターを選択してください。レイヤードストレージクラスターを選択するには、クラスターに少なくとも8つのクエリCUが必要です。

### パフォーマンス最適化型CUと容量最適化型CUの違いは何ですか？\{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

「パフォーマンス最適化型CU」は、低レイテンシまたは高スループットの類似性検索に適しています。このオプションは、検索パフォーマンスが高いシナリオに最適です。

「容量最適化型CU」は、パフォーマンス最適化型CUオプションの5倍のデータ容量に適しています。このオプションは、ストレージ容量を拡大するシナリオに最適です。

詳細については、[適切なCUの選択](./cu-types-explained)を参照してください。

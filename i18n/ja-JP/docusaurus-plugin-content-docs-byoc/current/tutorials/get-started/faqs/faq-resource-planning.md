---
title: "FAQ: リソース計画 | BYOC"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソース計画"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でリソース計画を行う際に発生する可能性のある問題と、その対応する解決策を一覧で示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6
displayed_sidebar: default

---

# FAQ: リソース計画

このトピックでは、Zilliz Cloud でリソース計画を行う際に発生する可能性のある問題と、その対応する解決策を一覧で示します。

## 目次

- [Compute Unit (CU) とは何ですか？](#what-is-a-compute-unit-cu)
- [未使用のクラスターにかかる費用を回避するにはどうすればよいですか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [特定のコレクションにはいくつの query CU が必要ですか？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どの種類のクラスターを選ぶべきですか？](#which-type-of-cluster-should-i-pick)

## FAQ




### Compute Unit (CU) とは何ですか？\{#what-is-a-compute-unit-cu}

compute unit (CU) は、インデックスと検索リクエストを処理するためのハードウェアリソースのグループです。CU は、検索サービスをデプロイするためのフルマネージドな物理ノードとシンプルに考えることができます。

詳細については、[適切な CU を選択する](./cu-types-explained) を参照してください。

### 未使用のクラスターにかかる費用を回避するにはどうすればよいですか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するため、未使用のクラスターは一時停止することを推奨します。必要になった際に後で再開できます。

### 特定のコレクションにはいくつの query CU が必要ですか？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: 最大 200 万件の 768 次元ベクトルをサポートします。

- Capacity-optimized: 最大 800 万件の 768 次元ベクトルをサポートします。

- Tiered-storage: 最大 4,000 万件の 768 次元ベクトルをサポートします。

これらの見積もりは、主キーのみを持つベクトルに基づいています。ID やラベルなどの追加のスカラーフィールドがある場合、容量が減少する可能性があります。正確な評価のために、ご自身でテストを実施することを推奨します。

### どの種類のクラスターを選ぶべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーション向けに即時の検索結果と高い同時トラフィックが必要な場合は、Performance-optimized を選択してください。
大規模なベクトルデータセットを扱いながら、信頼性の高い検索速度を維持する必要がある場合は、Capacity-optimized を選択してください。
超大規模でコスト重視のワークロードを扱う必要がある場合は、Tiered-storage クラスターを選択してください。Tiered-storage クラスターを選択するには、クラスターに少なくとも 8 query CU が必要です。

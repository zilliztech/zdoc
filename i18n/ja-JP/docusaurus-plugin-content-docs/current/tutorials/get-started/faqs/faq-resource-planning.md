---
title: "FAQ: リソースの計画 | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソースの計画"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性がある問題と、それに対応する解決策について説明します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6
displayed_sidebar: default

---

# FAQ: リソースの計画

このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性がある問題と、それに対応する解決策について説明します。

## 目次

- [コンピューティングユニット（CU）とは？](#what-is-a-compute-unit-cu)
- [vCU とは？どのように計算されますか？](#what-is-a-vcu-how-does-it-get-calculated)
- [未使用のクラスターにかかる費用を回避するには？](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloud の利用コストを見積もるには？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz Cloud は Azure へのデプロイをサポートしていますか？](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするには？](#how-can-i-request-a-new-cloud-region)
- [現在のプランを確認するには？](#how-can-i-know-which-plan-i-am-on)
- [特定のコレクションに必要なクエリ CU 数は？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どのタイプのクラスターを選択すべきですか？](#which-type-of-cluster-should-i-pick)

## よくある質問




### コンピューティングユニット（CU）とは？\{#what-is-a-compute-unit-cu}

コンピューティングユニット（CU）は、インデックスと検索リクエストを処理するためのハードウェアリソースのグループです。CU は、検索サービスをデプロイするためのフルマネージドの物理ノードと単純に考えることができます。

詳細については、[適切な CU の選択](./cu-types-explained) を参照してください。

### vCU とは？どのように計算されますか？\{#what-is-a-vcu-how-does-it-get-calculated}

vCU は、読み取り操作（検索やクエリなど）と書き込み操作（挿入、アップサート、一括挿入、削除など）で消費されるリソースを測定するために使用される仮想コンピューティングユニットです。書き込みまたは読み取りされるデータ量は、GB から vCU に変換されます。詳細については、[Serverless クラスターのコスト](./serverless-cluster-cost) を参照してください。

### 未使用のクラスターにかかる費用を回避するには？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するために、未使用のクラスターを一時停止することをお勧めします。必要になったときに再開できます。

### Zilliz Cloud の利用コストを見積もるには？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

[計算ツール](https://zilliz.com/pricing) を使用してコストの見積もりを取得するか、詳細については [ストレージコスト](./storage-cost) を参照してください。

### Zilliz Cloud は Azure へのデプロイをサポートしていますか？\{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloud は現在、Azure へのデプロイをサポートしています。[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

### 新しいクラウドリージョンをリクエストするには？\{#how-can-i-request-a-new-cloud-region}

Zilliz Cloud の新しいクラウドサービスプロバイダーリージョンをリクエストするには、[フォーム](https://zilliz.com/cloud-region-request) に記入してください。

### 現在のプランを確認するには？\{#how-can-i-know-which-plan-i-am-on}

プランを確認するには、プロジェクト一覧に移動します。各プロジェクトのプランが表示されます。

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](https://zdoc-images.s3.us-west-2.amazonaws.com/xmrtb3eysowunsxqm0ecyjj2nqf.png "XMRtb3eYsoWUnsxQM0ecyjj2nqf")

### 特定のコレクションに必要なクエリ CU 数は？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: 最大 200 万個の 768 次元ベクトルをサポートします。

- Capacity-optimized: 最大 800 万個の 768 次元ベクトルをサポートします。

- Tiered-storage: 最大 4,000 万個の 768 次元ベクトルをサポートします。

これらの見積もりは、主キーのみを含むベクトルに基づいています。ID やラベルなどの追加のスカラーフィールドは、容量を減らす可能性があります。正確に評価するには、独自のテストを実施することをお勧めします。

### どのタイプのクラスターを選択すべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーション向けに、即時の検索結果と高い同時トラフィックが必要な場合は、Performance-optimized を選択します。
大規模なベクトルデータセットを処理しながら、信頼性の高い検索速度を維持する必要がある場合は、Capacity-optimized を選択します。
超大規模でコストに敏感なワークロードを処理する必要がある場合は、Tiered-storage クラスターを選択します。

---
title: "FAQ: リソース計画 | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソース計画"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6
displayed_sidebar: default

---

# FAQ: リソース計画

このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を示します。

## 目次

- [Compute Unit (CU) とは何ですか？](#what-is-a-compute-unit-cu)
- [vCU とは何ですか？どのように計算されますか？](#what-is-a-vcu-how-does-it-get-calculated)
- [使用していないクラスターに対する費用を回避するにはどうすればよいですか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloud の利用コストを見積もるにはどうすればよいですか？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz Cloud は Azure へのデプロイをサポートしていますか？](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするにはどうすればよいですか？](#how-can-i-request-a-new-cloud-region)
- [自分がどのプランを利用しているかを確認するにはどうすればよいですか？](#how-can-i-know-which-plan-i-am-on)
- [特定のコレクションには何個のクエリ CU が必要ですか？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どの種類のクラスターを選ぶべきですか？](#which-type-of-cluster-should-i-pick)

## FAQs




### Compute Unit (CU) とは何ですか？\{#what-is-a-compute-unit-cu}

Compute Unit (CU) とは、インデックスと検索リクエストを提供するためのハードウェアリソースのグループです。CU は、検索サービスをデプロイするためのフルマネージドな物理ノードとしてシンプルに考えることができます。

詳細については、[Select the Right CU](./cu-types-explained) を参照してください。

### vCU とは何ですか？どのように計算されますか？\{#what-is-a-vcu-how-does-it-get-calculated}

vCU は、読み取り操作（検索やクエリなど）および書き込み操作（挿入、アップサート、一括挿入、削除など）によって消費されるリソースを測定するための仮想コンピュートユニットです。書き込まれた、または読み取られたデータ量は GB から vCU に変換されます。詳細については、[Serverless Cluster Cost](./serverless-cluster-cost) を参照してください。

### 使用していないクラスターに対する費用を回避するにはどうすればよいですか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するため、使用していないクラスターは一時停止することをお勧めします。必要になったときに後で再開できます。

### Zilliz Cloud の利用コストを見積もるにはどうすればよいですか？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

コスト見積もりを取得するには当社の [calculator](https://zilliz.com/pricing) を使用するか、詳細について [Storage Cost](./storage-cost) を参照してください。

### Zilliz Cloud は Azure へのデプロイをサポートしていますか？\{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloud は現在 Azure へのデプロイをサポートしています。[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

### 新しいクラウドリージョンをリクエストするにはどうすればよいですか？\{#how-can-i-request-a-new-cloud-region}

Zilliz Cloud の新しいクラウドサービスプロバイダーのリージョンをリクエストするには、[フォームに記入してください](https://zilliz.com/cloud-region-request)。

### 自分がどのプランを利用しているかを確認するにはどうすればよいですか？\{#how-can-i-know-which-plan-i-am-on}

プランを確認するには、プロジェクトリストに移動してください。各プロジェクトのプランを確認できます。

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](https://zdoc-images.s3.us-west-2.amazonaws.com/xmrtb3eysowunsxqm0ecyjj2nqf.png "XMRtb3eYsoWUnsxQM0ecyjj2nqf")

### 特定のコレクションには何個のクエリ CU が必要ですか？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: 最大 200 万件の 768 次元ベクトルをサポートします。

- Capacity-optimized: 最大 800 万件の 768 次元ベクトルをサポートします。

- Tiered-storage: 最大 4,000 万件の 768 次元ベクトルをサポートします。

これらの見積もりは、プライマリキーのみを持つベクトルに基づいています。ID やラベルなどの追加のスカラーフィールドがある場合、容量が減少する可能性があります。正確に評価するために、ご自身でテストを実施することをお勧めします。

### どの種類のクラスターを選ぶべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーション向けに、即時の検索結果と高い同時トラフィックが必要な場合は、Performance-optimized を選択してください。  
大規模なベクトルデータセットを扱いつつ、安定した検索速度を維持したい場合は、Capacity-optimized を選択してください。  
超大規模でコスト重視のワークロードを扱う必要がある場合は、Tiered-storage クラスターを選択してください。Tiered-storage クラスターを選択するには、クラスターに少なくとも 8 クエリ CU が必要です。

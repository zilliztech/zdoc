---
title: "FAQ: リソース計画 | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソース計画"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6
displayed_sidebar: default

---

# FAQ: リソース計画

このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## 目次

- [Compute Unit (CU) とは何ですか？](#what-is-a-compute-unit-cu)
- [vCU とは何ですか？どのように計算されますか？](#what-is-a-vcu-how-does-it-get-calculated)
- [使用していない cluster にかかる費用を避けるにはどうすればよいですか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloud の利用コストを見積もるにはどうすればよいですか？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz Cloud は Azure へのデプロイをサポートしていますか？](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするにはどうすればよいですか？](#how-can-i-request-a-new-cloud-region)
- [自分がどのプランを利用しているかはどうすればわかりますか？](#how-can-i-know-which-plan-i-am-on)
- [特定の collection には何個の query CU が必要ですか？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どのタイプの cluster を選ぶべきですか？](#which-type-of-cluster-should-i-pick)

## FAQ




### Compute Unit (CU) とは何ですか？\{#what-is-a-compute-unit-cu}

compute unit (CU) は、index と検索リクエストを処理するためのハードウェアリソースのグループです。CU は、検索サービスをデプロイするためのフルマネージドな物理ノードとシンプルに考えることができます。

詳細については、[適切な CU を選択する](./cu-types-explained) を参照してください。

### vCU とは何ですか？どのように計算されますか？\{#what-is-a-vcu-how-does-it-get-calculated}

vCU は、読み取り操作（search や query など）および書き込み操作（insert、upsert、bulk insert、delete など）で消費されるリソースを測定するための仮想 compute unit です。書き込まれた、または読み取られたデータ量は GB から vCU に変換されます。詳細については、[Serverless Cluster Cost](./serverless-cluster-cost) を参照してください。

### 使用していない cluster にかかる費用を避けるにはどうすればよいですか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するために、使用していない cluster は一時停止することを推奨します。必要になったときに後で再開できます。

### Zilliz Cloud の利用コストを見積もるにはどうすればよいですか？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

[calculator](https://zilliz.com/pricing) を使用してコスト見積もりを取得するか、詳細について [Storage Cost](./storage-cost) を参照してください。

### Zilliz Cloud は Azure へのデプロイをサポートしていますか？\{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloud は現在 Azure へのデプロイをサポートしています。[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

### 新しいクラウドリージョンをリクエストするにはどうすればよいですか？\{#how-can-i-request-a-new-cloud-region}

Zilliz Cloud の新しいクラウドサービスプロバイダーのリージョンをリクエストするには、[フォームに記入してください](https://zilliz.com/cloud-region-request)。

### 自分がどのプランを利用しているかはどうすればわかりますか？\{#how-can-i-know-which-plan-i-am-on}

プランを確認するには、プロジェクト一覧に移動します。各プロジェクトのプランが表示されます。

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](https://zdoc-images.s3.us-west-2.amazonaws.com/xmrtb3eysowunsxqm0ecyjj2nqf.png "XMRtb3eYsoWUnsxQM0ecyjj2nqf")

### 特定の collection には何個の query CU が必要ですか？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: 最大 200 万件の 768 次元 vector をサポートします。

- Capacity-optimized: 最大 800 万件の 768 次元 vector をサポートします。

- Tiered-storage: 最大 4,000 万件の 768 次元 vector をサポートします。

これらの見積もりは、primary key のみを持つ vector に基づいています。ID やラベルなどの追加の scalar フィールドがある場合、容量が減少する可能性があります。正確に評価するために、ご自身でテストを実施することを推奨します。

### どのタイプの cluster を選ぶべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーション向けに、即時の検索結果と高い同時接続トラフィックが必要な場合は Performance-optimized を選択してください。  
大規模な vector データセットを扱いながら、安定した検索速度も維持したい場合は Capacity-optimized を選択してください。  
超大規模でコスト重視のワークロードを扱う必要がある場合は Tiered-storage cluster を選択してください。Tiered-storage cluster を選択するには、cluster に少なくとも 8 query CUs が必要です。

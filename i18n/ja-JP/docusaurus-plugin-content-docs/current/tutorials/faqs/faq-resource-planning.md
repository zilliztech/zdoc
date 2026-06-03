---
title: "FAQ: リソース計画 | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: リソース計画"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6

---

# FAQ: リソース計画

このトピックでは、Zilliz Cloud でリソースを計画する際に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [Compute Unit (CU) とは何ですか？](#what-is-a-compute-unit-cu)
- [vCU とは何ですか？どのように計算されますか？](#what-is-a-vcu-how-does-it-get-calculated)
- [未使用クラスターの費用を避けるにはどうすればよいですか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloud の使用コストを見積もるにはどうすればよいですか？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz Cloud は Azure へのデプロイをサポートしていますか？](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするにはどうすればよいですか？](#how-can-i-request-a-new-cloud-region)
- [自分がどのプランを利用しているかを確認するにはどうすればよいですか？](#how-can-i-know-which-plan-i-am-on)
- [特定のコレクションに必要なクエリ CU 数はいくつですか？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どの種類のクラスターを選べばよいですか？](#which-type-of-cluster-should-i-pick)

## よくある質問




### Compute Unit (CU) とは何ですか？\{#what-is-a-compute-unit-cu}

Compute Unit (CU) は、インデックスと検索リクエストを提供するためのハードウェアリソースのグループです。CU は、検索サービスをデプロイするためのフルマネージド物理ノードと考えることができます。

詳細については、[適切な CU の選択](./cu-types-explained)を参照してください。

### vCU とは何ですか？どのように計算されますか？\{#what-is-a-vcu-how-does-it-get-calculated}

vCU は、読み取り操作（検索やクエリなど）と書き込み操作（挿入、アップサート、一括挿入、削除など）によって消費されるリソースを測定するための仮想 Compute Unit です。書き込みまたは読み取りされたデータ量は GB から vCU に変換されます。詳細については、[Serverless クラスターのコスト](./serverless-cluster-cost)を参照してください。

### 未使用クラスターの費用を避けるにはどうすればよいですか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するため、未使用のクラスターを一時停止することをお勧めします。必要になったら後で再開できます。

### Zilliz Cloud の使用コストを見積もるにはどうすればよいですか？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

[計算機](https://zilliz.com/pricing)を使用してコスト見積もりを取得するか、詳細については[コストを理解](./understand-cost)を参照してください。

### Zilliz Cloud は Azure へのデプロイをサポートしていますか？\{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloud は現在 Azure へのデプロイをサポートしています。[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)を参照してください。

### 新しいクラウドリージョンをリクエストするにはどうすればよいですか？\{#how-can-i-request-a-new-cloud-region}

Zilliz Cloud の新しいクラウドサービスプロバイダーリージョンをリクエストするには、[フォームに入力](https://zilliz.com/cloud-region-request)してください。

### 自分がどのプランを利用しているかを確認するにはどうすればよいですか？\{#how-can-i-know-which-plan-i-am-on}

プランを表示するには、プロジェクト一覧に移動します。各プロジェクトのプランを確認できます。

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](https://zdoc-images.s3.us-west-2.amazonaws.com/xmrtb3eysowunsxqm0ecyjj2nqf.png "XMRtb3eYsoWUnsxQM0ecyjj2nqf")

### 特定のコレクションに必要なクエリ CU 数はいくつですか？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: 最大 200 万個の 768 次元ベクトルをサポートします。

- Capacity-optimized: 最大 800 万個の 768 次元ベクトルをサポートします。

- Tiered-storage: 最大 4,000 万個の 768 次元ベクトルをサポートします。

これらの見積もりは、プライマリキーのみを持つベクトルに基づいています。ID やラベルなどの追加スカラーフィールドがあると、容量が減少する場合があります。正確な評価のために、独自のテストを実施することをお勧めします。

### どの種類のクラスターを選べばよいですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーションで即時の検索結果と高い同時トラフィックが必要な場合は、Performance-optimized を選択します。
信頼性の高い検索速度を維持しながら大規模なベクトルデータセットを処理する必要がある場合は、Capacity-optimized を選択します。
超大規模でコスト重視のワークロードを処理する必要がある場合は、Tiered-storage クラスターを選択します。Tiered-storage クラスターを選択するには、クラスターに少なくとも 8 query CU が必要です。

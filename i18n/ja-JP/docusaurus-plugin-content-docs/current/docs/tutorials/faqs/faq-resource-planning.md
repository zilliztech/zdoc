---
title: "FAQ:リソースプランニング | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ:リソースプランニング"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudでリソースを計画する際に発生する可能性のある問題とそれに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 7

---

# FAQ:リソースプランニング

このトピックでは、Zilliz Cloudでリソースを計画する際に発生する可能性のある問題とそれに対応する解決策をリストアップしています。

## Contents

- [コンピューティングユニット（CU）とは何ですか?](#what-is-a-compute-unit-cu)
- [vCUとは何ですか?どのように計算されますか?](#what-is-a-vcu-how-does-it-get-calculated)
- [使用されていないクラスタの費用を回避するにはどうすればよいですか?](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloudの利用料金はどのように見積もることができますか?](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz CloudはAzureでの展開をサポートしていますか?](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするにはどうすればよいですか?](#how-can-i-request-a-new-cloud-region)
- [どのプランに参加しているかを知るにはどうすればよいですか?](#how-can-i-know-which-plan-i-am-on)
- [与えられたコレクションには何個のCUが必要ですか?](#how-many-cus-do-i-need-for-a-given-collection)
- [どのタイプのCUを選べばいいですか?](#which-type-of-cu-should-i-pick)
- [「Performance-optimizedCU」と「容量最適化CU」の違いは何ですか?](#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu)
- [専用（エンタープライズ）プランから専用（スタンダード）プランにダウングレードするにはどうすればよいですか?](#how-can-i-downgrade-from-dedicated-enterprise-plan-to-dedicated-standard-plan)

## FAQs




### コンピューティングユニット（CU）とは何ですか?{#what-is-a-compute-unit-cu}

コンピューティングユニット（CU）は、インデックスや検索リクエストを処理するためのハードウェアリソースのグループです。CUは、検索サービスをデプロイするための完全に管理された物理ノードとして考えることができます。

詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

### vCUとは何ですか?どのように計算されますか?{#what-is-a-vcu-how-does-it-get-calculated}

vCUは、読み取り操作(検索やクエリなど)および書き込み操作(挿入、アップロード、一括挿入、削除など)によって消費されるリソースを測定するために使用される仮想コンピュートユニットです。書き込まれたまたは読み取られたデータ量は、GBからvCUに変換されます。

### 使用されていないクラスタの費用を回避するにはどうすればよいですか?{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するために、未使用のクラスタを一時停止することをお勧めします。必要に応じて後で再開できます。

### Zilliz Cloudの利用料金はどのように見積もることができますか?{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

あなたは私たちの[計算機](https://zilliz.com/pricing)を使ってコスト見積もりを得ることができます。

### Zilliz CloudはAzureでの展開をサポートしていますか?{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloudは現在、Azure上での展開をサポートしています。「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

### 新しいクラウドリージョンをリクエストするにはどうすればよいですか?{#how-can-i-request-a-new-cloud-region}

Zilliz Cloudの新しいクラウドサービスプロバイダーリージョンをリクエストするには、[フォームに記入し](https://zilliz.com/cloud-region-request)てください。

### どのプランに参加しているかを知るにはどうすればよいですか?{#how-can-i-know-which-plan-i-am-on}

プランを表示するには、プロジェクトの下で特定のクラスタを選択します。[**クラスタ詳細**]タブに移動し、[**概要**]セクションでプランの詳細を確認できます。

![cluster_plan](/img/ja-JP/cluster_plan.png)

### 与えられたコレクションには何個のCUが必要ですか?{#how-many-cus-do-i-need-for-a-given-collection}

1つのPerformance-optimizedCUは、750万個の128次元ベクトルまたは150万個の768次元ベクトルを処理できます。

容量最適化されたCUは、2,500万個の128次元ベクトルまたは5,000,000個の768次元ベクトルを処理できます。

あなたのコレクションのスキーマは上記の簡単なガイドと異なる場合があるため、実際の要件を異なるCUタイプに対してテストすることを強くお勧めします。

### どのタイプのCUを選べばいいですか?{#which-type-of-cu-should-i-pick}

要求の厳しいユースケースに対して高スループットと低レイテンシーが必要な場合は、Performance-optimizedCUを選択してください。また、スループットとレイテンシーに対する懸念が少なく、大量のデータをホストすることが優先事項である場合は、パフォーマンスとコストのバランスがより良いキャパシティ最適化CUを選択してください。

詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

### 「Performance-optimizedCU」と「容量最適化CU」の違いは何ですか?{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

「Performance-optimizedCompute Unit」は、低レイテンシーまたは高スループットの類似検索に適しています。このオプションは、高い検索パフォーマンスのシナリオに最適です。

「容量最適化コンピューティングユニット」は、performance-optimizedCUオプションの5倍のデータボリュームに適しています。このオプションは、ストレージ容量の増加シナリオに最適です。

詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

### 専用（エンタープライズ）プランから専用（スタンダード）プランにダウングレードするにはどうすればよいですか?{#how-can-i-downgrade-from-dedicated-enterprise-plan-to-dedicated-standard-plan}

Dedicated(Standard)プランで新しいクラスターを作成し、Enterpriseクラスターから新しいStandardクラスターにデータを移行することで、プランをダウングレードできます。

プラン間のスムーズな移行を確保したい場合は、[リクエストを提出](https://support.zilliz.com/hc/en-us)してください。プランのダウングレードも可能です。

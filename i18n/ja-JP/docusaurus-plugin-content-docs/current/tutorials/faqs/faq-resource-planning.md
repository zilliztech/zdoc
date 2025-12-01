---
title: "FAQ：リソースプランニング | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ：リソースプランニング"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudでリソースを計画する際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6

---

# FAQ：リソースプランニング

このトピックでは、Zilliz Cloudでリソースを計画する際に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [コンピュートユニット（CU）とは？](#what-is-a-compute-unit-cu)
- [vCUとは？どのように計算されますか？](#what-is-a-vcu-how-does-it-get-calculated)
- [未使用クラスターの費用を回避するにはどうすればよいですか？](#how-can-i-avoid-expenses-on-unused-clusters)
- [Zilliz Cloudの使用コストを推定するには？](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Zilliz CloudはAzureへのデプロイをサポートしていますか？](#does-zilliz-cloud-support-deployment-on-azure)
- [新しいクラウドリージョンをリクエストするにはどうすればよいですか？](#how-can-i-request-a-new-cloud-region)
- [自分がどのプランを使用しているかを確認するには？](#how-can-i-know-which-plan-i-am-on)
- [特定のコレクションに必要なクエリCU数は？](#how-many-query-cus-do-i-need-for-a-given-collection)
- [どのタイプのクラスターを選択すべきですか？](#which-type-of-cluster-should-i-pick)
- [パフォーマンス最適化CUと容量最適化CUの違いは？](#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu)

## FAQ

### コンピュートユニット（CU）とは？\{#what-is-a-compute-unit-cu}

コンピュートユニット（CU）は、インデックスと検索リクエストを処理するためのハードウェアリソースのグループです。CUは検索サービスをデプロイするための完全に管理された物理ノードと単純に考えることができます。

詳細については、[適切なCUの選択](./cu-types-explained)を参照してください。

### vCUとは？どのように計算されますか？\{#what-is-a-vcu-how-does-it-get-calculated}

vCUは、読み取り操作（検索およびクエリなど）および書き込み操作（挿入、アップサート、一括挿入、削除など）によって消費されるリソースを測定するために使用される仮想コンピュートユニットです。書き込まれたまたは読み取られたデータ量はGBからvCUに変換されます。詳細については、[Serverlessクラスターコスト](./serverless-cluster-cost)を参照してください。

### 未使用クラスターの費用を回避するにはどうすればよいですか？\{#how-can-i-avoid-expenses-on-unused-clusters}

コンピューティングコストを節約するために、未使用のクラスターを一時停止することをお勧めします。必要に応じて後で再開できます。

### Zilliz Cloudの使用コストを推定するには？\{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

コスト推定を取得するには[計算ツール](https://zilliz.com/pricing)を使用するか、詳細は[コストの理解](./understand-cost)を参照してください。

### Zilliz CloudはAzureへのデプロイをサポートしていますか？\{#does-zilliz-cloud-support-deployment-on-azure}

はい。Zilliz Cloudは現在、Azureへのデプロイをサポートしています。[クラウドプロバイダーおよびリージョン](./cloud-providers-and-regions)を参照してください。

### 新しいクラウドリージョンをリクエストするにはどうすればよいですか？\{#how-can-i-request-a-new-cloud-region}

Zilliz Cloudの新しいクラウドサービスプロバイダーリージョンをリクエストするには、[フォームに記入](https://zilliz.com/cloud-region-request)してください。

### 自分がどのプランを使用しているかを確認するには？\{#how-can-i-know-which-plan-i-am-on}

プランを表示するには、プロジェクトリストに移動します。各プロジェクトのプランが表示されます。

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](/img/XMRtb3eYsoWUnsxQM0ecyjj2nqf.png)

### 特定のコレクションに必要なクエリCU数は？\{#how-many-query-cus-do-i-need-for-a-given-collection}

- パフォーマンス最適化：最大で150万個の768次元ベクトルをサポートします。

- 容量最適化：最大で500万個の768次元ベクトルをサポートします。

- レイヤードストレージ：最大で2000万個の768次元ベクトルをサポートします。

これらの推定値は、主キーのみを持つベクトルに基づいています。IDやラベルなどの追加のスカラーフィールドは容量を減少させる可能性があります。正確な評価のために独自のテストを実施することをお勧めします。

### どのタイプのクラスターを選択すべきですか？\{#which-type-of-cluster-should-i-pick}

リアルタイムアプリケーションのためにインスタント検索結果と高並列トラフィックが必要な場合は、パフォーマンス最適化を選択してください。
信頼性のある検索速度を維持しながら大規模なベクトルデータセットを処理する必要がある場合は、容量最適化を選択してください。
明確なホットデータとコールドデータのパターンを持つ超大規模でコストに敏感なワークロードを処理する必要がある場合は、レイヤードストレージクラスターを選択してください。レイヤードストレージクラスターを選択するには、クラスターに少なくとも8つのクエリCUが必要です。

### パフォーマンス最適化CUと容量最適化CUの違いは？\{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

「パフォーマンス最適化CU」は、低レイテンシまたは高スループット類似性検索に適しています。このオプションは、高検索パフォーマンスシナリオに最適です。

「容量最適化CU」は、パフォーマンス最適化CUオプションよりも5倍大きなデータ量に適しています。このオプションは、ストレージ容量を増やすシナリオに最適です。

詳細については、[適切なCUの選択](./cu-types-explained)を参照してください。
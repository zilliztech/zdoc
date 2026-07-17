---
title: "FAQ: コレクション | CLOUD"
slug: /faq-collection
sidebar_label: "FAQ: コレクション"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud コレクションの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3
displayed_sidebar: default

---

# FAQ: コレクション

このトピックでは、Zilliz Cloud コレクションの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で紹介します。

## 目次

- [1 つのクラスターで許可されるコレクションの数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクション作成時に動的フィールドを無効にしていた場合、後から有効にできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud がサポートするインデックス作成のメトリックタイプには何がありますか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクションの読み込みリクエストの同時実行数はいくつですか？同時実行リクエスト数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [コレクションの読み込みに失敗するのはなぜですか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [コレクションに追加できるフィールド数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [コレクション内のシャード数は変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [パーティション名にルールはありますか？](#is-there-any-rules-for-partition-names)
- [異なるモデルプロバイダーごとにカスタムパラメータを設定できますか？](#can-i-configure-custom-parameters-for-different-model-providers)

## FAQs




### 1 つのクラスターで許可されるコレクションの数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

無料クラスターでは最大 5 つのコレクションを作成できます。上限に達していて、さらにコレクションを作成する必要がある場合は、クラスターのデプロイオプションを[アップグレード](./manage-cluster)してください。

Serverless クラスターでは最大 100 のコレクションを作成できます。

Dedicated クラスターで許可されるコレクション数は、クラスターの CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

serving クラスターで許可されるコレクションの最大数に達した場合は、次の対応が可能です。

1. serving クラスターを、より大きい query CUs に[スケール](./manage-cluster)します。

1. 使用していないコレクションを[削除](./drop-collection)します。

1. コレクションの代わりに[パーティション](./manage-partitions)の作成を試します。

### コレクション作成時に動的フィールドを無効にしていた場合、後から有効にできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。コレクション作成後でも動的フィールドを有効にできます。詳細については、[Modify Collection](./modify-collections) を参照してください。

### Zilliz Cloud がサポートするインデックス作成のメトリックタイプには何がありますか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud は次の種類のメトリックをサポートしています。

1. **Euclidean (L2)** は、平面上の 2 つのベクトル間の距離を測定します。結果が小さいほど、2 つのベクトルはより類似しています。

1. **Inner Product (IP)** は、2 つのベクトルを乗算します。結果がより正の値であるほど、2 つのベクトルはより類似しています。

1. **Cosine** は、2 つのベクトル間の角度の cosine 値を測定します。

1. **Jaccard** は、データセット間の非類似度を測定し、JACCARD 類似係数を 1 から引くことで求められます。

1. **Hamming** は、バイナリデータ文字列を測定します。長さが等しい 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDK を使用して、パラメータ **collection.ttl.seconds** の値を指定することでコレクションの TTL を設定できます。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

次の例では TTL を 1800 秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクションの読み込みリクエストの同時実行数はいくつですか？同時実行リクエスト数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloud におけるコレクションの読み込みリクエストのレート制限は 1 秒あたり 1 件です。これは 1 CU クラスターに対する推奨値です。同時実行リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### コレクションの読み込みに失敗するのはなぜですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、クラスターのメモリ不足が原因です。クラスターをより大きな CU サイズに[スケールアップ](./auto-scaling)してみてください。

### コレクションに追加できるフィールド数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1 つのコレクションには最大 64 個のフィールドを持たせることができます。

### パーティションとパーティションキーの違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。パーティションは、特定の基準に基づいてデータを整理するために使用されます。

Partition Key は、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドを Partition Key として指定し、検索時に Partition Key に基づくフィルタ条件を指定することで、検索範囲をいくつかのパーティションに絞り込み、検索効率を向上させることができます。 

違いは、パーティションではデータが物理的に分離されるのに対し、パーティションキーではデータが論理的にグループ化されることです。さらに、パーティションは手動で作成および管理する必要がありますが、パーティションキーを有効にすると 16 個のパーティションが自動的に作成され、同じパーティションキー値を持つデータは同じパーティションにルーティングされます。

詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

### コレクション内のシャード数は変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。シャード数を変更するには、"[clone collection](./manage-collections-console#create-a-collection)" 機能を使用します。

1. 対象コレクションの **Overview** ページに移動します。

1. **Actions** ドロップダウンで、**Clone** を選択します。

1. ダイアログで、次の操作を行います。

    - コレクション名を入力します

    - **Clone scope** を **Collection schema and data** に設定します。

    - **Settings** を展開し、希望するシャード数を指定します。

    - **Clone** をクリックします。

1. clone されたコレクションが作成されたら、新しく clone されたコレクションを使用するようにアプリケーションコードを更新します。

### パーティション名にルールはありますか？\{#is-there-any-rules-for-partition-names}

はい。パーティション名に使用できるのは、英字、数字、アンダースコア（“_”）、ハイフン（“-”）のみで、数字またはハイフンで始めることはできません。

### 異なるモデルプロバイダーごとにカスタムパラメータを設定できますか？\{#can-i-configure-custom-parameters-for-different-model-providers}

はい。異なるモデルプロバイダーに対してカスタムパラメータがサポートされています。サポートされるパラメータの完全な一覧については、各プロバイダーの公式ドキュメントを参照してください。

- [OpenAI](https://platform.openai.com/docs/api-reference/embeddings)

- [Cohere](https://docs.cohere.com/reference/embed)

- [Voyage AI](https://docs.voyageai.com/docs/embeddings)

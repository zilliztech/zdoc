---
title: "FAQ: Collection | CLOUD"
slug: /faq-collection
sidebar_label: "FAQ: Collection"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud コレクションの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3
displayed_sidebar: default

---

# FAQ: Collection

このトピックでは、Zilliz Cloud コレクションの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## Contents

- [1 つのクラスターで許可されるコレクションの数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクション作成時に動的フィールドを無効にしていた場合、後から有効にできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud でサポートされているインデックス作成のメトリックタイプは何ですか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクションのロードリクエストの同時実行数はどれくらいですか？同時リクエスト数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [コレクションのロードに失敗するのはなぜですか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [コレクションに追加できるフィールド数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [コレクション内のシャード数は変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [パーティション名にルールはありますか？](#is-there-any-rules-for-partition-names)
- [異なるモデルプロバイダーごとにカスタムパラメータを設定できますか？](#can-i-configure-custom-parameters-for-different-model-providers)

## FAQs




### 1 つのクラスターで許可されるコレクションの数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

Free クラスターでは最大 5 つのコレクションを作成できます。上限に達していて、さらにコレクションを作成する必要がある場合は、クラスターのデプロイオプションを[アップグレード](./manage-cluster)してください。

Serverless クラスターでは最大 100 のコレクションを作成できます。

Dedicated クラスターで許可されるコレクション数は、クラスターの CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

サービングクラスターで許可されるコレクションの最大数に達した場合、次のことができます。

1. サービングクラスターをより大きい query CU 数に[スケール](./manage-cluster)する。

1. 使用していないコレクションを[削除](./drop-collection)する。

1. コレクションの代わりに[パーティション](./manage-partitions)を作成してみる。

### コレクション作成時に動的フィールドを無効にしていた場合、後から有効にできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。コレクションの作成後でも動的フィールドを有効にできます。詳細については、[Modify Collection](./modify-collections)を参照してください。

### Zilliz Cloud でサポートされているインデックス作成のメトリックタイプは何ですか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud は以下のメトリックタイプをサポートしています。

1. **Euclidean (L2)** は、平面上の 2 つのベクトル間の距離を測定します。結果が小さいほど、2 つのベクトルはより類似しています。

1. **Inner Product (IP)** は、2 つのベクトルを乗算します。結果がより正の値であるほど、2 つのベクトルはより類似しています。

1. **Cosine** は、2 つのベクトルのなす角のコサイン値を測定します。

1. **Jaccard** は、データセット間の非類似性を測定し、JACCARD 類似係数を 1 から引くことで得られます。

1. **Hamming** は、バイナリデータ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDK を使用して、パラメータ **collection.ttl.seconds** の値を指定することでコレクションの TTL を設定できます。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

次の例では TTL を 1800 秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクションのロードリクエストの同時実行数はどれくらいですか？同時リクエスト数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloud におけるコレクションロードリクエストのレート制限は 1 秒あたり 1 件です。これは 1 CU クラスターに対する推奨値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### コレクションのロードに失敗するのはなぜですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、クラスターのメモリ不足が原因です。クラスターをより大きい CU サイズに[スケールアップ](./undefined)してみてください。

### コレクションに追加できるフィールド数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1 つのコレクションには最大 64 個のフィールドを持てます。

### パーティションとパーティションキーの違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。パーティションは、特定の条件に基づいてデータを整理するために使用されます。

Partition Key は、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドを Partition Key として指定し、検索時に Partition Key に基づくフィルタリング条件を指定することで、検索範囲を複数のパーティションに絞り込み、検索効率を向上させることができます。 

違いは、データがパーティションでは物理的に分離される一方で、パーティションキーでは論理的にグループ化されることです。また、パーティションは手動で作成して管理する必要がありますが、パーティションキーを有効にすると 16 個のパーティションが自動的に作成され、同じパーティションキー値を持つデータは同じパーティションにルーティングされます。

詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

### コレクション内のシャード数は変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。シャード数を変更するには、"[clone collection](./manage-collections-console#create-a-collection)" 機能を使用します。

1. 対象コレクションの **Overview** ページに移動します。

1. **Actions** ドロップダウンで **Clone** を選択します。

1. ダイアログで、以下を行います。

    - コレクション名を入力します

    - **Clone scope** を **Collection schema and data** に設定します。

    - **Settings** を展開し、希望するシャード数を指定します。

    - **Clone** をクリックします。

1. クローンされたコレクションが作成されたら、アプリケーションコードを更新して、新しくクローンしたコレクションを使用するようにします。

### パーティション名にルールはありますか？\{#is-there-any-rules-for-partition-names}

はい。パーティション名には、英字、数字、アンダースコア（“_”）、ハイフン（“-”）のみを含めることができ、数字またはハイフンで始めることはできません。

### 異なるモデルプロバイダーごとにカスタムパラメータを設定できますか？\{#can-i-configure-custom-parameters-for-different-model-providers}

はい。異なるモデルプロバイダーに対してカスタムパラメータがサポートされています。サポートされているパラメータの完全な一覧については、各プロバイダーの公式ドキュメントを参照してください。

- [OpenAI](https://platform.openai.com/docs/api-reference/embeddings)

- [Cohere](https://docs.cohere.com/reference/embed)

- [Voyage AI](https://docs.voyageai.com/docs/embeddings)

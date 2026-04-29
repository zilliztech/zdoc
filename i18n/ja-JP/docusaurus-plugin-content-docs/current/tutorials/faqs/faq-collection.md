---
title: "FAQ: コレクション | CLOUD"
slug: /faq-collection
sidebar_label: "FAQ: コレクション"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud のコレクションを使用する際に発生する可能性のある問題と、それらの解決策を一覧にしています。| CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3

---

# FAQ: Collection

このトピックでは、Zilliz Cloud のコレクションを使用する際に発生する可能性のある問題と、それに対応する解決策を一覧にします。

## 目次

- [単一のクラスターで許可されるコレクションの数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクション作成時に動的フィールドが無効化されていた場合、後から有効にできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud でサポートされているインデックスのメトリックタイプは何ですか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクションのロードリクエストにおける同時実行性はどうなっていますか？また、同時リクエスト数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [コレクションのロードに失敗するのはなぜですか？また、どう対処すればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [コレクションに追加できるフィールド数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [コレクション内のシャード数を変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [パーティション名に関するルールはありますか？](#is-there-any-rules-for-partition-names)
- [異なるモデルプロバイダーに対してカスタムパラメーターを設定できますか？](#can-i-configure-custom-parameters-for-different-model-providers)

## よくある質問




### 単一のクラスターで許可されるコレクションの数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

フリークラスターでは、最大 5 つのコレクションを作成できます。上限に達し、さらに多くのコレクションを作成する必要がある場合は、クラスターのデプロイメントオプションを[アップグレード](./manage-cluster)してください。

Serverless クラスターでは、最大 100 のコレクションを作成できます。

Dedicated クラスターで許可されるコレクションの数は、クラスターの CU サイズによって異なります。詳細については、[Zilliz Cloud 制限s](./limits#collections) を参照してください。

稼働中のクラスターで許可されるコレクション数の上限に達した場合は、以下のいずれかの対応が可能です。

1. サービングクラスターをより大きなクエリ CU 数に[スケール](./manage-cluster)します。

1. 未使用のコレクションを[削除](./drop-collection)します。

1. コレクションの代わりに[パーティション](./manage-partitions) の作成を検討します。

### コレクション作成時に動的フィールドが無効化されていた場合、後から有効にできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。コレクション作成後でも動的フィールドを有効にすることができます。詳細については、[コレクションの変更](./modify-collections) をご覧ください。

### Zilliz Cloud でサポートされているインデックスのメトリックタイプは何ですか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud では、以下のメトリックタイプをサポートしています。

1. **Euclidean (L2)** は、平面上の 2 つのベクトル間の距離を測定します。結果が小さいほど、2 つのベクトルは類似しています。

1. **内積 (IP)** は、2 つのベクトルを乗算します。結果が正の値であるほど、2 つのベクトルは類似しています。

1. **コサイン** は、2 つのベクトル間の角度のコサイン値を測定します。

1. **Jaccard** は、データセット間の非類似度を測定し、JACCARD 類似度係数を 1 から引くことで得られます。

1. **ハミング** は、バイナリデータ文字列を測定します。長さが等しい 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成済みコレクションの TTL（time to live）プロパティを設定するにはどうすればよいですか？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDK を使用して、パラメーター **collection.ttl.seconds** の値を指定することで、コレクションの TTL を設定できます。詳細については、[コレクション TTL の設定](./set-collection-ttl) を参照してください。

以下の例では、TTL を 1800 秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクション読み込みリクエストの同時実行数とは何ですか？同時リクエスト数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloud におけるコレクション読み込みリクエストのレート制限は 1 秒あたり 1 リクエストです。これは 1 CU クラスター向けの推奨値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### コレクションの読み込みに失敗するのはなぜですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、クラスターのメモリ不足が原因です。クラスターをより大きな CU サイズに[スケールアップ](./scale-query-cu)してみてください。

### コレクションに追加できるフィールド数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1 つのコレクションに含めることができるフィールドの最大数は 64 です。

### パーティションとパーティションキーの違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

パーティションはコレクションの部分集合です。各パーティションは親コレクションと同じデータ構造を持ちますが、コレクション内のデータの一部のみを含みます。パーティションは、特定の基準に基づいてデータを整理するために使用されます。

パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラフィールドをパーティションキーとして指定し、検索中にパーティションキーに基づいてフィルタリング条件を指定することで、検索範囲をいくつかのパーティションに絞り込み、検索効率を向上させることができます。

違いは、データがパーティション内で物理的に分離されているのに対し、パーティションキーはデータを論理的にグループ化することです。さらに、パーティションは手動で作成および管理する必要がありますが、パーティションキーを有効にすると 16 のパーティションが自動的に作成され、同じパーティションキー値を持つデータが同じパーティションにルーティングされます。

詳細については、[パーティションの管理](./manage-partitions) および [パーティションキーの使用](./use-partition-key) を参照してください。

### コレクション内のシャード数を変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。シャード数を変更するには、「[コレクションのクローン](./manage-collections-console#create-a-collection)」機能を使用します。

1. 対象コレクションの**概要**ページに移動します。

1. **アクション**ドロップダウンで、**クローン**を選択します。

1. ダイアログで、

    - コレクション名を入力します

    - **クローンスコープ**を**コレクションのスキーマとデータ**に設定します。

    - **設定**を展開し、希望するシャード数を指定します。

    - **クローン**をクリックします。

1. クローンされたコレクションが作成された後、アプリケーションコードを更新して新しくクローンされたコレクションを使用するようにします。

### パーティション名に関する規則はありますか？\{#is-there-any-rules-for-partition-names}

はい。パーティション名には文字、数字、アンダースコア（"_"）、ハイフン（"-"）のみを含めることができ、数字またはハイフンで始まることはできません。

### 異なるモデルプロバイダーに対してカスタムパラメータを設定できますか？\{#can-i-configure-custom-parameters-for-different-model-providers}

はい、異なるモデルプロバイダーに対してカスタムパラメータがサポートされています。サポートされるパラメータの完全なリストについては、各プロバイダーの公式ドキュメントを参照してください。

- [OpenAI](https://platform.openai.com/docs/api-reference/embeddings)

- [Cohere](https://docs.cohere.com/reference/embed)

- [Voyage AI](https://docs.voyageai.com/docs/embeddings)

---
title: "FAQ: Collection | BYOC"
slug: /faq-collection
sidebar_label: "FAQ: Collection"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud collection の使用中に発生する可能性のある問題と、その対応する解決策を一覧表示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3
displayed_sidebar: default

---

# FAQ: Collection

このトピックでは、Zilliz Cloud collection の使用中に発生する可能性のある問題と、その対応する解決策を一覧表示します。

## 目次

- [1 つの cluster で許可される collection 数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [collection 作成時に dynamic field を無効にしていた場合、後から有効にできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud でサポートされているインデックス作成メトリックタイプは何ですか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済み collection の TTL（time to live）プロパティを設定するにはどうすればよいですか？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [collection のロードリクエストの同時実行数はどのくらいですか？同時リクエスト数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [collection のロードに失敗するのはなぜですか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [collection に追加できる field 数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [partition と partition key の違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [collection の shard 数を変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [partition 名にルールはありますか？](#is-there-any-rules-for-partition-names)

## FAQs




### 1 つの cluster で許可される collection 数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

cluster で許可される collection 数は、cluster の CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

serving cluster で許可される collection の最大数に達した場合は、次の対応が可能です。

1. serving cluster をより大きい query CU 数に[スケール](./manage-cluster)します。

1. 使用していない collection を[削除](./drop-collection)します。

1. collection の代わりに [partition](./manage-partitions) を作成してみてください。

### collection 作成時に dynamic field を無効にしていた場合、後から有効にできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。collection 作成後でも dynamic field を有効にできます。詳細については、[Modify Collection](./modify-collections) を参照してください。

### Zilliz Cloud でサポートされているインデックス作成メトリックタイプは何ですか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud は以下の種類のメトリックをサポートしています。

1. **Euclidean (L2)** は、平面上の 2 つの vector 間の距離を測定します。結果が小さいほど、2 つの vector はより類似しています。

1. **Inner Product (IP)** は、2 つの vector を乗算します。結果がより正であるほど、2 つの vector はより類似しています。

1. **Cosine** は、2 つの vector 間の角度のコサイン値を測定します。

1. **Jaccard** は、データセット間の非類似度を測定し、JACCARD 類似度係数を 1 から引くことで求められます。

1. **Hamming** は、バイナリデータ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成済み collection の TTL（time to live）プロパティを設定するにはどうすればよいですか？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDK を使用して、パラメータ **collection.ttl.seconds** の値を指定することで、collection の TTL を設定できます。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

次の例では、TTL を 1800 秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### collection のロードリクエストの同時実行数はどのくらいですか？同時リクエスト数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloud における collection ロードリクエストのレート制限は 1 秒あたり 1 件です。これは 1 CU cluster に対する推奨値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### collection のロードに失敗するのはなぜですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、cluster のメモリ不足が原因です。cluster をより大きい CU サイズに[スケールアップ](./auto-scaling)してみてください。

### collection に追加できる field 数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1 つの collection には最大 64 個の field を持てます。

### partition と partition key の違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

partition は collection のサブセットです。各 partition は親 collection と同じデータ構造を共有しますが、collection 内のデータの一部だけを含みます。partition は、特定の基準に基づいてデータを整理するために使用されます。

Partition Key は、partition に基づく検索最適化ソリューションです。特定の scalar field を Partition Key として指定し、検索時に Partition Key に基づくフィルタリング条件を指定することで、検索範囲を複数の partition に絞り込み、検索効率を向上させることができます。 

違いは、partition ではデータが物理的に分離される一方、partition key ではデータが論理的にグループ化される点です。また、partition は手動で作成および管理する必要がありますが、partition key を有効にすると 16 個の partition が自動的に作成され、同じ partition key 値を持つデータは同じ partition にルーティングされます。

詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

### collection の shard 数を変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。shard 数を変更するには、"[clone collection](./manage-collections-console#create-a-collection)" 機能を使用します。

1. 対象 collection の **Overview** ページに移動します。

1. **Actions** ドロップダウンで **Clone** を選択します。

1. ダイアログで、以下を行います。

    - collection 名を入力します

    - **Clone scope** を **Collection schema and data** に設定します。

    - **Settings** を展開し、必要な shard 数を指定します。

    - **Clone** をクリックします。

1. クローンされた collection が作成されたら、新しくクローンした collection を使用するようにアプリケーションコードを更新します。

### partition 名にルールはありますか？\{#is-there-any-rules-for-partition-names}

はい。partition 名には、文字、数字、アンダースコア（“_”）、ハイフン（“-”）のみを使用でき、数字またはハイフンで始めることはできません。

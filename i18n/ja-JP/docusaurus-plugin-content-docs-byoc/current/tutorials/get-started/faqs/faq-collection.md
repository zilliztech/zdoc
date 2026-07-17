---
title: "FAQ: Collection | BYOC"
slug: /faq-collection
sidebar_label: "FAQ: Collection"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud collection の使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3
displayed_sidebar: default

---

# FAQ: Collection

このトピックでは、Zilliz Cloud collection の使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## Contents

- [1 つの cluster で許可される collection 数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [collection 作成時に dynamic field を無効にした場合、後から有効にできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloud がサポートするインデックス作成の metric type には何がありますか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済み collection の TTL（time to live）プロパティはどのように設定しますか？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [collection のロードリクエストの同時実行数はいくつですか？同時リクエスト数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [collection のロードに失敗するのはなぜですか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [collection に追加できる field 数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [partition と partition key の違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [collection 内の shard 数は変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [partition 名に関するルールはありますか？](#is-there-any-rules-for-partition-names)

## FAQs




### 1 つの cluster で許可される collection 数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

cluster で許可される collection 数は、cluster の CU サイズによって異なります。詳細については、[Zilliz Cloud Limits](./limits#collections) を参照してください。

serving cluster で許可される最大数の collection に達した場合は、次の方法を利用できます。

1. serving cluster をより大きい query CU 数に[スケール](./manage-cluster)します。

1. 使用していない collection を[削除](./drop-collection)します。

1. collection の代わりに [partition](./manage-partitions) の作成を試してください。

### collection 作成時に dynamic field を無効にした場合、後から有効にできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。collection 作成後でも dynamic field を有効にできます。詳細については、[Modify Collection](./modify-collections) を参照してください。

### Zilliz Cloud がサポートするインデックス作成の metric type には何がありますか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud は次の type の metric をサポートしています。

1. **Euclidean (L2)** は、平面上の 2 つの vector 間の距離を測定します。結果が小さいほど、2 つの vector はより類似しています。

1. **Inner Product (IP)** は、2 つの vector を乗算します。結果がより正の値であるほど、2 つの vector はより類似しています。

1. **Cosine** は、2 つの vector 間の角度のコサイン値を測定します。

1. **Jaccard** は、データセット間の非類似度を測定し、JACCARD 類似係数を 1 から引くことで得られます。

1. **Hamming** は、バイナリデータ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成済み collection の TTL（time to live）プロパティはどのように設定しますか？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDK を使用して、パラメーター **collection.ttl.seconds** の値を指定することで collection の TTL を設定できます。詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください。

次の例では、TTL を 1800 秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### collection のロードリクエストの同時実行数はいくつですか？同時リクエスト数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloud における collection のロードリクエストのレート制限は 1 秒あたり 1 件です。これは 1 CU cluster に対する推奨値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### collection のロードに失敗するのはなぜですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、cluster のメモリ不足が原因です。cluster をより大きい CU サイズに[スケールアップ](./auto-scaling)してみてください。

### collection に追加できる field 数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1 つの collection には最大 64 個の field を持たせることができます。

### partition と partition key の違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

partition は collection のサブセットです。各 partition は親 collection と同じデータ構造を共有しますが、collection 内のデータの一部のみを含みます。partition は、特定の基準に基づいてデータを整理するために使用されます。

Partition Key は、partition に基づく検索最適化ソリューションです。特定の scalar field を Partition Key として指定し、検索時に Partition Key に基づくフィルタリング条件を指定することで、検索範囲を複数の partition に絞り込み、検索効率を向上させることができます。 

違いは、partition ではデータが物理的に分離される一方で、partition key はデータを論理的にグループ化する点です。また、partition は手動で作成および管理する必要がありますが、partition key を有効にすると 16 個の partition が自動的に作成され、同じ partition key 値を持つデータは同じ partition にルーティングされます。

詳細については、[Manage Partitions](./manage-partitions) および [Use Partition Key](./use-partition-key) を参照してください。

### collection 内の shard 数は変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。shard 数を変更するには、"[clone collection](./manage-collections-console#create-a-collection)" 機能を使用します。

1. 対象 collection の **Overview** ページに移動します。

1. **Actions** ドロップダウンで **Clone** を選択します。

1. ダイアログで、以下を実行します。

    - collection 名を入力します

    - **Clone scope** を **Collection schema and data** に設定します。

    - **Settings** を展開し、必要な shard 数を指定します。

    - **Clone** をクリックします。

1. clone された collection が作成されたら、アプリケーションコードを更新して、新しく clone した collection を使用します。

### partition 名に関するルールはありますか？\{#is-there-any-rules-for-partition-names}

はい。partition 名には、英字、数字、アンダースコア（“_”）、ハイフン（“-”）のみ使用でき、数字またはハイフンで始めることはできません。

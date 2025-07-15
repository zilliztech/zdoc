---
title: "FAQ:コレクション | BYOC"
slug: /faq-collection
sidebar_label: "FAQ:コレクション"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudコレクションを使用する際に発生する可能性のある問題と、それに対応する解決策について説明します。 | BYOC"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 3

---

# FAQ:コレクション

このトピックでは、Zilliz Cloudコレクションを使用する際に発生する可能性のある問題と、それに対応する解決策について説明します。

## Contents

- [1つのクラスターには何個のコレクションが許可されていますか?](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクションで動的スキーマが有効になっているかどうかを知るにはどうすればよいですか?](#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection)
- [コレクションが作成されたときに動的スキーマが無効になっていた場合、後で有効にできますか?](#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloudでサポートされているインデックスメトリックタイプは何ですか?](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成したコレクションのTTL（Time to Live）プロパティを設定する方法は?](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクションのロード要求の同時性は何ですか?同時要求の数を増やすにはどうすればよいですか?](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [コレクションの読み込みに失敗するのはなぜですか?どうすればいいですか?](#why-do-i-fail-to-load-collections-what-can-i-do)
- [コレクションに追加できるフィールドの数に制限はありますか?](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか?](#whats-the-difference-between-partitions-and-partition-keys)

## FAQs




### 1つのクラスターには何個のコレクションが許可されていますか?{#how-many-collections-are-allowed-in-a-single-cluster}

クラスターで許可されるコレクション数は、クラスターCUの体格によって異なります。詳細については、「[Zillizクラウドの制限](./limits)」を参照してください。

クラスターで許可されるコレクションの最大数に達した場合は、次の操作を実行できます。

1. [クラスタ](./manage-cluster)をより大きなCUサイズにスケーリングします。

1. [未使用](./drop-collection)のコレクションを削除する。

1. コレクションの代わりに[パーティション](./manage-partitions)を作成してみてください。

### コレクションで動的スキーマが有効になっているかどうかを知るにはどうすればよいですか?{#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection}

Zilliz Cloudのウェブコンソールから動的スキーマの状態を閲覧できます。コレクションを選択し、**概要**タブに移動します。動的スキーマが有効かどうかを確認できます。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

![faq_dynamic_schema_enabled](/img/faq_dynamic_schema_enabled.png)

### コレクションが作成されたときに動的スキーマが無効になっていた場合、後で有効にできますか?{#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

いいえ。コレクションを作成する際に動的スキーマを有効または無効にした場合、後で動的スキーマの状態を変更することはできません。詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

### Zilliz Cloudでサポートされているインデックスメトリックタイプは何ですか?{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloudは3種類のメトリックをサポートしています。

1. **ユークリッド(L 2)**は、平面内の2つのベクトル間の距離を測定します。結果が小さいほど、2つのベクトルはより類似しています。

1. **内積(IP)**は2つのベクトルを乗算します。結果がより正であるほど、2つのベクトルはより類似しています。

1. **コサイン**は、2つのベクトル間の角度のコサイン値を測定します。

1. **Jaccard**はデータセット間の相違度を測定し、1からJACC ARD類似度係数を引くことによって得られます。

1. **ハミング**はバイナリデータ文字列を測定します。等しい長さの2つの文字列間の距離は、ビットが異なるビット位置の数です。

### 作成したコレクションのTTL（Time to Live）プロパティを設定する方法は?{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

PyMilvus SDKを使用して、パラメータcollection. ttl.secondsの値を指定することで、コレクションのTTLを設定できま**す**。

次の例では、TTLを1800秒に設定します。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクションのロード要求の同時性は何ですか?同時要求の数を増やすにはどうすればよいですか?{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloudでの収集リクエストの読み込みのレート制限は1秒あたり1です。これは1 CUクラスタの推奨値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### コレクションの読み込みに失敗するのはなぜですか?どうすればいいですか?{#why-do-i-fail-to-load-collections-what-can-i-do}

クラスタ内のメモリが不足しているため、障害が発生しています。クラスタをより大きなCUサイズに[スケーリングアップ](./scale-cluster)してみてください。

### コレクションに追加できるフィールドの数に制限はありますか?{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1つのコレクションに最大64個のフィールドを持つことができます。

### パーティションとパーティションキーの違いは何ですか?{#whats-the-difference-between-partitions-and-partition-keys}

パーティションは、特定の基準に基づいてデータを整理するために使用されます。

パーティションキーはエンティティを同じキーでグループ化し、クエリのパフォーマンスを高速化します。

違いは、データがパーティションに物理的に分離されているのに対し、パーティションキーはデータを論理的にグループ化することです。

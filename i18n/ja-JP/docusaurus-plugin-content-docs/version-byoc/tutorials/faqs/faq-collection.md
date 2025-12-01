---
title: "FAQ: コレクション | BYOC"
slug: /faq-collection
sidebar_label: "FAQ: コレクション"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudコレクションを使用中に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3

---

# FAQ: コレクション

このトピックでは、Zilliz Cloudコレクションを使用中に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [1つのクラスターで許可されるコレクション数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクション作成時に動的フィールドが無効化されていた場合、後から有効化できますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloudがサポートするインデックスメトリックタイプは何ですか？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成済みコレクションのTTL（time to live）プロパティを設定するには？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクション読み込みリクエストの同時実行数は？同時実行数を増やすには？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [なぜコレクションの読み込みに失敗するのですか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [コレクションに追加できるフィールド数には制限がありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [コレクション内のシャード数を変更できますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [パーティション名にはルールがありますか？](#is-there-any-rules-for-partition-names)

## よくある質問




### 1つのクラスターで許可されるコレクション数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

クラスターで許可されるコレクション数はクラスターCUサイズによって異なります。詳細については、[Zilliz Cloud制限事項](./limits#collections)を参照してください。

クラスターで許可される最大コレクション数に達した場合、以下を行うことができます：

1. [スケール](./manage-cluster)してクラスターをより大きなCUサイズに変更する。

2. 使用していないコレクションを[削除](./drop-collection)する。

3. コレクションの代わりに[パーティション](./manage-partitions)を作成する。

### コレクション作成時に動的フィールドが無効化されていた場合、後から有効化できますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。コレクション作成後でも動的フィールドを有効化できます。詳細については、[コレクションの変更](./modify-collections)を参照してください。

### Zilliz Cloudがサポートするインデックスメトリックタイプは何ですか？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloudは以下のタイプのメトリックをサポートしています。

1. **ユークリッド距離（L2）** は平面上の2つのベクトル間の距離を測定します。結果が小さいほど、2つのベクトルはより類似しています。

2. **内積（IP）** は2つのベクトルを乗算します。結果がより正の値であるほど、2つのベクトルはより類似しています。

3. **コサイン** は2つのベクトル間の角度のコサイン値を測定します。

4. **ヤコビ** はデータセット間の非類似性を測定し、JACCARD類似係数を1から引いて算出されます。

5. **ハミング** はバイナリデータ文字列を測定します。同じ長さの2つの文字列間の距離は、ビットが異なる位置の数です。

### 作成済みコレクションのTTL（time to live）プロパティを設定するには？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDKを使用してパラメータ**collection.ttl.seconds**の値を指定することで、コレクションのTTLを設定できます。詳細については、[コレクションTTLの設定](./set-collection-ttl)を参照してください。

以下の例では、TTLを1800秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクション読み込みリクエストの同時実行数は？同時実行数を増やすには？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloudでのコレクション読み込みリクエストのレート制限は1秒あたり1です。これは1CUクラスターに推奨される値です。同時リクエスト数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### なぜコレクションの読み込みに失敗するのですか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

原因はクラスターのメモリ不足です。クラスターをより大きなCUサイズに[スケールアップ](./scale-cluster)してください。

### コレクションに追加できるフィールド数には制限がありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1つのコレクションにおいて最大64個のフィールドを持つことができます。

### パーティションとパーティションキーの違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。パーティションは特定の基準に基づいてデータを整理するために使用されます。

パーティションキーはパーティションに基づく検索最適化ソリューションです。特定のスカラー値フィールドをパーティションキーとして指定し、検索中にパーティションキーに基づくフィルタ条件を指定することで、検索範囲を複数のパーティションに絞り込むことができ、検索効率を向上させます。

違いは、データがパーティションでは物理的に分離されるのに対し、パーティションキーはデータを論理的にグループ化することです。また、パーティションは手動で作成および管理する必要がありますが、パーティションキーを有効にすると16個のパーティションが自動的に作成され、同じパーティションキー値を持つデータは同じパーティションにルーティングされます。

詳細については、[パーティションの管理](./manage-partitions)および[パーティションキーの使用](./use-partition-key)を参照してください。

### コレクション内のシャード数を変更できますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。シャード数を変更するには、「[コレクションの複製](./manage-collections-console#create-collection)」機能を使用します：

1. 対象コレクションの**概要**ページに移動します。

2. **アクション**ドロップダウンで**複製**を選択します。

3. ダイアログで、

    - コレクション名を入力します

    - **複製範囲**を**コレクションスキーマとデータ**に設定します。

    - **設定**を展開し、目的のシャード数を指定します。

    - **複製**をクリックします。

4. 複製されたコレクションが作成されたら、アプリケーションコードを更新して新たに複製されたコレクションを使用します。

### パーティション名にはルールがありますか？\{#is-there-any-rules-for-partition-names}

はい。パーティション名には英字、数字、アンダースコア（"_"）、ハイフン（"-"）のみを含めることができ、数字またはハイフンで始まることはできません。

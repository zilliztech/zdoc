---
title: "FAQ：コレクション | CLOUD"
slug: /faq-collection
sidebar_label: "FAQ：コレクション"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudコレクションを使用中に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3

---

# FAQ：コレクション

このトピックでは、Zilliz Cloudコレクションを使用中に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [1つのクラスターで許可されるコレクション数はいくつですか？](#how-many-collections-are-allowed-in-a-single-cluster)
- [コレクション作成時に動的フィールドが無効化されていた場合、後から有効にすることはできますか？](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [Zilliz Cloudがサポートするインデックスメトリックタイプは？](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [作成したコレクションのTTL（time to live）プロパティを設定するには？](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [コレクションの読み込み要求の同時実行数は？同時実行数を増やすにはどうすればよいですか？](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [なぜコレクションの読み込みに失敗するのでしょうか？どうすればよいですか？](#why-do-i-fail-to-load-collections-what-can-i-do)
- [1つのコレクションに追加できるフィールド数に制限はありますか？](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [パーティションとパーティションキーの違いは何ですか？](#whats-the-difference-between-partitions-and-partition-keys)
- [コレクション内のシャード数を変更することはできますか？](#can-i-modify-the-number-of-shards-in-a-collection)
- [パーティション名にルールはありますか？](#is-there-any-rules-for-partition-names)

## FAQ

### 1つのクラスターで許可されるコレクション数はいくつですか？\{#how-many-collections-are-allowed-in-a-single-cluster}

無料クラスターは最大5つのコレクションを持つことができます。上限に達していてさらに多くのコレクションを作成する必要がある場合は、クラスターデプロイメントオプションを[アップグレード](./manage-cluster)してください。

Serverlessクラスターは最大100個のコレクションを持つことができます。

Dedicatedクラスターで許可されるコレクション数は、クラスターのCUサイズによって異なります。詳細については、[Zilliz Cloudの制限事項](./limits#collections)を参照してください。

クラスターで許可される最大コレクション数に達した場合、以下のことを実行できます：

1. クラスターをより大きなCUサイズに[スケール](./manage-cluster)します。

2. 未使用のコレクションを[削除](./drop-collection)します。

3. コレクションの代わりに[パーティション](./manage-partitions)を作成してみてください。

### コレクション作成時に動的フィールドが無効化されていた場合、後から有効にすることはできますか？\{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

はい。コレクション作成後でも動的フィールドを有効にできます。詳細については、[コレクションの変更](./modify-collections)を参照してください。

### Zilliz Cloudがサポートするインデックスメトリックタイプは？\{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloudは以下のメトリックタイプをサポートしています。

1. **ユークリッド（L2）**は、平面上の2つのベクトル間の距離を測定します。結果の値が小さいほど、2つのベクトルはより類似しています。

2. **内積（IP）**は、2つのベクトルを乗算します。結果がより正の値になるほど、2つのベクトルはより類似しています。

3. **コサイン**は、2つのベクトル間の角度のコサイン値を測定します。

4. **ヤッカード**は、データセット間の非類似性を測定し、ヤッカード類似係数を1から引くことで求められます。

5. **ハミング**は、バイナリデータ文字列を測定します。等しい長さの2つの文字列の間の距離は、ビットが異なるビット位置の数です。

### 作成したコレクションのTTL（time to live）プロパティを設定するには？\{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

SDKを使用して、パラメータ**collection.ttl.seconds**の値を指定することで、コレクションのTTLを設定できます。詳細については、[コレクションTTLの設定](./set-collection-ttl)を参照してください。

以下の例では、TTLを1800秒に設定しています。

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### コレクションの読み込み要求の同時実行数は？同時実行数を増やすにはどうすればよいですか？\{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

現在、Zilliz Cloudではコレクション読み込み要求のレート制限は1秒あたり1回です。これは1 CUクラスターに推奨される値です。同時実行要求数を増やす必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### なぜコレクションの読み込みに失敗するのでしょうか？どうすればよいですか？\{#why-do-i-fail-to-load-collections-what-can-i-do}

この失敗は、クラスターのメモリ不足が原因です。クラスターをより大きなCUサイズに[スケールアップ](./scale-cluster)してみてください。

### 1つのコレクションに追加できるフィールド数に制限はありますか？\{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

はい。1つのコレクションに最大64個のフィールドを含めることができます。

### パーティションとパーティションキーの違いは何ですか？\{#whats-the-difference-between-partitions-and-partition-keys}

パーティションはコレクションのサブセットです。各パーティションは親コレクションと同じデータ構造を共有しますが、コレクション内のデータの一部のみを含みます。パーティションは特定の基準に基づいてデータを整理するために使用されます。

パーティションキーは、パーティションに基づく検索最適化ソリューションです。特定のスカラーフィールドをパーティションキーとして指定し、検索時にパーティションキーに基づくフィルター条件を指定することで、検索範囲をいくつかのパーティションに絞り込むことができ、検索効率が向上します。

違いは、パーティションではデータが物理的に分離されているのに対し、パーティションキーではデータが論理的にグループ化されている点です。さらに、パーティションは手動で作成および管理する必要がありますが、パーティションキーを有効にすると、16個のパーティションが自動的に作成され、同じパーティションキーの値を持つデータが同じパーティションにルーティングされます。

詳細については、[パーティションの管理](./manage-partitions)および[パーティションキーの使用](./use-partition-key)を参照してください。

### コレクション内のシャード数を変更することはできますか？\{#can-i-modify-the-number-of-shards-in-a-collection}

はい。シャード数を変更するには、「[コレクションのクローン](./manage-collections-console#create-collection)」機能を使用します：

1. 対象コレクションの**概要**ページに移動します。

2. **アクション**ドロップダウンから**クローン**を選択します。

3. ダイアログで、

    - コレクション名を入力します
    
    - **クローン範囲**を**コレクションスキーマとデータ**に設定します。
    
    - **設定**を展開し、希望するシャード数を指定します。
    
    - **クローン**をクリックします。

4. クローンされたコレクションが作成されたら、アプリケーションコードを更新して新しくクローンされたコレクションを使用するようにします。

### パーティション名にルールはありますか？\{#is-there-any-rules-for-partition-names}

はい。パーティション名には、英字、数字、アンダースコア（「_」）、ハイフン（「-」）のみを含めることができ、数字またはハイフンで始めることはできません。
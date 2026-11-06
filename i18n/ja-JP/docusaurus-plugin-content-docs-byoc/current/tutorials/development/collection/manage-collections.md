---
title: "コレクションの説明 | BYOC"
slug: /manage-collections
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はデータを管理するためのコレクションを提供しており、データをエンティティとしてコレクションに挿入します。コレクションとエンティティは、リレーショナルデータベースのテーブルとレコードに似ています。このページでは、コレクションと関連する概念について説明します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-manage-collections
sidebar_label: "概要"
sidebar_position: 1
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/collections/manage-collections.md"

---

# コレクションの説明

Zilliz Cloud では、データを管理するために複数のコレクションを作成し、データをエンティティとしてコレクションに挿入できます。コレクションとエンティティは、リレーショナルデータベースのテーブルとレコードに似ています。このページでは、コレクションと関連する概念について説明します。

## コレクション\{#collection}

コレクションは、固定された列と可変の行を持つ 2 次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。 

次の図は、8 つの列と 6 つのエンティティを持つコレクションを示しています。

![コレクションの説明](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/68969b40586e37dca783609c32910aec85272b0c57d88a8d1c2b148853dc90a8.png)

## スキーマとフィールド\{#schema-and-fields}

オブジェクトを説明する際は、通常、サイズ、重量、位置などの属性に言及します。これらの属性をコレクションのフィールドとして使用できます。各フィールドには、データ型やベクトルフィールドの次元数など、さまざまな制約プロパティがあります。フィールドを作成してその順序を定義することで、コレクションスキーマを形成できます。適用可能なデータ型については、[スキーマの概要](./schema-explained) を参照してください。

挿入するエンティティには、スキーマで定義されたすべてのフィールドを含める必要があります。その一部を任意にするには、動的フィールドを有効にすることを検討してください。詳細については、[動的フィールド](./enable-dynamic-field) を参照してください。

- **nullable にする、またはデフォルト値を設定する**

    field を nullable にする方法、またはデフォルト値を設定する方法の詳細については、[Nullable & Default](./nullable-fields) を参照してください。

- **dynamic field を有効にする**

    dynamic field を有効化して使用する方法の詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。

## Primary key and AutoId\{#primary-key-and-autoid}

リレーショナルデータベースのプライマリフィールドと同様に、コレクションにはエンティティを他のエンティティと区別するためのプライマリフィールドがあります。プライマリフィールドの各値はグローバルに一意であり、特定の 1 つのエンティティに対応します。 

上の図に示すように、**id** という名前の field が primary field として機能し、最初の ID **0** は *The Mortality Rate of Coronavirus is Not Important* というタイトルの entity に対応しています。primary field が 0 の他の entity は存在しません。 

プライマリフィールドは整数または文字列のみを受け付けます。エンティティを挿入する際は、デフォルトでプライマリフィールドの値を含める必要があります。ただし、コレクション作成時に **AutoId** を有効にしている場合、Zilliz Cloud はデータ挿入時にそれらの値を生成します。その場合は、挿入するエンティティからプライマリフィールドの値を除外してください。

詳細については、[Primary Field & AutoId](./primary-field-auto-id) を参照してください。

## インデックス\{#index}


特定のフィールドにインデックスを作成すると、検索効率が向上します。サービスが依存するすべてのフィールドにインデックスを作成することを推奨します。その中でも、ベクトルフィールドのインデックスは必須です。

Zilliz Cloud では、コレクション内のベクトルフィールドに適用できるインデックスタイプは `AUTOINDEX` のみです。詳細については、[AUTOINDEX の解説](./autoindex-explained) を参照してください。

## Entity\{#entity}

エンティティは、コレクション内で同じフィールドセットを共有するデータレコードです。同じ行のすべてのフィールドの値が 1 つのエンティティを構成します。

必要な数だけエンティティをコレクションに挿入できます。ただし、エンティティの数が増えるにつれて、使用するメモリサイズも増加し、検索パフォーマンスに影響します。

詳細については、[スキーマの概要](./schema-explained) を参照してください。

## Load and Release\{#load-and-release}

コレクションをロードすることは、コレクション内で類似検索およびクエリを実行するための前提条件です。コレクションをロードすると、Zilliz Cloud はすべてのインデックスファイルと各フィールドの生データをメモリにロードし、検索やクエリに迅速に応答できるようにします。

検索とクエリはメモリを大量に消費する操作です。コストを節約するには、現在使用していないコレクションをリリースすることを推奨します。

詳細については、[ロードとリリース](https://milvus.io/docs/load-and-release.md) を参照してください。

## Search and Query\{#search-and-query}

インデックスを作成してコレクションをロードしたら、1 つまたは複数のクエリベクトルを入力して類似検索を開始できます。たとえば、検索リクエストで渡されたクエリのベクトル表現を受け取ると、Zilliz Cloud は指定されたメトリックタイプを使用して、クエリベクトルとターゲットコレクション内のベクトルとの類似度を測定してから、クエリと意味的に類似するものを返します。

また、結果の関連性を高めるために、検索やクエリにメタデータフィルタリングを含めることもできます。なお、メタデータフィルタリング条件はクエリでは必須ですが、検索ではオプションです。

適用可能な metric type の詳細については、[Metric Types](./search-metrics-explained) を参照してください。

検索とクエリの詳細については、Search & Rerank 章の記事を参照してください。その中でも、基本機能は次のとおりです：

- [Basic ANN Search](./single-vector-search)

- [Filtered Search](./filtered-search)

- [Range Search](./range-search)

- [Grouping Search](./grouping-search)

- [Hybrid Search](./hybrid-search)

- [Search Iterator](./with-iterators)

- [Query](./get-and-scalar-query)

- [Full Text Search](./full-text-search)

- [テキストマッチ](https://milvus.io/docs/keyword-match.md)

さらに、Zilliz Cloud は検索パフォーマンスと効率を改善するための拡張機能も提供しています。これらはデフォルトで無効になっており、サービス要件に応じて有効化して使用できます。以下のとおりです。

- [Use Partition Key](./use-partition-key)

- [Use mmap](./use-mmap)

- [クラスタリング Compaction](https://milvus.io/docs/clustering-compaction.md)

## Partition\{#partition}

パーティションはコレクションのサブセットであり、親コレクションと同じフィールドセットを共有し、それぞれがエンティティのサブセットを含みます。

entity を異なる partition に割り当てることで、entity グループを作成できます。特定の partition に対して検索やクエリを実行することで、Zilliz Cloud に他の partition 内の entity を無視させ、検索効率を向上できます。

詳細については、[Manage Partitions](./manage-partitions) を参照してください。

## Shard\{#shard}

シャードはコレクションの水平方向のスライスです。各シャードはデータ入力チャネルに対応します。すべてのコレクションにはデフォルトで 1 つのシャードがあります。コレクションを作成する際に、想定されるスループットとコレクションに挿入するデータ量に基づいて、適切なシャード数を設定できます。

シャード数の設定方法の詳細については、[コレクションを作成する](./manage-collections-sdks) を参照してください。

## Alias\{#alias}

コレクションのエイリアスを作成できます。1 つのコレクションは複数のエイリアスを持つことができますが、複数のコレクションが 1 つのエイリアスを共有することはできません。コレクションに対するリクエストを受信すると、Zilliz Cloud は指定された名前に基づいてコレクションを特定します。指定された名前のコレクションが存在しない場合、Zilliz Cloud は指定された名前をエイリアスとして引き続き特定します。コレクションのエイリアスを使用して、コードをさまざまなシナリオに適応させることができます。

詳細については、[Manage Aliases](./manage-aliases) を参照してください。

## Function\{#function}

コレクションの作成時にフィールドを導出するよう、Zilliz Cloud に関数を設定できます。たとえば、全文検索関数はユーザー定義関数を使用して、特定の varchar フィールドからスパースベクトルフィールドを導出します。全文検索の詳細については、[全文検索](./full-text-search) を参照してください。

## Consistency Level\{#consistency-level}

分散データベースシステムでは通常、データノード間およびレプリカ間のデータの同一性を定義するために整合性レベルを使用します。コレクションを作成するとき、またはコレクション内で類似検索を実行するときに、個別の整合性レベルを設定できます。適用可能な整合性レベルは、**Strong**、**Bounded Staleness**、**Session**、**Eventually** です。


これらの consistency level の詳細については、[Consistency Level](./consistency-level) を参照してください。

## Limits\{#limits}

コレクションに関する制限事項については、[Zilliz Cloud の制限](./limits) を参照してください。

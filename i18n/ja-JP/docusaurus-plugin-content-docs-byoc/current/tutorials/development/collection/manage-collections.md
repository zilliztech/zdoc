---
title: "Collection の解説 | BYOC"
slug: /manage-collections
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、データを管理するために複数の collection を作成し、データを entity として collection に挿入できます。Collection と entity は、リレーショナルデータベースのテーブルとレコードに似ています。このページでは、collection と関連する概念について学べます。 | BYOC"
type: origin
token: Z9AMwNkVLiog0jkXxNscuMpJnjL
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Collection の解説

Zilliz Cloud では、データを管理するために複数の collection を作成し、データを entity として collection に挿入できます。Collection と entity は、リレーショナルデータベースのテーブルとレコードに似ています。このページでは、collection と関連する概念について学べます。

## Collection\{#collection}

collection は、固定された列と可変の行を持つ二次元テーブルです。各列は field を表し、各行は entity を表します。 

次の図は、8 つの列と 6 つの entity を持つ collection を示しています。

![BitLbgzN4oYspwxM4vQcAmg2n9f](https://zdoc-images.s3.us-west-2.amazonaws.com/bitlbgzn4oyspwxm4vqcamg2n9f.png "BitLbgzN4oYspwxM4vQcAmg2n9f")

## Schema and Fields\{#schema-and-fields}

オブジェクトを説明する際には、通常、そのサイズ、重さ、位置などの属性に言及します。これらの属性を collection の field として使用できます。各 field には、データ型や vector field の次元数など、さまざまな制約プロパティがあります。field を作成してその順序を定義することで、collection schema を形成できます。適用可能なデータ型については、[Schema Explained](./schema-explained) を参照してください。

挿入する entity には、schema で定義されたすべての field を含める必要があります。それらの一部をオプションにするには、次の方法を検討してください。

- **nullable にする、またはデフォルト値を設定する**

    field を nullable にする方法、またはデフォルト値を設定する方法の詳細については、[Nullable & Default](./nullable-fields) を参照してください。

- **dynamic field を有効にする**

    dynamic field を有効化して使用する方法の詳細については、[Dynamic Field](./enable-dynamic-field) を参照してください。

## Primary key and AutoId\{#primary-key-and-autoid}

リレーショナルデータベースの primary field と同様に、collection には entity を他と区別するための primary field があります。primary field の各値はグローバルに一意であり、1 つの特定の entity に対応します。 

上の図に示すように、**id** という名前の field が primary field として機能し、最初の ID **0** は *The Mortality Rate of Coronavirus is Not Important* というタイトルの entity に対応しています。primary field が 0 の他の entity は存在しません。 

primary field は整数または文字列のみを受け付けます。entity を挿入する際、通常は primary field の値を含める必要があります。ただし、collection 作成時に **AutoId** を有効にしている場合、Zilliz Cloud がデータ挿入時にそれらの値を生成します。その場合、挿入する entity から primary field の値を除外してください。

詳細については、[Primary Field & AutoId](./primary-field-auto-id) を参照してください。

## Index\{#index}

特定の field に index を作成すると、検索効率が向上します。サービスが依存するすべての field に index を作成することを推奨します。その中でも、vector field に対する index は必須です。

Milvus とは異なり、Zilliz Cloud 上の collection の vector field に適用できる index type は AUTOINDEX のみです。詳細については、[AUTOINDEX Explained](./autoindex-explained) を参照してください。

## Entity\{#entity}

entity は、collection 内で同じ field セットを共有するデータレコードです。同じ行にあるすべての field の値で 1 つの entity が構成されます。

必要なだけ多くの entity を collection に挿入できます。ただし、entity の数が増えるにつれて必要なメモリサイズも増加し、検索パフォーマンスに影響します。

詳細については、[Schema Explained](./schema-explained) を参照してください。

## Load and Release\{#load-and-release}

collection のロードは、collection 内で類似検索やクエリを実行するための前提条件です。collection をロードすると、Zilliz Cloud は検索とクエリに高速に応答するために、すべての index ファイルと各 field の生データをメモリにロードします。

検索とクエリはメモリ集約型の操作です。コストを節約するため、現在使用していない collection は release することを推奨します。

詳細については、[Load & Release](./load-release-collections) を参照してください。

## Search and Query\{#search-and-query}

index を作成して collection をロードすると、1 つまたは複数の query vector を入力して類似検索を開始できます。たとえば、検索リクエストに含まれるクエリの vector 表現を受け取ると、Zilliz Cloud は指定された metric type を使用して query vector と対象 collection 内の vector との類似度を測定し、その後、クエリと意味的に類似したものを返します。

また、結果の関連性を高めるために、検索やクエリにメタデータフィルタリングを含めることもできます。なお、メタデータフィルタリング条件はクエリでは必須ですが、検索ではオプションです。

適用可能な metric type の詳細については、[Metric Types](./search-metrics-explained) を参照してください。

検索とクエリの詳細については、[Search](./zilliz-search-prompts) 章の記事を参照してください。基本機能には次のものがあります。

- [Basic ANN Search](./single-vector-search)

- [Filtered Search](./filtered-search)

- [Range Search](./range-search)

- [Grouping Search](./grouping-search)

- [Hybrid Search](./hybrid-search)

- [Search Iterator](./with-iterators)

- [Query](./get-and-scalar-query)

- [Full Text Search](./full-text-search)

- [Text Match](./text-match)

さらに、Zilliz Cloud は検索パフォーマンスと効率を改善するための拡張機能も提供しています。これらはデフォルトで無効になっており、サービス要件に応じて有効化して使用できます。以下のとおりです。

- [Use Partition Key](./use-partition-key)

- [Use mmap](./use-mmap)

## Partition\{#partition}

partition は collection のサブセットであり、親 collection と同じ field セットを共有し、それぞれが entity のサブセットを含みます。

entity を異なる partition に割り当てることで、entity グループを作成できます。特定の partition に対して検索やクエリを実行することで、Zilliz Cloud に他の partition 内の entity を無視させ、検索効率を向上できます。

詳細については、[Manage Partitions](./manage-partitions) を参照してください。

## Shard\{#shard}

shard は collection の水平方向のスライスです。各 shard は 1 つのデータ入力チャネルに対応します。すべての collection はデフォルトで 1 つの shard を持ちます。collection に挿入するデータの想定スループットとボリュームに基づいて、collection 作成時に適切な shard 数を設定できます。

shard 数の設定方法の詳細については、[Create a Collection](./manage-collections-sdks#set-shard-number) を参照してください。

## Alias\{#alias}

collection に対して alias を作成できます。1 つの collection は複数の alias を持つことができますが、collection 間で alias を共有することはできません。collection に対するリクエストを受信すると、Zilliz Cloud は指定された名前に基づいて collection を特定します。指定された名前の collection が存在しない場合、Zilliz Cloud は指定された名前を alias として検索します。collection alias を使用して、さまざまなシナリオにコードを適応させることができます。

詳細については、[Manage Aliases](./manage-aliases) を参照してください。

## Function\{#function}

collection 作成時に、field を導出するための function を Zilliz Cloud に設定できます。たとえば、全文検索 function は、ユーザー定義 function を使用して特定の varchar field から sparse vector field を導出します。全文検索の詳細については、[Full Text Search](./full-text-search) を参照してください。

## Consistency Level\{#consistency-level}

分散データベースシステムでは通常、consistency level を使用して、データノードやレプリカ間でのデータの同一性を定義します。collection を作成するとき、または collection 内で類似検索を実行するときに、それぞれ別の consistency level を設定できます。適用可能な consistency level は、**Strong**、**Bounded Staleness**、**Session**、および **Eventually** です。

 これらの consistency level の詳細については、[Consistency Level](./consistency-level) を参照してください。

## Limits\{#limits}

collection に関する制限事項については、[Zilliz Cloud Limits](./limits) を参照してください。


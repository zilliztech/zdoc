---
title: "Collection の説明 | Cloud"
slug: /manage-collections
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、データを管理するために複数の collection を作成し、データを entity として collection に挿入できます。collection と entity は、リレーショナルデータベースにおけるテーブルとレコードに似ています。このページでは、collection と関連概念について学ぶことができます。 | Cloud"
type: origin
token: Z9AMwNkVLiog0jkXxNscuMpJnjL
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Collection の説明

Zilliz Cloud では、データを管理するために複数の collection を作成し、データを entity として collection に挿入できます。collection と entity は、リレーショナルデータベースにおけるテーブルとレコードに似ています。このページでは、collection と関連概念について学ぶことができます。

## Collection\{#collection}

collection は、固定された列と可変の行を持つ 2 次元テーブルです。各列は field を表し、各行は entity を表します。 

次の図は、8 つの列と 6 つの entity を持つ collection を示しています。

![BitLbgzN4oYspwxM4vQcAmg2n9f](https://zdoc-images.s3.us-west-2.amazonaws.com/bitlbgzn4oyspwxm4vqcamg2n9f.png "BitLbgzN4oYspwxM4vQcAmg2n9f")

## Schema と Fields\{#schema-and-fields}

オブジェクトを説明する際、通常はサイズ、重量、位置などの属性に言及します。これらの属性を collection の field として使用できます。各 field には、データ型や vector field の次元数など、さまざまな制約プロパティがあります。field を作成し、その順序を定義することで、collection schema を形成できます。適用可能なデータ型については、[Schema の説明](./schema-explained)を参照してください。

挿入する entity には、schema で定義されたすべての field を含める必要があります。その一部を任意にするには、次のオプションを検討してください。

- **nullable にする、またはデフォルト値を設定する**

    field を nullable にする方法、またはデフォルト値を設定する方法の詳細については、[Nullable & Default](./nullable-fields)を参照してください。

- **dynamic field を有効にする**

    dynamic field を有効にして使用する方法の詳細については、[Dynamic Field](./enable-dynamic-field)を参照してください。

## Primary key と AutoId\{#primary-key-and-autoid}

リレーショナルデータベースの primary field と同様に、collection には entity を他と区別するための primary field があります。primary field の各値はグローバルに一意であり、特定の 1 つの entity に対応します。 

上の図に示すように、**id** という名前の field が primary field として機能し、最初の ID **0** は *The Mortality Rate of Coronavirus is Not Important* というタイトルの entity に対応します。primary field が 0 である他の entity は存在しません。 

primary field は整数または文字列のみを受け付けます。entity を挿入する際は、デフォルトで primary field の値を含める必要があります。ただし、collection 作成時に **AutoId** を有効にしている場合、Zilliz Cloud はデータ挿入時にそれらの値を生成します。その場合、挿入する entity から primary field の値を除外してください。

詳細については、[Primary Field & AutoId](./primary-field-auto-id)を参照してください。

## Index\{#index}

特定の field に index を作成すると、検索効率が向上します。サービスが依存するすべての field に index を作成することを推奨します。その中でも vector field の index は必須です。

Milvus とは異なり、Zilliz Cloud の collection における vector field に適用可能な index タイプは AUTOINDEX のみです。詳細については、[AUTOINDEX の説明](./autoindex-explained)を参照してください。

## Entity\{#entity}

entity は、collection 内で同じ field セットを共有するデータレコードです。同じ行のすべての field の値が 1 つの entity を構成します。

必要な数だけ entity を collection に挿入できます。ただし、entity の数が増えるにつれて、使用するメモリサイズも増加し、検索パフォーマンスに影響します。

詳細については、[Schema の説明](./schema-explained)を参照してください。

## Load と Release\{#load-and-release}

collection を load することは、collection 内で類似性検索やクエリを実行するための前提条件です。collection を load すると、Zilliz Cloud は検索やクエリに高速に応答するため、すべての index ファイルと各 field の raw data をメモリに読み込みます。

検索とクエリはメモリを大量に消費する操作です。コストを削減するため、現在使用していない collection は release することを推奨します。

詳細については、[Load & Release](./load-release-collections)を参照してください。

## Search と Query\{#search-and-query}

index を作成して collection を load すると、1 つまたは複数の query vector を入力することで類似性検索を開始できます。たとえば、検索リクエストで渡されたクエリの vector 表現を受け取ると、Zilliz Cloud は指定された metric type を使用して query vector とターゲット collection 内の vector との類似度を測定し、その後クエリと意味的に類似したものを返します。

検索やクエリには、結果の関連性を高めるために metadata filtering を含めることもできます。なお、metadata filtering 条件はクエリでは必須ですが、検索では任意です。

適用可能な metric type の詳細については、[Metric Types](./search-metrics-explained)を参照してください。

検索とクエリの詳細については、[Search](./zilliz-search-prompts)章の記事を参照してください。その中の基本機能は次のとおりです。

- [Basic ANN Search](./single-vector-search)

- [Filtered Search](./filtered-search)

- [Range Search](./range-search)

- [Grouping Search](./grouping-search)

- [Hybrid Search](./hybrid-search)

- [Search Iterator](./with-iterators)

- [Query](./get-and-scalar-query)

- [Full Text Search](./full-text-search)

- [Text Match](./text-match)

さらに、Zilliz Cloud は検索パフォーマンスと効率を向上させるための拡張機能も提供しています。これらはデフォルトで無効になっており、サービス要件に応じて有効化して使用できます。それらは次のとおりです。

- [Use Partition Key](./use-partition-key)

- [Use mmap](./use-mmap)

## Partition\{#partition}

partition は collection のサブセットであり、親 collection と同じ field セットを共有し、それぞれが entity のサブセットを含みます。

entity を異なる partition に割り当てることで、entity グループを作成できます。特定の partition で検索やクエリを実行すると、Zilliz Cloud は他の partition 内の entity を無視し、検索効率を向上させます。

詳細については、[Partition の管理](./manage-partitions)を参照してください。

## Shard\{#shard}

shard は collection の水平方向のスライスです。各 shard はデータ入力チャネルに対応します。すべての collection にはデフォルトで shard が 1 つあります。collection を作成する際に、想定されるスループットと collection に挿入するデータ量に基づいて、適切な shard 数を設定できます。

shard 数の設定方法の詳細については、[Collection の作成](./manage-collections-sdks#set-shard-number)を参照してください。

## Alias\{#alias}

collection に alias を作成できます。1 つの collection は複数の alias を持つことができますが、複数の collection が 1 つの alias を共有することはできません。collection に対するリクエストを受信すると、Zilliz Cloud は提供された名前に基づいて collection を特定します。提供された名前の collection が存在しない場合、Zilliz Cloud はその提供された名前を alias として引き続き特定します。collection alias を使用すると、コードをさまざまなシナリオに適応させることができます。

詳細については、[Alias の管理](./manage-aliases)を参照してください。

## Function\{#function}

collection 作成時に field を導出するための function を Zilliz Cloud に設定できます。たとえば、full-text search function はユーザー定義 function を使用して、特定の varchar field から sparse vector field を導出します。full-text search の詳細については、[Full Text Search](./full-text-search)を参照してください。

## Consistency Level\{#consistency-level}

分散データベースシステムでは通常、データノードとレプリカ間のデータの同一性を定義するために consistency level を使用します。collection を作成するとき、または collection 内で類似性検索を実行するときに、個別の consistency level を設定できます。適用可能な consistency level は、**Strong**、**Bounded Staleness**、**Session**、**Eventually** です。

 これらの consistency level の詳細については、[Consistency Level](./consistency-level)を参照してください。

## Limits\{#limits}

collection に関する制限事項については、[Zilliz Cloud Limits](./limits)を参照してください。


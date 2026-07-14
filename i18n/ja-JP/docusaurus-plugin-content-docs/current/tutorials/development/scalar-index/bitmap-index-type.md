---
title: "BITMAP | Cloud"
slug: /bitmap-index-type
sidebar_label: "BITMAP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Bitmap indexing は、低カーディナリティの scalar field におけるクエリ性能を向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。 | Cloud"
type: origin
token: SkJtwgkCDiGYeOkakIgcLT46nee
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# BITMAP

Bitmap indexing は、低カーディナリティの scalar field におけるクエリ性能を向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。

このインデックスタイプは、フィールド値をコンパクトなバイナリ形式で表現し、それらに対して効率的なビット演算を実行することで、scalar クエリの取得時間を短縮するのに役立ちます。ほかの種類の index と比較すると、bitmap index は通常、低カーディナリティのフィールドを扱う際に、より高い空間効率と高速なクエリ速度を実現します。

## Overview\{#overview}

**Bitmap** という用語は、**Bit** と **Map** という 2 つの単語を組み合わせたものです。bit はコンピュータにおける最小のデータ単位であり、保持できる値は **0** または **1** のみです。ここでの map は、0 と 1 にどの値を割り当てるかに基づいてデータを変換し、整理するプロセスを指します。

bitmap index は、bitmap と key という 2 つの主要コンポーネントで構成されます。key は、インデックス化されたフィールド内の一意の値を表します。各一意の値に対して、対応する bitmap が存在します。これらの bitmap の長さは、collection 内のレコード数と同じです。bitmap 内の各 bit は、collection 内の 1 つのレコードに対応します。あるレコードにおけるインデックス対象フィールドの値が key と一致する場合、対応する bit は **1** に設定され、一致しない場合は **0** に設定されます。

**Category** フィールドと **Public** フィールドを持つドキュメントの collection を考えてみましょう。ここで、**Tech** カテゴリに属し、かつ **Public** に公開されているドキュメントを取得したいとします。この場合、bitmap index の key は **Tech** と **Public** です。

![S5cHwsXsPhOLfQb3Tatc4jqAn9e](https://zdoc-images.s3.us-west-2.amazonaws.com/S5cHwsXsPhOLfQb3Tatc4jqAn9e.png)

図に示すように、**Category** と **Public** の bitmap index は次のとおりです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントのみが **Tech** カテゴリに属することを示します。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントのみが **Public** に公開されていることを示します。

両方の条件に一致するドキュメントを見つけるには、これら 2 つの bitmap に対してビット単位の AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

結果の bitmap [1, 0, 0, 0, 0] は、最初のドキュメント（**ID** **1**）のみが両方の条件を満たすことを示しています。bitmap index と効率的なビット演算を使用することで、データセット全体をスキャンする必要なく、検索範囲をすばやく絞り込むことができます。

## Create a bitmap index\{#create-a-bitmap-index}

Zilliz Cloud で bitmap index を作成するには、`create_index()` メソッドを使用し、`index_type` パラメータを `"BITMAP"` に設定します。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

index_params = client.create_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters
index_params.add_index(
    field_name="category", # Name of the scalar field to be indexed
    index_type="BITMAP", # Type of index to be created
    index_name="category_bitmap_index" # Name of the index to be created
)

client.create_index(
    collection_name="my_collection", # Specify the collection name
    index_params=index_params
)
```

この例では、`my_collection` collection の `category` フィールドに bitmap index を作成しています。`add_index()` メソッドは、フィールド名、index タイプ、および index 名を指定するために使用されます。

bitmap index が作成されると、クエリ操作で `filter` パラメータを使用して、インデックス化されたフィールドに基づく scalar フィルタリングを実行できます。これにより、bitmap index を使用して検索結果を効率的に絞り込むことができます。詳細については、[Filtering Explained](./filtering-overview) を参照してください。

## Drop an index\{#drop-an-index}

既存の index を collection から削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のある cluster では、不要になった scalar index を直接削除できます。collection を先に release する必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_bitmap_index" # Name of the index to drop
)
```

## Limits\{#limits}

- Bitmap index は、primary key ではない scalar field でのみサポートされます。

- フィールドのデータ型は、次のいずれかである必要があります。

    - `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`

    - `ARRAY`（要素は次のいずれかである必要があります: `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`）

- Bitmap index は、次のデータ型をサポートしていません。

    - `FLOAT`, `DOUBLE`: 浮動小数点型は、bitmap index のバイナリ特性と互換性がありません。

    - `JSON`: `JSON` データ型は複雑な構造を持つため、bitmap index では効率的に表現できません。

- Bitmap index は、高カーディナリティのフィールド（つまり、異なる値の数が多いフィールド）には適していません。

    - 一般的なガイドラインとして、bitmap index はフィールドのカーディナリティが 500 未満の場合に最も効果的です。

    - カーディナリティがこのしきい値を超えて増加すると、bitmap index の性能上の利点は薄れ、ストレージのオーバーヘッドが大きくなります。

    - 高カーディナリティのフィールドについては、特定のユースケースやクエリ要件に応じて、inverted index などの代替インデックス手法の使用を検討してください。


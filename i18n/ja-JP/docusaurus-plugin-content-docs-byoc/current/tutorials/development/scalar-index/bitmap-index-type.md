---
title: "BITMAP | BYOC"
slug: /bitmap-index-type
sidebar_label: "BITMAP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Bitmap インデックスは、低カーディナリティのスカラーフィールドにおけるクエリ性能を向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。 | BYOC"
type: origin
token: SkJtwgkCDiGYeOkakIgcLT46nee
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# BITMAP

Bitmap インデックスは、低カーディナリティのスカラーフィールドにおけるクエリ性能を向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。

このインデックスタイプは、フィールド値をコンパクトなバイナリ形式で表現し、それらに対して効率的なビット演算を実行することで、スカラークエリの取得時間を短縮するのに役立ちます。他の種類のインデックスと比較すると、bitmap インデックスは通常、低カーディナリティのフィールドを扱う際に、より高い空間効率と高速なクエリ速度を実現します。

## Overview\{#overview}

**Bitmap** という用語は、**Bit** と **Map** の 2 つの単語を組み合わせたものです。bit はコンピュータにおける最小のデータ単位であり、**0** または **1** のいずれかの値しか保持できません。ここでの map は、0 と 1 にどの値を割り当てるかに従ってデータを変換し、整理する処理を指します。

Bitmap インデックスは、bitmap とキーという 2 つの主要コンポーネントで構成されています。キーは、インデックス対象フィールド内の一意の値を表します。一意の値ごとに、対応する bitmap が存在します。これらの bitmap の長さは、コレクション内のレコード数と同じです。bitmap 内の各ビットは、コレクション内の 1 つのレコードに対応します。レコード内のインデックス対象フィールドの値がキーと一致する場合、対応するビットは **1** に設定され、一致しない場合は **0** に設定されます。

**Category** と **Public** というフィールドを持つドキュメントのコレクションを考えます。**Tech** カテゴリに属し、**Public** に公開されているドキュメントを取得したいとします。この場合、bitmap インデックスのキーは **Tech** と **Public** です。

![S5cHwsXsPhOLfQb3Tatc4jqAn9e](https://zdoc-images.s3.us-west-2.amazonaws.com/S5cHwsXsPhOLfQb3Tatc4jqAn9e.png)

図に示すように、**Category** と **Public** の bitmap インデックスは次のとおりです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントだけが **Tech** カテゴリに属していることを示します。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントだけが **Public** に公開されていることを示します。

両方の条件に一致するドキュメントを見つけるには、これら 2 つの bitmap に対してビット単位の AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

結果の bitmap [1, 0, 0, 0, 0] は、最初のドキュメント（**ID** **1**）だけが両方の条件を満たすことを示しています。bitmap インデックスと効率的なビット演算を使用することで、データセット全体をスキャンする必要なく、検索範囲をすばやく絞り込むことができます。

## Bitmap インデックスを作成する\{#create-a-bitmap-index}

Zilliz Cloud で bitmap インデックスを作成するには、`create_index()` メソッドを使用し、`index_type` パラメータを `"BITMAP"` に設定します。

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

この例では、`my_collection` コレクションの `category` フィールドに bitmap インデックスを作成します。`add_index()` メソッドは、フィールド名、インデックスタイプ、およびインデックス名を指定するために使用されます。

bitmap インデックスを作成したら、クエリ操作で `filter` パラメータを使用して、インデックス対象フィールドに基づくスカラーフィルタリングを実行できます。これにより、bitmap インデックスを使用して検索結果を効率的に絞り込むことができます。詳細は、[フィルタリングの解説](./filtering-overview) を参照してください。

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。事前にコレクションをリリースする必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_bitmap_index" # Name of the index to drop
)
```

## Limits\{#limits}

- Bitmap インデックスは、主キーではないスカラーフィールドでのみサポートされています。

- フィールドのデータ型は、次のいずれかである必要があります。

    - `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`

    - `ARRAY`（要素は次のいずれかである必要があります: `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`）

- Bitmap インデックスは、次のデータ型をサポートしていません。

    - `FLOAT`, `DOUBLE`: 浮動小数点型は、bitmap インデックスのバイナリ特性と互換性がありません。

    - `JSON`: JSON データ型は構造が複雑であるため、bitmap インデックスを使用して効率的に表現できません。

- Bitmap インデックスは、高カーディナリティのフィールド（つまり、異なる値の数が多いフィールド）には適していません。

    - 一般的な目安として、bitmap インデックスが最も効果的なのは、フィールドのカーディナリティが 500 未満の場合です。

    - カーディナリティがこのしきい値を超えて増加すると、bitmap インデックスの性能上の利点は薄れ、ストレージのオーバーヘッドが大きくなります。

    - 高カーディナリティのフィールドについては、特定のユースケースやクエリ要件に応じて、inverted index などの代替インデックス手法の使用を検討してください。

---
title: "BITMAP | Cloud"
slug: /bitmap-index-type
sidebar_key: bitmap-index-type
sidebar_label: "BITMAP"
beta: FALSE
notebook: FALSE
description: "ビットマップインデックスは、カーディナリティの低いスカラーフィールドに対するクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の固有値の数を指します。固有要素が少ないフィールドは、低カーディナリティとみなされます。 | Cloud"
type: origin
token: SkJtwgkCDiGYeOkakIgcLT46nee
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - スカラーフィールド
  - bool
  - bitmap

---

import Admonition from '@theme/Admonition';


# BITMAP

ビットマップインデックスは、低カーディナリティのスカラーフィールドにおけるクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の固有値の数を指します。固有要素が少ないフィールドは、低カーディナリティとみなされます。

このインデックスタイプは、フィールド値をコンパクトなバイナリ形式で表現し、それらに対して効率的なビット演算を実行することで、スカラークエリの取得時間を短縮するのに役立ちます。他の種類のインデックスと比較して、ビットマップインデックスは通常、低カーディナリティのフィールドを扱う際に、より高い空間効率と高速なクエリ速度を実現します。

## 概要\{#overview}

**Bitmap** という用語は、**Bit** と **Map** の 2 つの単語を組み合わせたものです。ビットはコンピュータにおける最小のデータ単位であり、**0** または **1** の値のみを保持できます。ここでのマップとは、どの値を 0 および 1 に割り当てるかに従ってデータを変換・整理するプロセスを指します。

ビットマップインデックスは、ビットマップとキーという 2 つの主要コンポーネントで構成されます。キーは、インデックス対象フィールド内の固有値を表します。各固有値に対応するビットマップが 1 つ存在します。これらのビットマップの長さは、コレクション内のレコード数と等しくなります。ビットマップ内の各ビットは、コレクション内のレコードに対応します。レコード内のインデックス対象フィールドの値がキーと一致する場合、対応するビットは **1** に設定され、そうでない場合は **0** に設定されます。

**Category** フィールドと **Public** フィールドを持つドキュメントのコレクションを考えてみましょう。**Tech** カテゴリに属し、かつ **Public** に公開されているドキュメントを取得したいとします。この場合、ビットマップインデックスのキーは **Tech** と **Public** になります。

![S5cHwsXsPhOLfQb3Tatc4jqAn9e](https://zdoc-images.s3.us-west-2.amazonaws.com/S5cHwsXsPhOLfQb3Tatc4jqAn9e.png)

図に示すように、**Category** と **Public** のビットマップインデックスは以下の通りです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントのみが **Tech** カテゴリに属していることを示しています。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントのみが **Public** に公開されていることを示しています。

両方の条件に一致するドキュメントを見つけるには、これら 2 つのビットマップに対してビット AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

結果として得られるビットマップ [1, 0, 0, 0, 0] は、最初のドキュメント（**ID** **1**）のみが両方の条件を満たしていることを示しています。ビットマップインデックスと効率的なビット演算を使用することで、検索範囲を迅速に絞り込み、データセット全体をスキャンする必要をなくすことができます。

## ビットマップインデックスの作成\{#create-a-bitmap-index}

Zilliz Cloud でビットマップインデックスを作成するには、`create_index()` メソッドを使用し、`index_type` パラメータを `"BITMAP"` に設定します。

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

この例では、`my_collection` コレクションの `category` フィールドにビットマップインデックスを作成します。`add_index()` メソッドを使用して、フィールド名、インデックスタイプ、およびインデックス名を指定します。

ビットマップインデックスが作成されると、クエリ操作で `filter` パラメータを使用して、インデックス化されたフィールドに基づいたスカラーフィルタリングを実行できます。これにより、ビットマップインデックスを活用して検索結果を効率的に絞り込むことができます。詳細については、[フィルタリングの説明](./filtering-overview) を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Milvus v2.6.x</strong> と互換性のあるクラスターでは、スカラーインデックスが不要になった時点で、コレクションを最初にリリースすることなく直接削除できます。</p>

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_bitmap_index" # Name of the index to drop
)
```

## 制限\{#limits}

- ビットマップインデックスは、主キーではないスカラーフィールドのみでサポートされます。

- フィールドのデータ型は、以下のいずれかでなければなりません：

    - `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR`

    - `ARRAY`（要素は以下のいずれかでなければなりません：`BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR`）

- ビットマップインデックスは、以下のデータ型をサポートしません：

    - `FLOAT`、`DOUBLE`: 浮動小数点型は、ビットマップインデックスのバイナリ特性と互換性がありません。

    - `JSON`: JSON データ型は構造が複雑であり、ビットマップインデックスを使用して効率的に表現することはできません。

- ビットマップインデックスは、カーディナリティが高いフィールド（つまり、異なる値の数が非常に多いフィールド）には適していません。

    - 一般的なガイドラインとして、ビットマップインデックスはフィールドのカーディナリティが 500 未満の場合に最も効果的です。

    - カーディナリティがこの閾値を超えて増加すると、ビットマップインデックスのパフォーマンス上の利点は低下し、ストレージのオーバーヘッドが顕著になります。

    - 高カーディナリティのフィールドについては、特定のユースケースとクエリ要件に応じて、転置インデックスなどの代替インデックス手法の使用を検討してください。


---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
sidebar_label: "StructArray フィールドを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティが構造化された要素の順序付きリストを保持する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーのサブフィールド、ベクトルのサブフィールド、またはその両方を含めることができます。 | Cloud"
type: origin
token: RzSBwW7dUizQeekka9CcZ3Etnyg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドを作成する

1 つのエンティティが構造化された要素の順序付きリストを保持する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーのサブフィールド、ベクトルのサブフィールド、またはその両方を含めることができます。

このページでは、Struct スキーマを定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択し、データを挿入またはインデックス作成する前に適用されるスキーマルールを理解する方法について説明します。

## 事前準備\{#before-you-begin}

このページでは、`tech_articles` という名前のコレクションを使用します。各エンティティは 1 つの技術記事を表し、`chunks` フィールドにはチャンクレベルのデータが Struct 要素として保存されます。

| フィールド | 型 | 目的 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事の主キーです。 |
| `title` | `VARCHAR` | 記事のタイトルです。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリです。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルのベクトルフィールドです。後のハイブリッド検索の例で使用します。 |
| `chunks` | `ARRAY<STRUCT>` | チャンクレベルのテキスト、メタデータ、埋め込みを保存する StructArray フィールドです。 |

`chunks` StructArray フィールドには、以下のサブフィールドが含まれます。

| サブフィールド | 型 | 目的 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクのテキストです。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名です。 |
| `page` | `INT64` | チャンクのページ番号または論理的な位置です。 |
| `quality_score` | `FLOAT` | スカラーフィルタリングと範囲指定の例で使用するチャンクレベルのスコアです。 |
| `has_code` | `BOOL` | チャンクにコードが含まれているかどうかです。 |
| `emb_list_vector` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索用のベクトルサブフィールドです。 |
| `emb` | `FLOAT_VECTOR` | 通常のベクトルメトリクスを使用した要素レベル検索用のベクトルサブフィールドです。 |

<Admonition type="info" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドに設定できるインデックスは 1 つだけです。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを定義してください。この例では、`chunks[emb_list_vector]` は EmbeddingList 検索用で、`chunks[emb]` は要素レベル検索用です。

</Admonition>

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray フィールドは、Struct の各サブフィールドに対して 1 つの配列値を保存します。Struct スキーマを定義する際は、サポートされているスカラー系およびベクトル系の型からサブフィールド型を選択してください。

| Struct サブフィールドの物理型 | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポートあり | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポートあり | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポートあり | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポートあり | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポートあり | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポートあり | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポートあり | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポートあり | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポートあり | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポートなし | スパースベクトルのサブフィールドは、StructArray フィールドではサポートされていません。 |
| `Array<String>` | サポートなし | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | サポートなし | JSON サブフィールドは、StructArray フィールドではサポートされていません。 |
| `Array<Geometry>` | サポートなし | Geometry サブフィールドおよび GIS 関数は、StructArray フィールドではサポートされていません。 |
| `Array<Text>` | サポートなし | Text サブフィールドは、StructArray フィールドではサポートされていません。 |
| `Array<Timestamptz>` | サポートなし | Timestamptz サブフィールドおよび時刻固有の式は、StructArray フィールドではサポートされていません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | サポートなし | StructArray フィールドには、ネストされた配列、ネストされたベクトル配列、ネストされた Struct フィールド、ネストされた Array-of-Struct フィールドを含めることはできません。 |

バージョン固有のサポート状況、nullable の動作、その他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## StructArray フィールドを持つコレクションを作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素で使用する Struct スキーマを定義します。次に、Array フィールドを追加し、その要素型を Struct に設定します。

1. コレクションスキーマを作成します。

1. 主キーや記事レベルのフィールドなど、コレクションレベルのフィールドを追加します。

1. StructArray フィールド内に保存する要素の Struct スキーマを作成します。

1. Struct スキーマにスカラーおよびベクトルのサブフィールドを追加します。

1. `element_type=DataType.STRUCT` を指定した Array フィールドを追加します。

1. `struct_schema` に Struct スキーマを設定します。

1. `max_capacity` を設定して、各エンティティがこのフィールドに保存できる Struct 要素数を制限します。

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

schema = client.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# Collection-level fields.
schema.add_field(
    field_name="doc_id",
    datatype=DataType.INT64,
    is_primary=True,
)
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
)
schema.add_field(
    field_name="category",
    datatype=DataType.VARCHAR,
    max_length=128,
)
schema.add_field(
    field_name="title_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Struct schema used by each element in the StructArray field.
chunk_schema = client.create_struct_field_schema()
chunk_schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=65535,
)
chunk_schema.add_field(
    field_name="section",
    datatype=DataType.VARCHAR,
    max_length=128,
)
chunk_schema.add_field(
    field_name="page",
    datatype=DataType.INT64,
)
chunk_schema.add_field(
    field_name="quality_score",
    datatype=DataType.FLOAT,
)
chunk_schema.add_field(
    field_name="has_code",
    datatype=DataType.BOOL,
)

# Vector subfield for EmbeddingList search.
chunk_schema.add_field(
    field_name="emb_list_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Vector subfield for element-level search.
chunk_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

# Add the StructArray field.
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
)

client.create_collection(
    collection_name="tech_articles",
    schema=schema,
)
```

## StructArray フィールドのパスを理解する\{#understand-structarray-field-paths}

StructArray フィールドを作成した後は、`structArray[subfield]` パス構文を使用してそのサブフィールドを参照します。この構文は、インデックスの作成、ベクトルサブフィールドの検索、サブフィールドの出力、スカラーフィルターの構築を行う場合に使用します。

| パス | 意味 | 一般的な用途 |
| --- | --- | --- |
| `chunks[text]` | 各 Struct 要素内の `text` サブフィールドです。 | 出力フィールドまたはスカラーフィルタリング。 |
| `chunks[section]` | 各チャンクのセクションラベルです。 | スカラーフィルタリング。 |
| `chunks[quality_score]` | チャンクレベルの品質スコアです。 | スカラーフィルタリングまたはスカラーインデックス。 |
| `chunks[emb_list_vector]` | embedding list として使用するベクトルサブフィールドです。 | `MAX_SIM*` を使用した EmbeddingList 検索。 |
| `chunks[emb]` | 各 Struct 要素が個別に使用するベクトルサブフィールドです。 | 要素レベルのベクトル検索。 |

## StructArray フィールドを nullable にする\{#make-a-structarray-field-nullable}

Milvus v3.0.x と互換性のあるクラスターでは、nullable な StructArray フィールドをサポートしています。nullable な StructArray フィールドでは、エンティティは StructArray フィールド全体に `null` を保存できます。

```python
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

<Admonition type="warning" title="Warning">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のあるクラスターでのみ利用できます。nullable な StructArray フィールドでは、エンティティは有効な StructArray 値を指定するか、フィールド全体を `null` に設定できます。有効な StructArray 値を挿入する場合は、すべてのサブフィールドが null であるか、有効な値を持っている必要があります。一部のサブフィールドを null に設定し、他のサブフィールドを有効な値に設定したエンティティを挿入すると、エラーになります。詳細については、[StructArray の制限](./struct-array-limits) を参照してください。

</Admonition>

## 既存のコレクションに StructArray フィールドを追加する\{#add-a-structarray-field-to-an-existing-collection}

Milvus v3.0.x と互換性のあるクラスターでは、既存のコレクションに StructArray フィールドを追加できます。追加する StructArray フィールドは nullable である必要があります。これは、コレクションにすでに存在するエンティティに新しいフィールドの値がないためです。

既存のコレクションに StructArray フィールドを追加するには、まず Struct スキーマを定義します。次に、`add_collection_struct_field()` を呼び出し、`nullable=True` を設定します。

```python
chunk_schema = client.create_struct_field_schema()
chunk_schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=65535,
)
chunk_schema.add_field(
    field_name="section",
    datatype=DataType.VARCHAR,
    max_length=128,
)
chunk_schema.add_field(
    field_name="page",
    datatype=DataType.INT64,
)
chunk_schema.add_field(
    field_name="quality_score",
    datatype=DataType.FLOAT,
)
chunk_schema.add_field(
    field_name="has_code",
    datatype=DataType.BOOL,
)
chunk_schema.add_field(
    field_name="emb_list_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)
chunk_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

client.add_collection_struct_field(
    collection_name="tech_articles",
    field_name="chunks",
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

StructArray フィールドを追加すると、既存のエンティティでは、新しいフィールドのすべてのサブフィールドに対して `null` が返されます。

StructArray フィールドを作成した後は、その既存の StructArray フィールドに新しいサブフィールドを追加することはできません。後で要素の属性を追加する必要がある場合は、`drop_collection_field()` を呼び出して StructArray フィールドを削除し、その後、更新した Struct スキーマを使用して新しい StructArray フィールドを追加してください。

```python
client.drop_collection_field(
    collection_name="tech_articles",
    field_name="chunks",
)

client.add_collection_struct_field(
    collection_name="tech_articles",
    field_name="chunks",
    struct_schema=updated_chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

## スキーマルール\{#schema-rules}

| ルール | 説明 |
| --- | --- |
| Struct は Array の要素型として使用します。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成します。Struct をコレクションのトップレベルフィールドとして作成しないでください。 |
| すべての要素が 1 つのスキーマを共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールド用に定義された Struct スキーマに従います。 |
| `max_capacity` は必須です。 | 各エンティティが StructArray フィールドに保存できる Struct 要素数を制限します。 |
| サポートされているサブフィールド型のみを使用できます。 | StructArray でサポートされているスカラーおよびベクトルのサブフィールド型を使用してください。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct / Array サブフィールドは定義しないでください。 |
| ベクトルサブフィールドは検索前にインデックスが必要です。 | ベクトル検索を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` などのパスにインデックスを作成してください。 |
| 1 つのベクトルサブフィールドに設定できるインデックスは 1 つです。 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。 |
| 既存の StructArray サブフィールドは固定です。 | StructArray フィールドを作成した後は、同じ StructArray フィールドにさらにサブフィールドを追加できるとは考えないでください。 |
| Struct 内では関数を使用できません。 | StructArray フィールド内のフィールドまたはサブフィールドに対して関数を定義しないでください。 |
| スカラーサブフィールドはフィルターの要件に合わせる必要があります。 | 後でフィルタリング、グループ化、または出力する必要がある場合にのみ、`section`、`quality_score`、`has_code` などのフィールドを追加してください。 |

## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素型として使用するのではなく、コレクションのトップレベルフィールドとして作成してしまう。

- StructArray フィールドに `max_capacity` を設定し忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Array、ネストされた Struct、Array-of-Struct など、サポートされていないサブフィールド型を定義してしまう。

- サブフィールド型として `String` を使用してしまう。`VARCHAR` を使用し、`max_length` を設定してください。

- 1 つのベクトルサブフィールドを EmbeddingList 検索と要素レベル検索の両方に使用してしまう。

- ベクトルサブフィールドだけを追加し、フィルタリングに必要な `section`、`quality_score`、`has_code` などのスカラーサブフィールドを追加し忘れる。

- ベクトルサブフィールドを `$[...]` スカラー述語の入力として扱ってしまう。ベクトル検索にはベクトルサブフィールドを、スカラー述語にはスカラーサブフィールドを使用してください。

- フィールドの作成後に、既存の StructArray フィールドに新しいサブフィールドを追加できると想定してしまう。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` の代わりに、`chunks.emb` や `chunks.emb_list_vector` を使用してしまう。

- nullable な StructArray の動作がすべての対象バージョンで利用できると想定してしまう。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[StructArray フィールドへのデータ挿入](./insert-struct-array) を参照してください。

1. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray のベクトルサブフィールドを検索するには、[StructArray による基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. サポートされているデータ型、nullable の動作、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


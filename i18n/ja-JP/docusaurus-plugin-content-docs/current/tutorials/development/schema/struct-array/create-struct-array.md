---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
sidebar_label: "StructArray フィールドを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つの entity に構造化された要素の順序付きリストを含める必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じ schema に従い、scalar subfield、vector subfield、またはその両方を含めることができます。 | Cloud"
type: origin
token: RzSBwW7dUizQeekka9CcZ3Etnyg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドを作成する

1 つの entity に構造化された要素の順序付きリストを含める必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じ schema に従い、scalar subfield、vector subfield、またはその両方を含めることができます。

このページでは、Struct schema を定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用する subfield を選択し、データを挿入またはインデックス作成する前に適用される schema ルールを理解する方法を説明します。

## 始める前に\{#before-you-begin}

このページでは、`tech_articles` という名前の collection を使用します。各 entity は 1 つの技術記事を表し、`chunks` フィールドには chunk レベルのデータが Struct 要素として保存されます。

| フィールド | 型 | 目的 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事の主キー。 |
| `title` | `VARCHAR` | 記事タイトル。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの vector フィールド。後のハイブリッド検索の例で使用します。 |
| `chunks` | `ARRAY<STRUCT>` | chunk レベルのテキスト、メタデータ、embedding を保存する StructArray フィールド。 |

`chunks` StructArray フィールドには、次の subfield が含まれます。

| Subfield | 型 | 目的 |
| --- | --- | --- |
| `text` | `VARCHAR` | chunk テキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | chunk のページ番号または論理的位置。 |
| `quality_score` | `FLOAT` | scalar フィルタリングや範囲指定の例で使用する chunk レベルのスコア。 |
| `has_code` | `BOOL` | chunk にコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索用の vector subfield。 |
| `emb` | `FLOAT_VECTOR` | 通常の vector メトリクスを使用した要素レベル検索用の vector subfield。 |

<Admonition type="info" icon="📘" title="注記">

vector フィールドまたは vector subfield には、1 つのインデックスしか設定できません。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector subfield を定義してください。この例では、`chunks[emb_list_vector]` は EmbeddingList 検索用、`chunks[emb]` は要素レベル検索用です。

</Admonition>

## サポートされる subfield データ型\{#supported-subfield-data-types}

StructArray フィールドは、各 Struct subfield に対して 1 つの array 値を保存します。Struct schema を定義する際は、サポートされている scalar 系および vector 系の型から subfield 型を選択してください。

| Struct subfield の物理型 | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポート | subfield を `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート | subfield を `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート | subfield を `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート | subfield を `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート | subfield を `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート | subfield を `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート | subfield を `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート | subfield を `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート | subfield を `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | 非サポート | Sparse vector subfield は StructArray フィールドではサポートされません。 |
| `Array<String>` | 非サポート | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | 非サポート | JSON subfield は StructArray フィールドではサポートされません。 |
| `Array<Geometry>` | 非サポート | Geometry subfield および GIS 関数は StructArray フィールドではサポートされません。 |
| `Array<Text>` | 非サポート | Text subfield は StructArray フィールドではサポートされません。 |
| `Array<Timestamptz>` | 非サポート | Timestamptz subfield および時間固有の式は StructArray フィールドではサポートされません。 |
| ネストされた `Array`、`ArrayOfVector`、`Struct`、または `ArrayOfStruct` | 非サポート | StructArray フィールドには、ネストされた array、ネストされた vector array、ネストされた Struct フィールド、またはネストされた Array-of-Struct フィールドを含めることはできません。 |

バージョン固有のサポート、nullable の挙動、およびその他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## StructArray フィールドを持つ collection を作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素で使用する Struct schema を定義します。次に、Array フィールドを追加し、その要素型を Struct に設定します。

1. collection schema を作成します。

1. 主キーや記事レベルのフィールドなど、collection レベルのフィールドを追加します。

1. StructArray フィールド内に保存される要素用の Struct schema を作成します。

1. Struct schema に scalar subfield と vector subfield を追加します。

1. `element_type=DataType.STRUCT` を指定した Array フィールドを追加します。

1. `struct_schema` を Struct schema に設定します。

1. `max_capacity` を設定して、各 entity がそのフィールドに保存できる Struct 要素数を制限します。

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

StructArray フィールドを作成した後は、`structArray[subfield]` のパス構文を使用してその subfield を参照します。この構文は、インデックスの作成、vector subfield の検索、subfield の出力、scalar フィルタの作成時に使用します。

| パス | 意味 | 一般的な用途 |
| --- | --- | --- |
| `chunks[text]` | 各 Struct 要素内の `text` subfield。 | 出力フィールドまたは scalar フィルタリング。 |
| `chunks[section]` | 各 chunk のセクションラベル。 | scalar フィルタリング。 |
| `chunks[quality_score]` | chunk レベルの品質スコア。 | scalar フィルタリングまたは scalar インデックス。 |
| `chunks[emb_list_vector]` | embedding list として使用される vector subfield。 | `MAX_SIM*` を使用した EmbeddingList 検索。 |
| `chunks[emb]` | 各 Struct 要素が独立して使用する vector subfield。 | 要素レベルの vector 検索。 |

## StructArray フィールドを nullable にする\{#make-a-structarray-field-nullable}

Milvus v3.0.x と互換性のある cluster では、nullable な StructArray フィールドをサポートしています。nullable な StructArray フィールドでは、entity は StructArray フィールド全体に対して `null` を保存できます。

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

<Admonition type="warning" icon="🚧" title="警告">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のある cluster でのみ利用できます。nullable な StructArray フィールドでは、entity は有効な StructArray 値を指定するか、フィールド全体を `null` に設定できます。有効な StructArray 値を挿入する場合、すべての subfield はすべて null であるか、すべて有効な値を持っている必要があります。一部の subfield を null にし、他の subfield を有効な値に設定した entity を挿入するとエラーになります。詳細は、[StructArray の制限](./struct-array-limits) を参照してください。

</Admonition>

## 既存の collection に StructArray フィールドを追加する\{#add-a-structarray-field-to-an-existing-collection}

Milvus v3.0.x と互換性のある cluster では、既存の collection に StructArray フィールドを追加することをサポートしています。追加する StructArray フィールドは nullable である必要があります。これは、すでに collection に存在する entity が新しいフィールドの値を持たないためです。

既存の collection に StructArray フィールドを追加するには、まず Struct schema を定義します。次に `add_collection_struct_field()` を呼び出し、`nullable=True` を設定します。

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

StructArray フィールドが追加されると、既存の entity はその新しいフィールドのすべての subfield に対して `null` を返します。

StructArray フィールドを作成した後、その既存の StructArray フィールドに新しい subfield を追加することはできません。後から追加の要素属性が必要になった場合は、`drop_collection_field()` を呼び出して StructArray フィールドを削除し、その後、更新した Struct schema を使用して新しい StructArray フィールドを追加してください。

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

## Schema ルール\{#schema-rules}

| ルール | 説明 |
| --- | --- |
| Struct は Array の要素型として使用されます。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成します。Struct を collection のトップレベル field として作成しないでください。 |
| すべての要素は 1 つの schema を共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールド用に定義された Struct schema に従います。 |
| `max_capacity` は必須です。 | 各 entity が StructArray フィールドに保存できる Struct 要素数を制限します。 |
| 許可されるのはサポート対象の subfield 型のみです。 | StructArray でサポートされる scalar および vector の subfield 型を使用してください。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct / Array subfield は定義しないでください。 |
| vector subfield は検索前にインデックスが必要です。 | vector 検索を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` などのパスにインデックスを作成してください。 |
| 1 つの vector subfield には 1 つのインデックスです。 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々の vector subfield を作成してください。 |
| 既存の StructArray subfield は固定です。 | StructArray フィールドを作成した後は、その同じ StructArray フィールドにさらに subfield を追加できるとは考えないでください。 |
| Struct 内では function はサポートされません。 | StructArray フィールド内の field または subfield に対して function を定義しないでください。 |
| scalar subfield はフィルタ要件に合わせるべきです。 | 後でフィルタリング、グループ化、または出力が必要な場合にのみ、`section`、`quality_score`、`has_code` などのフィールドを追加してください。 |

## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素型として使用するのではなく、collection のトップレベル field として作成してしまう。

- StructArray フィールドに `max_capacity` を設定し忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Array、ネストされた Struct、または Array-of-Struct など、サポートされていない subfield 型を定義してしまう。

- subfield 型として `String` を使用してしまう。`VARCHAR` を使用し、`max_length` を設定してください。

- 1 つの vector subfield を EmbeddingList 検索と要素レベル検索の両方に使用してしまう。

- vector subfield だけを追加し、`section`、`quality_score`、`has_code` などのフィルタリングに必要な scalar subfield を追加し忘れる。

- vector subfield を `$[...]` scalar predicate の入力として扱ってしまう。vector subfield は vector 検索に、scalar subfield は scalar predicate に使用してください。

- フィールド作成後に、既存の StructArray フィールドへ新しい subfield を追加できると想定してしまう。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` の代わりに、`chunks.emb` や `chunks.emb_list_vector` を使用してしまう。

- nullable な StructArray の挙動がすべての対象バージョンで利用可能だと考えてしまう。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[StructArray フィールドへのデータ挿入](./insert-struct-array) を参照してください。

1. vector および scalar インデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray の vector subfield を検索するには、[StructArray による基本的な vector 検索](./search-with-struct-array) を参照してください。

1. サポートされているデータ型、nullable の挙動、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。


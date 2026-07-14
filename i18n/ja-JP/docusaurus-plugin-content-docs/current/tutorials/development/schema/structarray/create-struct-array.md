---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
sidebar_label: "StructArray フィールドを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つの entity に構造化された要素の順序付きリストを含める必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じ schema に従い、scalar サブフィールド、vector サブフィールド、またはその両方を含めることができます。 | Cloud"
type: origin
token: RzSBwW7dUizQeekka9CcZ3Etnyg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray フィールドを作成する

1 つの entity に構造化された要素の順序付きリストを含める必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素型が Struct である Array フィールドです。各 Struct 要素は同じ schema に従い、scalar サブフィールド、vector サブフィールド、またはその両方を含めることができます。

このページでは、Struct schema を定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択し、データを挿入または index 化する前に適用される schema ルールを理解する方法を説明します。

## 始める前に\{#before-you-begin}

このページでは、`tech_articles` という名前の collection を使用します。各 entity は 1 つの技術記事を表し、`chunks` フィールドには chunk レベルのデータが Struct 要素として格納されます。

| Field | Type | Purpose |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事の primary key。 |
| `title` | `VARCHAR` | 記事タイトル。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの vector フィールド。後の hybrid search の例で使用します。 |
| `chunks` | `ARRAY<STRUCT>` | chunk レベルのテキスト、メタデータ、embedding を格納する StructArray フィールド。 |

`chunks` StructArray フィールドには、次のサブフィールドが含まれます。

| Subfield | Type | Purpose |
| --- | --- | --- |
| `text` | `VARCHAR` | chunk テキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | chunk のページ番号または論理位置。 |
| `quality_score` | `FLOAT` | scalar フィルタリングおよび範囲の例で使用される chunk レベルのスコア。 |
| `has_code` | `BOOL` | chunk にコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList search 用の vector サブフィールド。 |
| `emb` | `FLOAT_VECTOR` | 通常の vector メトリクスを使用した要素レベル search 用の vector サブフィールド。 |

<Admonition type="info" icon="📘" title="Notes">

vector フィールドまたは vector サブフィールドは、1 つの index しか受け付けません。EmbeddingList search と要素レベル search の両方が必要な場合は、2 つの別個の vector サブフィールドを定義してください。この例では、`chunks[emb_list_vector]` は EmbeddingList search 用、`chunks[emb]` は要素レベル search 用です。

</Admonition>

## サポートされているサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray フィールドは、各 Struct サブフィールドごとに 1 つの array 値を格納します。Struct schema を定義する際は、サポートされている scalar 系および vector 系の中からサブフィールド型を選択してください。

| Struct subfield physical type | Support | Notes |
| --- | --- | --- |
| `Array<Bool>` | サポート | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | 非サポート | StructArray フィールドでは sparse vector サブフィールドはサポートされていません。 |
| `Array<String>` | 非サポート | `String` ではなく `VARCHAR` を使用してください。 |
| `Array<JSON>` | 非サポート | StructArray フィールドでは JSON サブフィールドはサポートされていません。 |
| `Array<Geometry>` | 非サポート | StructArray フィールドでは Geometry サブフィールドおよび GIS 関数はサポートされていません。 |
| `Array<Text>` | 非サポート | StructArray フィールドでは Text サブフィールドはサポートされていません。 |
| `Array<Timestamptz>` | 非サポート | StructArray フィールドでは Timestamptz サブフィールドおよび時刻固有の式はサポートされていません。 |
| Nested `Array`, `ArrayOfVector`, `Struct`, or `ArrayOfStruct` | 非サポート | StructArray フィールドには、ネストされた arrays、ネストされた vector arrays、ネストされた Struct フィールド、またはネストされた Array-of-Struct フィールドを含めることはできません。 |

バージョン固有のサポート、nullable の挙動、その他の制限については、[StructArray Limits](./struct-array-limits) を参照してください。

## StructArray フィールドを含む collection を作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素で使用される Struct schema を定義します。次に、Array フィールドを追加し、その要素型を Struct に設定します。

1. collection schema を作成します。

1. primary key や記事レベルのフィールドなど、collection レベルのフィールドを追加します。

1. StructArray フィールド内に格納される要素用の Struct schema を作成します。

1. Struct schema に scalar サブフィールドと vector サブフィールドを追加します。

1. `element_type=DataType.STRUCT` を指定した Array フィールドを追加します。

1. `struct_schema` を Struct schema に設定します。

1. `max_capacity` を設定して、各 entity がこのフィールドに格納できる Struct 要素数を制限します。

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

## StructArray フィールドパスを理解する\{#understand-structarray-field-paths}

StructArray フィールドを作成した後は、`structArray[subfield]` のパス構文でそのサブフィールドを参照します。この構文は、index の作成、vector サブフィールドの search、サブフィールドの出力、scalar フィルタの構築時に使用します。

| Path | Meaning | Common usage |
| --- | --- | --- |
| `chunks[text]` | 各 Struct 要素内の `text` サブフィールド。 | 出力フィールドまたは scalar フィルタリング。 |
| `chunks[section]` | 各 chunk の section ラベル。 | scalar フィルタリング。 |
| `chunks[quality_score]` | chunk レベルの quality score。 | scalar フィルタリングまたは scalar index。 |
| `chunks[emb_list_vector]` | embedding list として使用される vector サブフィールド。 | `MAX_SIM*` を使用した EmbeddingList search。 |
| `chunks[emb]` | 各 Struct 要素が独立して使用する vector サブフィールド。 | 要素レベル vector search。 |

## StructArray フィールドを nullable にする\{#make-a-structarray-field-nullable}

Milvus v3.0.x と互換性のある cluster は、nullable な StructArray フィールドをサポートしています。nullable な StructArray フィールドでは、entity は StructArray フィールド全体に対して `null` を格納できます。

```plaintext
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)
```

<Admonition type="warning" icon="🚧" title="Warning">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のある cluster でのみ使用できます。nullable な StructArray フィールドでは、entity は有効な StructArray 値を指定するか、フィールド全体を `null` に設定できます。有効な StructArray 値を挿入する場合、すべてのサブフィールドは null であるか、有効な値を持つ必要があります。一部のサブフィールドを null にし、他のサブフィールドを有効な値に設定した entity を挿入するとエラーになります。詳細は、[StructArray Limits](./struct-array-limits) を参照してください。

</Admonition>

## 既存の collection に StructArray フィールドを追加する\{#add-a-structarray-field-to-an-existing-collection}

Milvus v3.0.x と互換性のある cluster は、既存の collection に StructArray フィールドを追加することをサポートしています。追加される StructArray フィールドは nullable である必要があります。これは、collection にすでに存在する entity が新しいフィールドの値を持たないためです。

既存の collection に StructArray フィールドを追加するには、まず Struct schema を定義します。次に、`add_collection_struct_field()` を呼び出して `nullable=True` を設定します。

```plaintext
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

StructArray フィールドが追加された後、既存の entity はその新しいフィールドのすべてのサブフィールドにわたって `null` を返します。

StructArray フィールドを作成した後、その既存の StructArray フィールドに新しいサブフィールドを追加することはできません。後で追加の要素属性が必要になった場合は、`drop_collection_field()` を呼び出して StructArray フィールドを削除し、その後、更新された Struct schema を持つ新しい StructArray フィールドを追加してください。

```plaintext
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

| Rule | Explanation |
| --- | --- |
| Struct は Array の要素型として使用されます。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成してください。Struct を top-level の collection フィールドとして作成しないでください。 |
| すべての要素は 1 つの schema を共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールド用に定義された Struct schema に従います。 |
| `max_capacity` は必須です。 | これは、各 entity が StructArray フィールドに格納できる Struct 要素数を制限します。 |
| サポートされているサブフィールド型のみ使用できます。 | StructArray でサポートされる scalar および vector サブフィールド型を使用してください。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct / Array サブフィールドを定義しないでください。 |
| vector サブフィールドは search 前に index が必要です。 | vector search を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` のようなパスに index を作成してください。 |
| 1 つの vector サブフィールドには 1 つの index です。 | EmbeddingList search と要素レベル search の両方が必要な場合は、2 つの別個の vector サブフィールドを作成してください。 |
| 既存の StructArray サブフィールドは固定です。 | StructArray フィールドを作成した後、その同じ StructArray フィールドにさらにサブフィールドを追加できるとは考えないでください。 |
| Struct 内では関数はサポートされていません。 | StructArray フィールド内のフィールドまたはサブフィールドに対して関数を定義しないでください。 |
| scalar サブフィールドはフィルタ要件に合わせるべきです。 | 後でフィルタ、グループ化、または出力が必要な場合にのみ、`section`、`quality_score`、`has_code` などのフィールドを追加してください。 |

## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素型として使う代わりに、top-level の collection フィールドとして作成してしまう。

- StructArray フィールドに `max_capacity` を設定し忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Array、ネストされた Struct、または Array-of-Struct など、サポートされていないサブフィールド型を定義してしまう。

- サブフィールド型として `String` を使用してしまう。`VARCHAR` を使い、`max_length` を設定してください。

- 1 つの vector サブフィールドを EmbeddingList search と要素レベル search の両方に使用してしまう。

- vector サブフィールドだけを追加し、`section`、`quality_score`、`has_code` など、フィルタリングに必要な scalar サブフィールドを追加し忘れる。

- vector サブフィールドを `$[...]` scalar predicate の入力として扱ってしまう。vector サブフィールドは vector search に使用し、scalar サブフィールドは scalar predicate に使用してください。

- フィールド作成後に、既存の StructArray フィールドへ新しいサブフィールドを追加できると思い込む。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` の代わりに、`chunks.emb` や `chunks.emb_list_vector` を使ってしまう。

- nullable な StructArray の挙動が、すべての対象バージョンで利用可能だと考えてしまう。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

1. vector および scalar index を作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

1. StructArray の vector サブフィールドを search するには、[Basic Vector Search with StructArray](./search-with-struct-array) を参照してください。

1. サポートされているデータ型、nullable の挙動、バージョン固有の制限事項を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。


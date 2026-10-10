---
title: "JSON インデックス | Cloud"
slug: /json-indexing
sidebar_label: "インデックス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンを必要とし、データセットの増加に伴って遅くなります。JSON インデックスは、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できるようにします。 | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON インデックス

JSON フィールドは、Zilliz Cloud で構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンを必要とし、データセットの増加に伴って遅くなります。JSON インデックスは、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できるようにします。

JSON インデックスは次のような場合に最適です。

- 一貫した既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、テキスト一致クエリ

- どのキーにインデックスを作成するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントの場合は、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は JSON パスに対して 4 つのインデックスタイプを提供します。それぞれが異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの**キャスト型**を特定します。キャスト型は、Zilliz Cloud がそのパスの値をどのように解釈するか、およびどのインデックスタイプが利用可能かを決定します。

### キャスト型について理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` の値を解釈してインデックスを作成するために使用するデータ型です。これはフィールドのスキーマ型とは異なります。フィールドは依然として `JSON` フィールドですが、インデックスが作成された各パスは、特定のスカラー型、配列型、または JSON オブジェクト型として扱われます。

パスに保存されている値に一致するキャスト型を選択します。キャスト型が特定のインデックスタイプで動作するかどうかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| キャスト型 | 次のパス値の場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | ブール値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列値 | `"electronics"` |
| `ARRAY_BOOL` | ブール値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列値の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON オブジェクト全体またはサブオブジェクト。オブジェクト全体の JSON インデックスは Milvus 3.0.0 以降非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスの値に一貫性のない型がある場合、キャスト型に一致する値だけがインデックスされます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` キャスト型のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成時に文字列値を変換するには、`json_cast_function` を使用します。詳細は [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

キャスト型を選択したら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨インデックスタイプ | キャスト型の要件 | 備考 |
| --- | --- | --- | --- |
| スカラー値に対する等価フィルターと範囲フィルターの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値のカーディナリティに基づいて、Zilliz Cloud が内部インデックスレイアウトを選択できるようにします。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての配列キャスト型で必須です。 |
| オブジェクト全体またはサブオブジェクトのインデックス（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のみ） | `JSON` を使用します。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT` を使用し、自動選択を希望する場合は `AUTOINDEX` を使用します。 |
| 低カーディナリティ値に対する等価フィルターまたは `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値の場合は、`AUTOINDEX` または `STL_SORT` を使用します。 |

判断に迷う場合は、スカラーパスには `AUTOINDEX` から始めてください。配列キャスト型とテキスト一致クエリには `INVERTED` を明示的に使用します。`INVERTED` または `AUTOINDEX` を使用したオブジェクト全体の JSON インデックスは引き続きサポートされていますが、Milvus 3.0.0 以降は非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` によって異なります。

| キャスト型 | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`、`DOUBLE`、`VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` の間で選択します。 |
| `ARRAY_BOOL`、`ARRAY_DOUBLE`、`ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして `INVERTED` を明示的に使用してください。 |
| `JSON` | オブジェクト全体またはサブオブジェクトのインデックスに `INVERTED` を使用します。このモードは Milvus 3.0.0 以降非推奨です。 |

スカラーキャスト型（`BOOL`、`DOUBLE`、`VARCHAR`）の場合、Zilliz Cloud に内部インデックスレイアウトを選択させたいときは、`AUTOINDEX` が推奨の出発点です。インデックス構築時に、Zilliz Cloud は JSON パスにある値の**カーディナリティ**を測定します。カーディナリティとは、そのパスにある異なる値の数を意味します。

カーディナリティに基づいて、Zilliz Cloud は 2 つの内部レイアウトのいずれかを選択します。

- **低カーディナリティ**: 値が頻繁に繰り返される場合です。たとえば、`true` と `false` を持つ `metadata["in_stock"]` や、少数のステータス文字列を持つ `metadata["status"]` が該当します。Zilliz Cloud は、高速な等価フィルターと `IN` フィルターのために内部で `BITMAP` インデックスを構築します。

- **高カーディナリティ**: ほとんどの値が異なる場合です。たとえば、`metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` などが該当します。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの高速な範囲フィルターのために内部で `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の異なる値**です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は [AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか？](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキスト一致クエリまたは配列のインデックス作成が必要な場合に最適です。非推奨のオブジェクト全体の JSON インデックスでも引き続き利用できます。

次の場合は `INVERTED` を明示的に指定します。

- JSON 配列内の値にインデックスを作成する必要がある場合。

- オブジェクト全体またはサブオブジェクトに対する既存のインデックスを維持し、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキスト一致、配列の各クエリを 1 つのインデックスタイプで処理したい場合。オブジェクト全体のサポートは互換性のために引き続き利用できますが、その代わりにインデックスサイズが大きくなります。

オブジェクト全体に対する既存のインデックス（`json_cast_type="JSON"`）では、`INVERTED` または `AUTOINDEX` のいずれかを引き続き使用できます。このキャスト型では、`AUTOINDEX` は `INVERTED` を使用します。オブジェクト全体の JSON インデックスは、新しいワークロードでは推奨されません。

詳細については、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソートされた順序で保存します。数値またはソート可能な文字列値に対する範囲フィルターに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` のキャスト型のみをサポートします。次の場合に使用します。

- フィルターが `>`、`<`、`>=`、`<=` で値を比較する場合。

- インデックスされた値のカーディナリティが高い場合（価格、タイムスタンプ、ID、ソート可能なコードなど）。

- `AUTOINDEX` に選択させるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` のキャスト型をサポートしません。配列には `INVERTED` を使用します。既存のオブジェクト全体のインデックスは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、オブジェクト全体の JSON インデックスは非推奨です。

詳細については、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスの異なる値ごとにコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価フィルターと `IN` フィルターに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` のキャスト型のみをサポートします。次の場合に使用します。

- フィルターが `==` または `IN` を使用する場合。

- インデックスされた値のカーディナリティが低い場合（ブール値、ステータス値、少数のカテゴリなど）。

- `AUTOINDEX` に選択させるのではなく、ビットマップレイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` のキャスト型をサポートしません。数値の場合は、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細については、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせをすばやく参照するには、次のマトリックスを使用します。

| キャスト型 | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | ブール値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | ブール値の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動的な型推論とフラット化を伴う JSON オブジェクト全体またはサブオブジェクト。Milvus 3.0.0 以降非推奨です。 | 任意のネストされたオブジェクト | はい（非推奨） | はい（非推奨） | — | — |

`—` とマークされたセルでは、Zilliz Cloud はインデックス作成時にリクエストを拒否します。配列キャスト型では、`INVERTED` を明示的に使用してください（`AUTOINDEX` は配列を対象としません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形の JSON データにインデックスを作成する方法を説明します。すべての例では以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含むコレクションがすでにあることを前提としています。

### サンプル JSON 構造\{#sample-json-structure}

```json
{
  "metadata": {
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

### 基本セットアップ\{#basic-setup}

以下の例では、Zilliz Cloud デプロイに接続された `client` という名前の `MilvusClient` と、`metadata` という名前の `JSON` フィールドを含むコレクションがすでにあることを前提としています。これらを新規にセットアップする必要がある場合は、以下のブロックを展開してください。

<details>

<summary>接続してサンプルコレクションを作成する</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Define a schema with a JSON field
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("pk", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vec", DataType.FLOAT_VECTOR, dim=4)
schema.add_field("metadata", DataType.JSON, nullable=True)

# Minimal vector index so the collection can be loaded
vec_index = client.prepare_index_params()
vec_index.add_index(field_name="vec", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=vec_index,
)

# Insert one row that matches the sample JSON structure above
client.insert(
    collection_name="your_collection_name",
    data=[{
        "pk": 1,
        "vec": [0.1, 0.2, 0.3, 0.4],
        "metadata": {
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": True,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
    }],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.*;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// Define a schema with a JSON field
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(false);
schema.addField(AddFieldReq.builder().fieldName("pk").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("vec").dataType(DataType.FloatVector).dimension(4).build());
schema.addField(AddFieldReq.builder().fieldName("metadata").dataType(DataType.JSON).isNullable(true).build());

// Minimal vector index so the collection can be loaded
List<IndexParam> vecIndex = new ArrayList<>();
vecIndex.add(IndexParam.builder()
        .fieldName("vec")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("your_collection_name")
        .collectionSchema(schema)
        .indexParams(vecIndex)
        .build());

// Insert one row that matches the sample JSON structure above
Gson gson = new Gson();
JsonObject metadata = gson.fromJson("{"
        + "\"category\": \"electronics\","
        + "\"brand\": \"BrandA\","
        + "\"in_stock\": true,"
        + "\"price\": 99.99,"
        + "\"string_price\": \"99.99\","
        + "\"tags\": [\"clearance\", \"summer_sale\"],"
        + "\"supplier\": {"
        + "    \"name\": \"SupplierX\","
        + "    \"country\": \"USA\","
        + "    \"contact\": {"
        + "        \"email\": \"support@supplierx.com\","
        + "        \"phone\": \"+1-800-555-0199\""
        + "    }"
        + "}"
        + "}", JsonObject.class);
JsonObject row = new JsonObject();
row.addProperty("pk", 1L);
row.add("vec", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f)));
row.add("metadata", metadata);

client.insert(InsertReq.builder()
        .collectionName("your_collection_name")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

func main() {
    ctx := context.Background()

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: "YOUR_CLUSTER_ENDPOINT",
    })
    if err != nil {
        log.Fatal(err)
    }
    defer cli.Close(ctx)

    // Define a schema with a JSON field
    schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("pk").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(false)).
        WithField(entity.NewField().WithName("vec").WithDataType(entity.FieldTypeFloatVector).WithDim(4)).
        WithField(entity.NewField().WithName("metadata").WithDataType(entity.FieldTypeJSON).WithNullable(true))

    // Minimal vector index so the collection can be loaded
    vecIndex := milvusclient.NewCreateIndexOption("your_collection_name", "vec", index.NewAutoIndex(entity.L2))

    err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("your_collection_name", schema).
        WithIndexOptions(vecIndex))
    if err != nil {
        log.Fatal(err)
    }

    // Insert one row that matches the sample JSON structure above
    metadata := []byte(`{
        "category": "electronics",
        "brand": "BrandA",
        "in_stock": true,
        "price": 99.99,
        "string_price": "99.99",
        "tags": ["clearance", "summer_sale"],
        "supplier": {
            "name": "SupplierX",
            "country": "USA",
            "contact": {
                "email": "support@supplierx.com",
                "phone": "+1-800-555-0199"
            }
        }
    }`)
    result, err := cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("your_collection_name").
        WithInt64Column("pk", []int64{1}).
        WithFloatVectorColumn("vec", 4, [][]float32{{0.1, 0.2, 0.3, 0.4}}).
        WithColumns(column.NewColumnJSONBytes("metadata", [][]byte{metadata})))
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("inserted %d rows", result.InsertCount())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
    let client = ClientV2::new(&config).await?;

    // Define a schema with a JSON field
    let schema = CollectionSchema::new()
        .add_field(FieldSchema::new().name("pk").data_type(DataType::Int64).primary_key(true).auto_id(false))
        .add_field(FieldSchema::new().name("vec").data_type(DataType::FloatVector).dimension(4))
        .add_field(FieldSchema::new().name("metadata").data_type(DataType::Json).nullable(true));

    client.create_collection(
        CreateCollectionRequest::builder()
            .collection_name("your_collection_name")
            .schema(schema)
            .build()?,
    )
    .await?;

    // Minimal vector index so the collection can be loaded
    let vec_index = IndexParam::new()
        .field_name("vec")
        .index_type(IndexType::AutoIndex)
        .metric_type(MetricType::L2);

    client.create_index(
        CreateIndexRequest::builder()
            .collection_name("your_collection_name")
            .index_params(vec![vec_index])
            .build()?,
    )
    .await?;

    // Insert one row that matches the sample JSON structure above
    let row = json!({
        "pk": 1,
        "vec": [0.1f32, 0.2, 0.3, 0.4],
        "metadata": {
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": true,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
    });
    client.insert(
        InsertRequest::builder()
            .collection_name("your_collection_name")
            .rows(vec![row])
            .build()?,
    )
    .await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Define a schema with a JSON field
milvus::CollectionSchema schema("your_collection_name");
schema.AddField(milvus::FieldSchema("pk", milvus::DataType::INT64, "", true, false));
schema.AddField(milvus::FieldSchema("vec", milvus::DataType::FLOAT_VECTOR, "").WithDimension(4));
schema.AddField(milvus::FieldSchema("metadata", milvus::DataType::JSON, "").WithNullable(true));

// Minimal vector index so the collection can be loaded
milvus::IndexDesc vec_index("vec", "vec_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::L2);

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("your_collection_name")
    .WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("your_collection_name")
    .WithIndexes({std::move(vec_index)})
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Insert one row that matches the sample JSON structure above
milvus::InsertRequest insert_req;
insert_req.WithCollectionName("your_collection_name");
insert_req.AddRowData({{"pk", 1},
                       {"vec", std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f}},
                       {"metadata", nlohmann::json::parse(R"({
                            "category": "electronics",
                            "brand": "BrandA",
                            "in_stock": true,
                            "price": 99.99,
                            "string_price": "99.99",
                            "tags": ["clearance", "summer_sale"],
                            "supplier": {
                                "name": "SupplierX",
                                "country": "USA",
                                "contact": {
                                    "email": "support@supplierx.com",
                                    "phone": "+1-800-555-0199"
                                }
                            }
                        })")}});
milvus::InsertResponse insert_resp;
status = client->Insert(insert_req, insert_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

// Define a schema with a JSON field
const fields = [
  { name: "pk", data_type: DataType.Int64, is_primary_key: true, autoID: false },
  { name: "vec", data_type: DataType.FloatVector, type_params: { dim: "4" } },
  { name: "metadata", data_type: DataType.JSON, nullable: true },
];

// Minimal vector index so the collection can be loaded
const indexParams = [
  { field_name: "vec", index_name: "vec_index", index_type: "AUTOINDEX", metric_type: "L2" },
];

await client.createCollection({
  collection_name: "your_collection_name",
  fields,
  index_params: indexParams,
});

// Insert one row that matches the sample JSON structure above
await client.insert({
  collection_name: "your_collection_name",
  data: [
    {
      pk: 1,
      vec: [0.1, 0.2, 0.3, 0.4],
      metadata: {
        category: "electronics",
        brand: "BrandA",
        in_stock: true,
        price: 99.99,
        string_price: "99.99",
        tags: ["clearance", "summer_sale"],
        supplier: {
          name: "SupplierX",
          country: "USA",
          contact: {
            email: "support@supplierx.com",
            phone: "+1-800-555-0199",
          },
        },
      },
    },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "your_collection_name",
    "schema": {
      "autoID": false,
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "pk", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "vec", "dataType": "FloatVector", "elementTypeParams": {"dim": 4}},
        {"fieldName": "metadata", "dataType": "JSON", "nullable": true}
      ]
    },
    "indexParams": [
      {"fieldName": "vec", "indexName": "vec_index", "indexType": "AUTOINDEX", "metricType": "L2"}
    ]
  }'
```

</TabItem>
</Tabs>

</details>

以下の例で追加するインデックス定義を収集するための index-params オブジェクトを準備します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
```

</TabItem>

<TabItem value='java'>

```java
List<IndexParam> indexParams = new ArrayList<>();
```

</TabItem>

<TabItem value='go'>

```go
var indexOpts []milvusclient.CreateIndexOption
```

</TabItem>

<TabItem value='rust'>

```rust
let mut index_params = Vec::new();
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> index_params;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [];
```

</TabItem>

<TabItem value='bash'>

```bash
# REST creates one index per request; collect the definitions below
export indexParams="[]"
```

</TabItem>
</Tabs>

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。データに合ったものを選び、同じ `index_params` オブジェクトに対して呼び出します。最後に、すべてを 1 回の `client.create_index(...)` 呼び出しで適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーにインデックスを作成する\{#example-1-index-a-top-level-key-with-autoindex}

商品カテゴリによる高速なフィルタリングのために、`category` フィールドにインデックスを作成します。`AUTOINDEX` では、Zilliz Cloud がデータ内に存在する異なるカテゴリの数に基づいて `BITMAP` または `STL_SORT` を選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="category_index",
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"category\"]");
extraParams.put("json_cast_type", "VARCHAR");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex1))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("category_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"category\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc category_index("metadata", "category_index", milvus::IndexType::AUTOINDEX);
category_index.AddExtraParam("json_path", "metadata[\"category\"]");
category_index.AddExtraParam("json_cast_type", "VARCHAR");
index_params.push_back(std::move(category_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "category_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["category"]',
    json_cast_type: "VARCHAR",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"category\\\"]",
    "json_cast_type": "VARCHAR"
  }
}'
```

</TabItem>
</Tabs>

### 例 2: ネストされたキーにインデックスを作成する\{#example-2-index-a-nested-key}

サプライヤー連絡先の検索のために、深くネストされた `email` フィールドにインデックスを作成します。`json_path` パラメーターは、任意の深さのブラケット記法を受け付けます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="email_index",
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]',
        "json_cast_type": "VARCHAR",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"supplier\"][\"contact\"][\"email\"]");
extraParams.put("json_cast_type", "VARCHAR");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("email_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["supplier"]["contact"]["email"]`).
    WithIndexName("email_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex2))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("email_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"supplier\"][\"contact\"][\"email\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc email_index("metadata", "email_index", milvus::IndexType::AUTOINDEX);
email_index.AddExtraParam("json_path", "metadata[\"supplier\"][\"contact\"][\"email\"]");
email_index.AddExtraParam("json_cast_type", "VARCHAR");
index_params.push_back(std::move(email_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "email_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["supplier"]["contact"]["email"]',
    json_cast_type: "VARCHAR",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export emailIndex='{
  "fieldName": "metadata",
  "indexName": "email_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"supplier\\\"][\\\"contact\\\"][\\\"email\\\"]",
    "json_cast_type": "VARCHAR"
  }
}'
```

</TabItem>
</Tabs>

### 例 3: STL_SORT による範囲クエリ\{#example-3-range-queries-with-stlsort}

あるパスに対するクエリが範囲比較（`>`、`<`、`>=`、`<=`）中心になると分かっている場合は、`STL_SORT` を直接選択します。これによりカーディナリティの測定が省略され、ソート済みレイアウトが即座に構築されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="STL_SORT",
    index_name="price_index",
    params={
        "json_path": 'metadata["price"]',
        "json_cast_type": "DOUBLE",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"price\"]");
extraParams.put("json_cast_type", "DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("price_index")
        .indexType(IndexParam.IndexType.STL_SORT)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex3 := index.NewJSONPathIndex(index.Sorted, "double", `metadata["price"]`).
    WithIndexName("price_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex3))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("price_index")
        .index_type(IndexType::StlSort)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"price\"]".to_string()),
            ("json_cast_type".to_string(), "DOUBLE".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc price_index("metadata", "price_index", milvus::IndexType::STL_SORT);
price_index.AddExtraParam("json_path", "metadata[\"price\"]");
price_index.AddExtraParam("json_cast_type", "DOUBLE");
index_params.push_back(std::move(price_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "price_index",
  index_type: "STL_SORT",
  extra_params: {
    json_path: 'metadata["price"]',
    json_cast_type: "DOUBLE",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export priceIndex='{
  "fieldName": "metadata",
  "indexName": "price_index",
  "params": {
    "index_type": "STL_SORT",
    "json_path": "metadata[\\\"price\\\"]",
    "json_cast_type": "DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリは、フルスキャンの代わりに二分探索を使用します。

### 例 4: BITMAP による等価クエリ\{#example-4-equality-queries-with-bitmap}

低カーディナリティのキー（ステータスコード、ブール値、列挙型のような文字列）の場合は、`BITMAP` を直接選択します。等価クエリと `IN` クエリはビットマップ操作になります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="BITMAP",
    index_name="in_stock_index",
    params={
        "json_path": 'metadata["in_stock"]',
        "json_cast_type": "BOOL",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"in_stock\"]");
extraParams.put("json_cast_type", "BOOL");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("in_stock_index")
        .indexType(IndexParam.IndexType.BITMAP)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex4 := index.NewJSONPathIndex(index.BITMAP, "bool", `metadata["in_stock"]`).
    WithIndexName("in_stock_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex4))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("in_stock_index")
        .index_type(IndexType::Bitmap)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"in_stock\"]".to_string()),
            ("json_cast_type".to_string(), "BOOL".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc in_stock_index("metadata", "in_stock_index", milvus::IndexType::BITMAP);
in_stock_index.AddExtraParam("json_path", "metadata[\"in_stock\"]");
in_stock_index.AddExtraParam("json_cast_type", "BOOL");
index_params.push_back(std::move(in_stock_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "in_stock_index",
  index_type: "BITMAP",
  extra_params: {
    json_path: 'metadata["in_stock"]',
    json_cast_type: "BOOL",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export inStockIndex='{
  "fieldName": "metadata",
  "indexName": "in_stock_index",
  "params": {
    "index_type": "BITMAP",
    "json_path": "metadata[\\\"in_stock\\\"]",
    "json_cast_type": "BOOL"
  }
}'
```

</TabItem>
</Tabs>

`BITMAP` は、少数の異なる文字列値を持つ `status` 列のようなフィールドにも非常によく適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使用して、インデックス構築時に値を数値に変換します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
        "json_path": 'metadata["string_price"]',
        "json_cast_type": "DOUBLE",
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"string_price\"]");
extraParams.put("json_cast_type", "DOUBLE");
extraParams.put("json_cast_function", "STRING_TO_DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("string_to_double_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `metadata["string_price"]`).
    WithIndexName("string_to_double_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex5).
    WithExtraParam("json_cast_function", "STRING_TO_DOUBLE"))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("string_to_double_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"string_price\"]".to_string()),
            ("json_cast_type".to_string(), "DOUBLE".to_string()),
            ("json_cast_function".to_string(), "STRING_TO_DOUBLE".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc string_to_double_index("metadata", "string_to_double_index", milvus::IndexType::AUTOINDEX);
string_to_double_index.AddExtraParam("json_path", "metadata[\"string_price\"]");
string_to_double_index.AddExtraParam("json_cast_type", "DOUBLE");
string_to_double_index.AddExtraParam("json_cast_function", "STRING_TO_DOUBLE");
index_params.push_back(std::move(string_to_double_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "string_to_double_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["string_price"]',
    json_cast_type: "DOUBLE",
    json_cast_function: "STRING_TO_DOUBLE",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export stringToDoubleIndex='{
  "fieldName": "metadata",
  "indexName": "string_to_double_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"string_price\\\"]",
    "json_cast_type": "DOUBLE",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

行の変換が失敗した場合（たとえば `"invalid"` のような非数値文字列）、その行はインデックス作成時にスキップされます。

### 例 6: JSON オブジェクト全体にインデックスを作成する\{#example-6-index-entire-json-objects}

<Admonition type="warning" title="Warning">

Milvus 3.0.0 以降、オブジェクト全体の JSON インデックス（`json_cast_type="JSON"`、JSON フラットインデックスとも呼ばれます）は非推奨です。既存のインデックスと新規のインデックス作成リクエストは互換性のために引き続きサポートされていますが、このモードは新しいワークロードでは推奨されません。既知のクエリパスに対しては JSON パスインデックスを作成してください。広範なクエリパターンを持つ複雑または進化する JSON ドキュメントの場合は、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は配列内の値の高速化は行いません。そのようなクエリには、配列キャスト型を使用した JSON パスインデックスを使用してください。

</Admonition>

互換性のある既存のワークロードでは、`json_cast_type="JSON"` を設定すると、指定されたパスの完全な構造にインデックスが作成されます。Zilliz Cloud はネストされたオブジェクトをパスにフラット化し、各値の型を自動的に推論します。そのパス配下のすべてのキーが検索可能になります。

`AUTOINDEX` は `JSON` キャスト型に対して透過的に `INVERTED` を使用します。フラット化と型推論は転置インデックスの機能だからです。

`metadata` オブジェクト全体にインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        "json_path": "metadata",
        "json_cast_type": "JSON",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata");
extraParams.put("json_cast_type", "JSON");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("metadata_full_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex6 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata`).
    WithIndexName("metadata_full_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex6))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("metadata_full_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata".to_string()),
            ("json_cast_type".to_string(), "JSON".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc metadata_full_index("metadata", "metadata_full_index", milvus::IndexType::AUTOINDEX);
metadata_full_index.AddExtraParam("json_path", "metadata");
metadata_full_index.AddExtraParam("json_cast_type", "JSON");
index_params.push_back(std::move(metadata_full_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "metadata_full_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: "metadata",
    json_cast_type: "JSON",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export metadataFullIndex='{
  "fieldName": "metadata",
  "indexName": "metadata_full_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata",
    "json_cast_type": "JSON"
  }
}'
```

</TabItem>
</Tabs>

または、サブオブジェクト（たとえば、すべての `supplier` 情報）にインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"supplier\"]");
extraParams.put("json_cast_type", "JSON");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("supplier_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex7 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata["supplier"]`).
    WithIndexName("supplier_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex7))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("supplier_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"supplier\"]".to_string()),
            ("json_cast_type".to_string(), "JSON".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc supplier_index("metadata", "supplier_index", milvus::IndexType::AUTOINDEX);
supplier_index.AddExtraParam("json_path", "metadata[\"supplier\"]");
supplier_index.AddExtraParam("json_cast_type", "JSON");
index_params.push_back(std::move(supplier_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "supplier_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["supplier"]',
    json_cast_type: "JSON",
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export supplierIndex='{
  "fieldName": "metadata",
  "indexName": "supplier_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"supplier\\\"]",
    "json_cast_type": "JSON"
  }
}'
```

</TabItem>
</Tabs>

オブジェクト全体にインデックスを作成すると、インデックスサイズが増加します。深くネストされたドキュメントと多様なクエリパターンを持つ新しいワークロードでは、パス固有のインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメーターを追加したら、それらをコレクションに適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
client.createIndex(CreateIndexReq.builder()
        .collectionName("your_collection_name")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
for _, opt := range indexOpts {
    _, err := cli.CreateIndex(ctx, opt)
    if err != nil {
        log.Fatal(err)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.create_index(
    CreateIndexRequest::builder()
        .collection_name("your_collection_name")
        .index_params(index_params)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("your_collection_name")
    .WithIndexes(std::move(index_params))
    .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex(indexParams);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams="[
  $categoryIndex,
  $emailIndex,
  $priceIndex,
  $inStockIndex,
  $stringToDoubleIndex,
  $metadataFullIndex,
  $supplierIndex
]"
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data "{
    \"collectionName\": \"your_collection_name\",
    \"indexParams\": $indexParams
  }"
```

</TabItem>
</Tabs>

インデックスの構築は非同期で実行されます。特定のインデックスの構築状態を確認するには `client.describe_index(...)` を使用します。`state` フィールドは構築が完了すると `Finished` を示し、`total_rows` / `indexed_rows` / `pending_index_rows` は途中の進行状況を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.describe_index(
    collection_name="your_collection_name",
    index_name="category_index",
)
```

</TabItem>

<TabItem value='java'>

```java
DescribeIndexResp descResp = client.describeIndex(DescribeIndexReq.builder()
        .collectionName("your_collection_name")
        .indexName("category_index")
        .build());
System.out.println(descResp);
```

</TabItem>

<TabItem value='go'>

```go
desc, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("your_collection_name", "category_index"))
if err != nil {
    log.Fatal(err)
}
log.Printf("state=%s totalRows=%d indexedRows=%d", desc.State, desc.TotalRows, desc.IndexedRows)
```

</TabItem>

<TabItem value='rust'>

```rust
let desc = client
    .describe_index(
        DescribeIndexRequest::builder()
            .collection_name("your_collection_name")
            .index_name("category_index")
            .build()?,
    )
    .await?;
println!("{:?}", desc);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DescribeIndexRequest describe_req;
describe_req.WithCollectionName("your_collection_name");
describe_req.WithIndexName("category_index");
milvus::DescribeIndexResponse describe_resp;
status = client->DescribeIndex(describe_req, describe_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.describeIndex({ collection_name: "your_collection_name", index_name: "category_index" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/describe" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "your_collection_name",
    "indexName": "category_index"
  }'
```

</TabItem>
</Tabs>

レスポンス例:

```json
{
  "json_path": "metadata[\"category\"]",
  "json_cast_type": "VARCHAR",
  "index_type": "AUTOINDEX",
  "field_name": "metadata",
  "index_name": "category_index",
  "total_rows": 20,
  "indexed_rows": 20,
  "pending_index_rows": 0,
  "state": "Finished"
}
```

`state` が `Finished` を報告すると、インデックスが作成されたパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` のエントリでは、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、構築時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部最適化として扱ってください。どのレイアウトが選択されても、そのパスに対する等価、`IN`、範囲クエリは機能します。

## よくある質問\{#faq}

### AUTOINDEX と明示的なインデックスタイプはどのように使い分ければよいですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まず `AUTOINDEX` から始めます。データのカーディナリティから適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、範囲クエリをカバーします。次の場合は明示的な型を選択します。

- クエリパターンが分かっており（例: 常に範囲 → `STL_SORT`、常に低カーディナリティの等価 → `BITMAP`）、カーディナリティの測定を省略したい場合。

- テキスト一致または部分文字列クエリが必要な場合 → `INVERTED`。

- 配列キャスト型にインデックスを作成する場合。`INVERTED` を明示的に使用してください。

- 既存のオブジェクト全体の JSON インデックスを維持している場合。`INVERTED` と `AUTOINDEX` はどちらも互換性のために引き続きサポートされていますが、オブジェクト全体の JSON インデックスは Milvus 3.0.0 以降非推奨です。

### クエリのフィルター式がインデックスされたキャスト型と異なる型を使用した場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許せばより低速なブルートフォーススキャンにフォールバックすることがあります。最良のパフォーマンスを得るには、常にフィルター式をインデックスのキャスト型に合わせてください。たとえば、`json_cast_type="DOUBLE"` で数値インデックスを作成した場合、数値のフィルター条件だけがそのインデックスを活用します。

### JSON キーのデータ型がエンティティごとに一貫していない場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型が一貫していないと、**部分的なインデックス作成**が発生することがあります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されており、`json_cast_type="DOUBLE"` でインデックスを作成した場合、数値だけがインデックスされます。文字列形式のエントリはスキップされ、フィルター結果に表示されません。インデックス作成時に文字列を数値に強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが同じ型になるようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、キャスト型やインデックスタイプに関係なく、`(field, json_path)` のペアごとに最大 1 つのインデックスしか作成できません。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、同じパスに異なるキャスト型で 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することは可能です。これらは異なるパスです。

### AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックスされた値の**異なる値が 100 以下**の場合に `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。インデックスパラメーターに `"bitmap_cardinality_limit"` を追加することで、このしきい値を上書きできます（範囲: 1〜1000）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="category_index",
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
        # highlight-next-line
        "bitmap_cardinality_limit": 200,  # use BITMAP up to 200 distinct values
    }
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("json_path", "metadata[\"category\"]");
extraParams.put("json_cast_type", "VARCHAR");
extraParams.put("bitmap_cardinality_limit", 200);
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex8 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex8).
    WithExtraParam("bitmap_cardinality_limit", "200"))
```

</TabItem>

<TabItem value='rust'>

```rust
index_params.push(
    IndexParam::new()
        .field_name("metadata")
        .index_name("category_index")
        .index_type(IndexType::AutoIndex)
        .extra_params(HashMap::from([
            ("json_path".to_string(), "metadata[\"category\"]".to_string()),
            ("json_cast_type".to_string(), "VARCHAR".to_string()),
            ("bitmap_cardinality_limit".to_string(), "200".to_string()),
        ])),
);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc category_limit_index("metadata", "category_index", milvus::IndexType::AUTOINDEX);
category_limit_index.AddExtraParam("json_path", "metadata[\"category\"]");
category_limit_index.AddExtraParam("json_cast_type", "VARCHAR");
category_limit_index.AddExtraParam("bitmap_cardinality_limit", "200");
index_params.push_back(std::move(category_limit_index));
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
  collection_name: "your_collection_name",
  field_name: "metadata",
  index_name: "category_index",
  index_type: "AUTOINDEX",
  extra_params: {
    json_path: 'metadata["category"]',
    json_cast_type: "VARCHAR",
    bitmap_cardinality_limit: 200,
  },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryLimitIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"category\\\"]",
    "json_cast_type": "VARCHAR",
    "bitmap_cardinality_limit": 200
  }
}'
```

</TabItem>
</Tabs>

ほとんどのユーザーはこれを調整する必要はありません。中程度のカーディナリティを持つフィールドをビットマップにしたい場合は値を大きくしてください。`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は値を小さくします。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。

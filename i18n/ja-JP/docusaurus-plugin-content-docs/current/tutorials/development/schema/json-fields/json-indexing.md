---
title: "JSON インデックス | Cloud"
slug: /json-indexing
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンが必要になり、データセットの増加に伴って遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-json-indexing
sidebar_label: "インデックス"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/json-indexing.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON インデックス

JSON フィールドは、Zilliz Cloud で構造化メタデータを柔軟に保存する方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンが必要になり、データセットの増加に伴って遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。

JSON インデックス作成は次のような場合に最適です：

- 一貫した既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、テキスト一致クエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

複雑な JSON ドキュメントで多様なクエリパターンを使用する場合は、代替として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は、JSON パス用に 4 つのインデックスタイプを提供しています。それぞれ異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの**キャスト型**を特定してください。キャスト型は、Zilliz Cloud がそのパスの値をどのように解釈するか、およびどのインデックスタイプを使用できるかを決定します。

### キャスト型を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` の値を解釈し、インデックスを作成するために使用するデータ型です。フィールドスキーマ型とは異なります。フィールドは引き続き `JSON` フィールドですが、インデックス化された各パスは、特定のスカラー、配列、または JSON オブジェクト型として扱われます。

パスに保存されている値に一致するキャスト型を選択してください。キャスト型が特定のインデックスタイプで動作するかどうかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| キャスト型 | パス値が次の場合に使用します... | 値の例 |
| --- | --- | --- |
| `BOOL` | ブール値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列値 | `"electronics"` |
| `ARRAY_BOOL` | ブール値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列値の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON オブジェクト全体またはサブオブジェクト。オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスの値に一貫性のない型がある場合、キャスト型に一致する値のみがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` キャスト型のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成中に文字列値を変換するには `json_cast_function` を使用します。詳細は、[例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

キャスト型を選択したら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨インデックスタイプ | キャスト型の要件 | 注記 |
| --- | --- | --- | --- |
| スカラー値に対する等価フィルターと範囲フィルターの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値のカーディナリティに基づいて、Zilliz Cloud が内部インデックスレイアウトを選択できるようにします。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての配列キャスト型で必要です。 |
| オブジェクト全体またはサブオブジェクトのインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のみ） | `JSON` を使用します。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソートされたレイアウトを強制するには `STL_SORT` を使用し、自動選択が必要な場合は `AUTOINDEX` を使用します。 |
| 低カーディナリティ値に対する等価フィルターまたは `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値の場合は、`AUTOINDEX` または `STL_SORT` を使用します。 |

迷った場合は、スカラーパスの `AUTOINDEX` から開始してください。配列キャスト型とテキスト一致クエリには `INVERTED` を明示的に使用します。`INVERTED` または `AUTOINDEX` を使用するオブジェクト全体の JSON インデックス作成は引き続きサポートされますが、Milvus 3.0.0 以降は非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定した `json_cast_type` によって異なります。Milvus 3.0 では、JSON パスインデックスに対して `AUTOINDEX` が常に `INVERTED` に解決されるわけではありません。

| キャスト型 | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`、`DOUBLE`、`VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` のどちらかを選択します。 |
| `ARRAY_BOOL`、`ARRAY_DOUBLE`、`ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして `INVERTED` を明示的に使用してください。 |
| `JSON` | オブジェクト全体またはサブオブジェクトのインデックス作成に `INVERTED` を使用します。このモードは Milvus 3.0.0 以降非推奨です。 |

スカラーキャスト型（`BOOL`、`DOUBLE`、`VARCHAR`）では、Zilliz Cloud に内部インデックスレイアウトを選択させる場合、`AUTOINDEX` を最初に使用することを推奨します。インデックス構築中に、Zilliz Cloud は JSON パスの値の**カーディナリティ**を測定します。カーディナリティとは、そのパスにある個別の値の数です。

カーディナリティに基づいて、Zilliz Cloud は 2 つの内部レイアウトのいずれかを選択します：

- **低カーディナリティ**: 値が頻繁に繰り返される場合です。たとえば、`true` と `false` を持つ `metadata["in_stock"]`、または少数のステータス文字列を持つ `metadata["status"]` です。Zilliz Cloud は、等価フィルターと `IN` フィルターを高速化するために、内部的に `BITMAP` インデックスを構築します。

- **高カーディナリティ**: ほとんどの値が個別である場合です。たとえば、`metadata["price"]`、`metadata["created_at"]`、または `metadata["product_id"]` です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの範囲フィルターを高速化するために、内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の個別値**です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は、[AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか？](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

**Milvus 3.0 での動作変更**。以前のバージョンでは、JSON パスに対する `AUTOINDEX` は常に `INVERTED` インデックスを構築していました。Milvus 3.0 以降、`AUTOINDEX` はスカラーキャスト型に対して `BITMAP` と `STL_SORT` のいずれかを選択します。`JSON` の場合、オブジェクト全体の JSON インデックス作成は非推奨ですが、`AUTOINDEX` は引き続き `INVERTED` を使用します。配列キャスト型とテキスト一致クエリの場合は、`INVERTED` を明示的に指定してください。

</Admonition>

### INVERTED\{#inverted}

`INVERTED` は、テキスト一致クエリや配列のインデックス作成が必要な場合に最適です。非推奨のオブジェクト全体の JSON インデックス作成でも引き続き使用できます。

次の場合は `INVERTED` を明示的に指定してください：

- JSON 配列内の値をインデックス化する必要がある場合。

- JSON オブジェクト全体またはサブオブジェクトの既存インデックスを維持し、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキスト一致、および配列クエリを処理する 1 つのインデックスタイプが必要な場合。オブジェクト全体のサポートは互換性のために引き続き利用できますが、インデックスサイズが大きくなります。

JSON オブジェクト全体の既存インデックス（`json_cast_type="JSON"`）では、引き続き `INVERTED` または `AUTOINDEX` のいずれかを使用できます。`AUTOINDEX` はこのキャスト型に `INVERTED` を使用します。オブジェクト全体の JSON インデックス作成は、新しいワークロードには推奨されません。

詳細は、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソート順で保存します。数値またはソート可能な文字列値に対する範囲フィルターに最適化されています。

`STL_SORT` は `DOUBLE` および `VARCHAR` キャスト型のみをサポートします。次の場合に使用します：

- フィルターで `>`、`<`、`>=`、または `<=` を使用して値を比較する場合。

- インデックス化された値のカーディナリティが高い場合。たとえば、価格、タイムスタンプ、ID、またはソート可能なコードです。

- `AUTOINDEX` に選択させるのではなく、ソートされたレイアウトを強制する場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、または `JSON` キャスト型をサポートしていません。配列には `INVERTED` を使用してください。既存のオブジェクト全体インデックスは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、オブジェクト全体の JSON インデックス作成は非推奨です。

詳細は、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスの個別の値ごとにコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価フィルターと `IN` フィルターに最適化されています。

`BITMAP` は `BOOL` および `VARCHAR` キャスト型のみをサポートします。次の場合に使用します：

- フィルターで `==` または `IN` を使用する場合。

- インデックス化された値のカーディナリティが低い場合。たとえば、ブール値、ステータス値、または少数のカテゴリです。

- `AUTOINDEX` に選択させるのではなく、ビットマップレイアウトを強制する場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、または `JSON` キャスト型をサポートしていません。数値の場合は、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせをすばやく確認するには、次のマトリックスを使用してください。

| キャスト型 | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | ブール値（`true`/`false`）。 | `true` | はい | はい | いいえ | はい |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | はい | はい | はい | いいえ |
| `VARCHAR` | 文字列値。 | `"electronics"` | はい | はい | はい | はい |
| `ARRAY_BOOL` | ブール値の配列。 | `[true, false]` | いいえ | はい | いいえ | いいえ |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | いいえ | はい | いいえ | いいえ |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | いいえ | はい | いいえ | いいえ |
| `JSON` | 自動型推論とフラット化を伴う JSON オブジェクト全体またはサブオブジェクト。Milvus 3.0.0 以降非推奨です。 | 任意のネストされたオブジェクト | はい（非推奨） | はい（非推奨） | いいえ | いいえ |

`No` と表示されたセルでは、Zilliz Cloud はインデックス作成時にリクエストを拒否します。配列キャスト型の場合は、`INVERTED` を明示的に使用してください（`AUTOINDEX` は配列をサポートしていません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データのインデックス作成について説明します。すべての例では、以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含むコレクションがすでに存在することを前提としています。

### JSON 構造のサンプル\{#sample-json-structure}

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

### 基本的な設定\{#basic-setup}

以下の例では、Zilliz Cloud デプロイに接続された `client` という名前の `MilvusClient` と、`metadata` という名前の `JSON` フィールドをすでに含むコレクションがあることを前提としています。これらを最初から設定する必要がある場合は、以下のブロックを展開してください。

<details>

<summary>接続してサンプルコレクションを作成する</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

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
        .token("YOUR_CLUSTER_TOKEN")
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

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
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
log.Printf("inserted %d rows", result.InsertCount)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
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
```

</TabItem>

<TabItem value='c++'>

```cpp
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

using var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT", ApiKey = "YOUR_CLUSTER_TOKEN" });
await client.ConnectAsync();

// Define a schema with a JSON field
var schema = new CollectionSchema
{
    Fields =
    {
        new FieldSchema("pk", DataType.Int64, isPrimaryKey: true, autoId: false),
        FieldSchema.CreateFloatVector("vec", dimension: 4),
        new FieldSchema("metadata", DataType.Json) { Nullable = true }
    }
};

// Minimal vector index so the collection can be loaded
await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "your_collection_name",
    Schema = schema,
    Indexes = new[]
    {
        new IndexParam("vec", "vec_index", IndexType.AutoIndex, MetricType.L2)
    }
});

// Insert one row that matches the sample JSON structure above
await client.InsertAsync(new InsertReq
{
    CollectionName = "your_collection_name",
    RowsData = new[]
    {
        new Dictionary<string, object?>
        {
            ["pk"] = 1L,
            ["vec"] = new[] { 0.1f, 0.2f, 0.3f, 0.4f },
            ["metadata"] = new Dictionary<string, object?>
            {
                ["category"] = "electronics",
                ["brand"] = "BrandA",
                ["in_stock"] = true,
                ["price"] = 99.99,
                ["string_price"] = "99.99",
                ["tags"] = new[] { "clearance", "summer_sale" },
                ["supplier"] = new Dictionary<string, object?>
                {
                    ["name"] = "SupplierX",
                    ["country"] = "USA",
                    ["contact"] = new Dictionary<string, object?>
                    {
                        ["email"] = "support@supplierx.com",
                        ["phone"] = "+1-800-555-0199"
                    }
                }
            }
        }
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

Prepare an index-params object to collect the index definitions added in the examples below:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
std::vector<milvus::IndexDesc> index_params;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [];
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

var indexParams = new List<IndexParam>();
```

</TabItem>

<TabItem value='bash'>

```bash
# REST creates one index per request; collect the definitions below
export indexParams="[]"
```

</TabItem>

</Tabs>

後続の各例では、1 回の `index_params.add_index(...)` 呼び出しを示します。データに一致するものを選択し、同じ `index_params` オブジェクトに対して呼び出してください。最後に、すべてを 1 回の `client.create_index(...)` 呼び出しで適用します。詳細は、[インデックスを適用する](./json-indexing#apply-the-index) を参照してください。

### 例 1: AUTOINDEX でトップレベルのキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

製品カテゴリによる高速なフィルタリングのために、`category` フィールドをインデックス化します。`AUTOINDEX` を使用すると、Zilliz Cloud はデータ内に存在する個別カテゴリの数に基づいて `BITMAP` または `STL_SORT` を選択します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="category_index",
    # highlight-start
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex1).
    WithIndexName("category_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "category_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"category\"]",
        ["json_cast_type"] = "VARCHAR"
    }
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

### 例 2: ネストされたキーをインデックス化する\{#example-2-index-a-nested-key}

サプライヤーの連絡先を検索するために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメーターは、任意の深さのブラケット表記を受け入れます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="email_index",
    # highlight-start
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["supplier"]["contact"]["email"]`).
    WithIndexName("email_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex2).
    WithIndexName("email_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "email_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"supplier\"][\"contact\"][\"email\"]",
        ["json_cast_type"] = "VARCHAR"
    }
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

### 例 3: STL_SORT を使用した範囲クエリ\{#example-3-range-queries-with-stlsort}

パスに対するクエリが主に範囲比較（`>`、`<`、`>=`、`<=`）になるとわかっている場合は、`STL_SORT` を直接選択してください。これにより、カーディナリティの測定を省略し、ソートされたレイアウトをすぐに構築できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex3 := index.NewJSONPathIndex(index.Sorted, "double", `metadata["price"]`).
    WithIndexName("price_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex3).
    WithIndexName("price_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "price_index", IndexType.StlSort)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"price\"]",
        ["json_cast_type"] = "DOUBLE"
    }
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

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリは、フルスキャンではなくバイナリ検索を使用します。

### 例 4: BITMAP を使用した等価クエリ\{#example-4-equality-queries-with-bitmap}

ステータスコード、ブール値、列挙型のような文字列などの低カーディナリティキーには、`BITMAP` を直接選択してください。等価クエリと `IN` クエリはビットマップ操作になります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex4 := index.NewJSONPathIndex(index.BITMAP, "bool", `metadata["in_stock"]`).
    WithIndexName("in_stock_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex4).
    WithIndexName("in_stock_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "in_stock_index", IndexType.Bitmap)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"in_stock\"]",
        ["json_cast_type"] = "BOOL"
    }
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

`BITMAP` は、少数の個別文字列値を持つ `status` 列のようなフィールドにも非常によく適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使用して、インデックス構築中に値を数値へ変換します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex5 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `metadata["string_price"]`).
    WithIndexName("string_to_double_index")
opt5 := milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex5).
    WithIndexName("string_to_double_index")
opt5.WithExtraParam("json_cast_function", "STRING_TO_DOUBLE")
indexOpts = append(indexOpts, opt5)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "string_to_double_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"string_price\"]",
        ["json_cast_type"] = "DOUBLE",
        ["json_cast_function"] = "STRING_TO_DOUBLE"
    }
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

行の変換が失敗した場合（たとえば、`"invalid"` のような非数値文字列）、その行はインデックス作成中にスキップされます。

### 例 6: JSON オブジェクト全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" icon="🚧" title="Warning">

Milvus 3.0.0 以降、JSON フラットインデックスとも呼ばれるオブジェクト全体の JSON インデックス作成（`json_cast_type="JSON"`）は非推奨です。既存のインデックスと新しいインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードには推奨されません。既知のクエリパスには JSON パスインデックスを作成してください。広範なクエリパターンを持つ複雑または進化する JSON ドキュメントの場合は、[JSON Shredding](./json-shredding) を検討してください。JSON シャーディングは配列内の値を高速化しません。そのようなクエリには、配列キャスト型を指定した JSON パスインデックスを使用してください。

</Admonition>

互換性のある既存のワークロードでは、`json_cast_type="JSON"` を設定すると、指定されたパスの完全な構造がインデックス化されます。Zilliz Cloud はネストされたオブジェクトをパスにフラット化し、各値の型を自動的に推論します。パス以下のすべてのキーが検索可能になります。

フラット化と型推論は転置インデックスの機能であるため、`AUTOINDEX` は `JSON` キャスト型に対して透過的に `INVERTED` を使用します。

`metadata` オブジェクト全体をインデックス化します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        # highlight-start
        "json_path": "metadata",
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex6 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata`).
    WithIndexName("metadata_full_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex6).
    WithIndexName("metadata_full_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "metadata_full_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata",
        ["json_cast_type"] = "JSON"
    }
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

または、すべての `supplier` 情報など、サブオブジェクトをインデックス化します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        # highlight-start
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex7 := index.NewJSONPathIndex(index.AUTOINDEX, "json", `metadata["supplier"]`).
    WithIndexName("supplier_index")
indexOpts = append(indexOpts, milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex7).
    WithIndexName("supplier_index"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "supplier_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"supplier\"]",
        ["json_cast_type"] = "JSON"
    }
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

オブジェクト全体をインデックス化すると、インデックスサイズが増加します。深くネストされたドキュメントと多様なクエリパターンを使用する新しいワークロードでは、パス固有のインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメーターを追加したら、それらをコレクションに適用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("your_collection_name")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "log"

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
use milvus::v2::prelude::*;

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

```cpp
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "your_collection_name",
    Indexes = indexParams
});
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

インデックスの構築は非同期で実行されます。特定のインデックスの構築状態を確認するには、`client.describe_index(...)` を使用します。構築が完了すると `state` フィールドに `Finished` が表示され、`total_rows`、`indexed_rows`、および `pending_index_rows` に進行状況が表示されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

DescribeIndexResp descResp = client.describeIndex(DescribeIndexReq.builder()
        .collectionName("your_collection_name")
        .indexName("category_index")
        .build());
System.out.println(descResp);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

desc, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("your_collection_name", "category_index"))
if err != nil {
    log.Fatal(err)
}
log.Printf("state=%s totalRows=%d indexedRows=%d", desc.State, desc.TotalRows, desc.IndexedRows)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

```cpp
#include <iostream>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;

var describeResp = await client.DescribeIndexAsync(new DescribeIndexReq
{
    CollectionName = "your_collection_name",
    IndexName = "category_index"
});
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

応答例：

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

`state` が `Finished` を報告すると、インデックス化されたパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` エントリの場合、この応答の `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は、構築時に選択された基盤レイアウト（`BITMAP` または `STL_SORT`）を公開しません。この選択は内部最適化として扱ってください。選択されたレイアウトに関係なく、パスに対する等価、`IN`、および範囲クエリは機能します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプのどちらを選択するにはどうすればよいですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

`AUTOINDEX` から開始してください。データのカーディナリティから適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、および範囲クエリをカバーします。次の場合は明示的なタイプを選択してください：

- クエリパターンがわかっている場合（たとえば、常に範囲クエリには `STL_SORT` を使用し、常に低カーディナリティ値に対する等価クエリには `BITMAP` を使用する）で、カーディナリティの測定を省略したい場合。

- テキスト一致クエリまたは部分文字列クエリが必要な場合。`INVERTED` を使用してください。

- 配列キャスト型をインデックス化する場合。`INVERTED` を明示的に使用してください。

- 既存のオブジェクト全体の JSON インデックスを維持する場合。`INVERTED` と `AUTOINDEX` はどちらも互換性のために引き続きサポートされますが、オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降非推奨です。

### クエリのフィルター式が、インデックス化されたキャスト型とは異なる型を使用した場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` とは異なる型を使用している場合、Zilliz Cloud はインデックスを使用せず、データが許せば低速なブルートフォーススキャンにフォールバックする可能性があります。最高のパフォーマンスを得るには、フィルター式を常にインデックスのキャスト型に合わせてください。たとえば、数値インデックスが `json_cast_type="DOUBLE"` で作成されている場合、数値のフィルター条件のみがインデックスを利用します。

### JSON キーのデータ型がエンティティごとに一貫していない場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は**部分的なインデックス作成**につながる可能性があります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されており、`json_cast_type="DOUBLE"` でインデックスを作成すると、数値のみがインデックス化されます。文字列形式のエントリはスキップされ、フィルター結果に表示されません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが 1 つの型を共有するようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、キャスト型やインデックスタイプに関係なく、`(field, json_path)` のペアごとに最大 1 つのインデックスを使用できます。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なるキャスト型で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体のインデックスと、そのオブジェクト内のネストされたキーの個別インデックスは、異なるパスであるため作成できます。

### AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、インデックス化された値の個別値が **100 個以下**の場合、`AUTOINDEX` は `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。インデックスパラメーターに `"bitmap_cardinality_limit"` を追加することで、このしきい値を上書きできます（範囲: 1-1000）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.IndexParam;
import java.util.HashMap;
import java.util.Map;

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
import (
    "github.com/milvus-io/milvus/client/v3/index"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

jsonIndex8 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`).
    WithIndexName("category_index")
opt8 := milvusclient.NewCreateIndexOption("your_collection_name", "metadata", jsonIndex8).
    WithIndexName("category_index")
opt8.WithExtraParam("bitmap_cardinality_limit", "200")
indexOpts = append(indexOpts, opt8)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

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

```cpp
#include <utility>
#include "milvus/MilvusClientV2.h"

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

indexParams.Add(new IndexParam("metadata", "category_index", IndexType.AutoIndex)
{
    ExtraParams =
    {
        ["json_path"] = "metadata[\"category\"]",
        ["json_cast_type"] = "VARCHAR",
        ["bitmap_cardinality_limit"] = "200" // use BITMAP up to 200 distinct values
    }
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

ほとんどのユーザーはこの設定を調整する必要はありません。ビットマップ化を希望する中程度のカーディナリティのフィールドがある場合は値を上げてください。`AUTOINDEX` をより早く `STL_SORT` に誘導する場合は値を下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。

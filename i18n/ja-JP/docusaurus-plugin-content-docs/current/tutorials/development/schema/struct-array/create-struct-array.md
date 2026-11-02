---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct の Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-create-struct-array
sidebar_label: "StructArray フィールドを作成する"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/create-structarray-field.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray フィールドを作成する

1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct の Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。

このページでは、Struct スキーマを定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択する方法と、データを挿入またはインデックス作成する前に適用されるスキーマルールについて説明します。

## 事前準備\{#before-you-begin}

Zilliz Cloud では、NULL 許容の StructArray フィールド、NULL 許容のベクトル配列、および StructArray フィールドの動的追加は、3.0.x 系の Milvus 3.0.0 以降を実行する On-Demand クラスターでサポートされています。Serving クラスターでは、これらの機能はサポートされていません。

作成、NULL 許容での作成、およびフィールド追加の例は、代替のワークフローです。同じコレクションに対してこれらを順番に実行しないでください。後続の例では、選択した言語のクライアント初期化を再利用してください。

このページでは、`tech_articles` という名前のコレクションを使用します。各エンティティは 1 つの技術記事を表し、`chunks` フィールドにはチャンクレベルのデータが Struct 要素として格納されます。

| フィールド | 型 | 用途 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事のプライマリキー。 |
| `title` | `VARCHAR` | 記事のタイトル。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルのベクトルフィールド。後のハイブリッド検索の例で使用します。 |
| `chunks` | `ARRAY` | チャンクレベルのテキスト、メタデータ、埋め込みを格納する StructArray フィールド。 |

`chunks` StructArray フィールドには、次のサブフィールドが含まれます。

| サブフィールド | 型 | 用途 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクのテキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | チャンクのページ番号または論理位置。 |
| `quality_score` | `FLOAT` | スカラーフィルタリングと範囲の例で使用するチャンクレベルのスコア。 |
| `has_code` | `BOOL` | チャンクにコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索用のベクトルサブフィールド。 |
| `emb` | `FLOAT_VECTOR` | 通常のベクトルメトリクスを使用した要素レベルの検索用のベクトルサブフィールド。 |

<Admonition type="info" icon="📘" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドで使用できるインデックスは 1 つだけです。EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの独立したベクトルサブフィールドを定義します。この例では、`chunks[emb_list_vector]` は EmbeddingList 検索用で、`chunks[emb]` は要素レベルの検索用です。

</Admonition>

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray フィールドは、Struct の各サブフィールドに対して 1 つの配列値を格納します。Struct スキーマを定義する場合は、サポートされているスカラーおよびベクトルの型ファミリーからサブフィールドの型を選択します。

| Struct サブフィールドの物理型 | サポート | 注記 |
| --- | --- | --- |
| `Array<Bool>` | サポート対象 | サブフィールドを `DataType.BOOL` として定義します。 |
| `Array<Int8/Int16/Int32/Int64>` | サポート対象 | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| `Array<Float/Double>` | サポート対象 | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| `Array<VarChar>` | サポート対象 | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| `ArrayOfVector<FloatVector>` | サポート対象 | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Float16Vector>` | サポート対象 | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BFloat16Vector>` | サポート対象 | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<Int8Vector>` | サポート対象 | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<BinaryVector>` | サポート対象 | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| `ArrayOfVector<SparseFloatVector>` | サポート対象外 | StructArray フィールドでは、スパースベクトルサブフィールドはサポートされていません。 |
| `Array<String>` | サポート対象外 | `String` ではなく `VARCHAR` を使用します。 |
| `Array<JSON>` | サポート対象外 | StructArray フィールドでは、JSON サブフィールドはサポートされていません。 |
| `Array<Geometry>` | サポート対象外 | StructArray フィールドでは、Geometry サブフィールドと GIS 関数はサポートされていません。 |
| `Array<Text>` | サポート対象外 | StructArray フィールドでは、テキストサブフィールドはサポートされていません。 |
| `Array<Timestamptz>` | サポート対象外 | StructArray フィールドでは、Timestamptz サブフィールドと時間固有の式はサポートされていません。 |
| Nested `Array`, `ArrayOfVector`, `Struct`, or `ArrayOfStruct` | サポート対象外 | StructArray フィールドでは、ネストされた配列、ベクトル配列、Struct、または Array-of-Struct のサブフィールドはサポートされていません。 |

バージョン固有のサポート、nullable の動作、その他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## StructArray フィールドを含むコレクションを作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素で使用する Struct スキーマを定義します。次に、Array フィールドを追加し、その要素タイプを Struct に設定します。

1. コレクションスキーマを作成します。

2. プライマリキーや記事レベルのフィールドなど、コレクションレベルのフィールドを追加します。

3. StructArray フィールド内に格納する要素の Struct スキーマを作成します。

4. Struct スキーマにスカラーサブフィールドとベクトルサブフィールドを追加します。

5. `element_type=DataType.STRUCT` を指定して Array フィールドを追加します。

6. `struct_schema` に Struct スキーマを設定します。

7. `max_capacity` を設定して、各エンティティがフィールドに格納できる Struct 要素の数を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(false);

// Collection-level fields.
schema.addField(AddFieldReq.builder()
        .fieldName("doc_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(128)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("title_vector")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());

// Add the StructArray field.
schema.addField(AddFieldReq.builder()
        .fieldName("chunks")
        .dataType(DataType.Array)
        .elementType(DataType.Struct)
        .maxCapacity(1000)
        .addStructField(AddFieldReq.builder()
                .fieldName("text")
                .dataType(DataType.VarChar)
                .maxLength(65535)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("section")
                .dataType(DataType.VarChar)
                .maxLength(128)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("page")
                .dataType(DataType.Int64)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("quality_score")
                .dataType(DataType.Float)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("has_code")
                .dataType(DataType.Bool)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("emb_list_vector")
                .dataType(DataType.FloatVector)
                .dimension(4)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("emb")
                .dataType(DataType.FloatVector)
                .dimension(4)
                .build())
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("tech_articles")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err)
    return
}

schema := entity.NewSchema().WithDynamicFieldEnabled(false)

// Collection-level fields.
schema.WithField(entity.NewField().
        WithName("doc_id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true))
schema.WithField(entity.NewField().
        WithName("title").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512))
schema.WithField(entity.NewField().
        WithName("category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
schema.WithField(entity.NewField().
        WithName("title_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// Struct schema used by each element in the StructArray field.
chunkSchema := entity.NewStructSchema()
chunkSchema.WithField(entity.NewField().
        WithName("text").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(65535))
chunkSchema.WithField(entity.NewField().
        WithName("section").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
chunkSchema.WithField(entity.NewField().
        WithName("page").
        WithDataType(entity.FieldTypeInt64))
chunkSchema.WithField(entity.NewField().
        WithName("quality_score").
        WithDataType(entity.FieldTypeFloat))
chunkSchema.WithField(entity.NewField().
        WithName("has_code").
        WithDataType(entity.FieldTypeBool))
chunkSchema.WithField(entity.NewField().
        WithName("emb_list_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))
chunkSchema.WithField(entity.NewField().
        WithName("emb").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// Add the StructArray field.
schema.WithField(entity.NewField().
        WithName("chunks").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeStruct).
        WithMaxCapacity(1000).
        WithStructSchema(chunkSchema))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("tech_articles", schema))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

// Collection-level fields.
let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(
        FieldSchema::new()
            .name("doc_id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("title")
            .data_type(DataType::VarChar)
            .max_length(512),
    )
    .add_field(
        FieldSchema::new()
            .name("category")
            .data_type(DataType::VarChar)
            .max_length(128),
    )
    .add_field(
        FieldSchema::new()
            .name("title_vector")
            .data_type(DataType::FloatVector)
            .dimension(4),
    )
    // Struct schema used by each element in the StructArray field.
    .add_struct_field(
        StructFieldSchema::new()
            .name("chunks")
            .max_capacity(1000)
            .add_field(
                FieldSchema::new()
                    .name("text")
                    .data_type(DataType::VarChar)
                    .max_length(65535),
            )
            .add_field(
                FieldSchema::new()
                    .name("section")
                    .data_type(DataType::VarChar)
                    .max_length(128),
            )
            .add_field(
                FieldSchema::new()
                    .name("page")
                    .data_type(DataType::Int64),
            )
            .add_field(
                FieldSchema::new()
                    .name("quality_score")
                    .data_type(DataType::Float),
            )
            .add_field(
                FieldSchema::new()
                    .name("has_code")
                    .data_type(DataType::Bool),
            )
            .add_field(
                FieldSchema::new()
                    .name("emb_list_vector")
                    .data_type(DataType::FloatVector)
                    .dimension(4),
            )
            .add_field(
                FieldSchema::new()
                    .name("emb")
                    .data_type(DataType::FloatVector)
                    .dimension(4),
            ),
    );

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("tech_articles")
            .schema(schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <utility>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

milvus::CollectionSchemaPtr collection_schema = std::make_shared<milvus::CollectionSchema>();
collection_schema->SetEnableDynamicField(false);

// Collection-level fields.
collection_schema->AddField(milvus::FieldSchema("doc_id", milvus::DataType::INT64, "", true, false));
collection_schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR).WithMaxLength(512));
collection_schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(128));
collection_schema->AddField(milvus::FieldSchema("title_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

// Struct schema used by each element in the StructArray field.
milvus::StructFieldSchema struct_schema =
    milvus::StructFieldSchema()
        .WithName("chunks")
        .WithMaxCapacity(1000)
        .AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535))
        .AddField(milvus::FieldSchema("section", milvus::DataType::VARCHAR).WithMaxLength(128))
        .AddField(milvus::FieldSchema("page", milvus::DataType::INT64))
        .AddField(milvus::FieldSchema("quality_score", milvus::DataType::FLOAT))
        .AddField(milvus::FieldSchema("has_code", milvus::DataType::BOOL))
        .AddField(milvus::FieldSchema("emb_list_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4))
        .AddField(milvus::FieldSchema("emb", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
collection_schema->AddStructField(std::move(struct_schema));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                     .WithCollectionName("tech_articles")
                                     .WithCollectionSchema(collection_schema));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "tech_articles",
  enable_dynamic_field: false,
  fields: [
    // Collection-level fields.
    { name: "doc_id", data_type: DataType.Int64, is_primary_key: true },
    { name: "title", data_type: DataType.VarChar, max_length: 512 },
    { name: "category", data_type: DataType.VarChar, max_length: 128 },
    { name: "title_vector", data_type: DataType.FloatVector, dim: 4 },
    // StructArray field.
    {
      name: "chunks",
      data_type: DataType.Array,
      element_type: DataType.Struct,
      max_capacity: 1000,
      fields: [
        { name: "text", data_type: DataType.VarChar, max_length: 65535 },
        { name: "section", data_type: DataType.VarChar, max_length: 128 },
        { name: "page", data_type: DataType.Int64 },
        { name: "quality_score", data_type: DataType.Float },
        { name: "has_code", data_type: DataType.Bool },
        { name: "emb_list_vector", data_type: DataType.FloatVector, dim: 4 },
        { name: "emb", data_type: DataType.FloatVector, dim: 4 },
      ],
    },
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

CollectionSchema schema = new()
{
    EnableDynamicFields = false,
    Fields =
    {
        // Collection-level fields.
        new FieldSchema("doc_id", DataType.Int64, isPrimaryKey: true),
        FieldSchema.CreateVarchar("title", 512),
        FieldSchema.CreateVarchar("category", 128),
        new FieldSchema("title_vector", DataType.FloatVector) { Dimension = 4 }
    }
};

// StructArray field.
var chunks = new StructFieldSchema("chunks")
{
    MaxCapacity = 1000
};
chunks.Fields.Add(FieldSchema.CreateVarchar("text", 65535));
chunks.Fields.Add(FieldSchema.CreateVarchar("section", 128));
chunks.Fields.Add(new FieldSchema("page", DataType.Int64));
chunks.Fields.Add(new FieldSchema("quality_score", DataType.Float));
chunks.Fields.Add(new FieldSchema("has_code", DataType.Bool));
chunks.Fields.Add(new FieldSchema("emb_list_vector", DataType.FloatVector) { Dimension = 4 });
chunks.Fields.Add(new FieldSchema("emb", DataType.FloatVector) { Dimension = 4 });
schema.StructFields.Add(chunks);

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "tech_articles",
    Schema = schema
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "autoID": false,
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "doc_id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "title", "dataType": "VarChar", "elementTypeParams": {"max_length": "512"}},
        {"fieldName": "category", "dataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
        {"fieldName": "title_vector", "dataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
      ],
      "structFields": [
        {
          "fieldName": "chunks",
          "typeParams": {"max_capacity": "1000"},
          "fields": [
            {"fieldName": "text", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "65535"}},
            {"fieldName": "section", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
            {"fieldName": "page", "dataType": "Array", "elementDataType": "Int64"},
            {"fieldName": "quality_score", "dataType": "Array", "elementDataType": "Float"},
            {"fieldName": "has_code", "dataType": "Array", "elementDataType": "Bool"},
            {"fieldName": "emb_list_vector", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}},
            {"fieldName": "emb", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
          ]
        }
      ]
    }
  }'
```

</TabItem>

</Tabs>

## StructArray フィールドのパスを理解する\{#understand-structarray-field-paths}

StructArray フィールドを作成した後は、`structArray[subfield]` パス構文を使用してそのサブフィールドを参照します。この構文は、インデックスを作成するとき、ベクトルサブフィールドを検索するとき、サブフィールドを出力するとき、またはスカラーフィルターを構築するときに使用します。

| パス | 意味 | 一般的な用途 |
| --- | --- | --- |
| `chunks[text]` | 各 Struct 要素内の `text` サブフィールド。 | 出力フィールドまたはスカラーフィルタリング。 |
| `chunks[section]` | 各チャンクのセクションラベル。 | スカラーフィルタリング。 |
| `chunks[quality_score]` | チャンクレベルの品質スコア。 | スカラーフィルタリングまたはスカラーインデックス。 |
| `chunks[emb_list_vector]` | 埋め込みリストとして使用されるベクトルサブフィールド。 | `MAX_SIM*` を使用した EmbeddingList 検索。 |
| `chunks[emb]` | 各 Struct 要素が個別に使用するベクトルサブフィールド。 | 要素レベルのベクトル検索。 |

## StructArray フィールドを null 許容にする\{#make-a-structarray-field-nullable}

NULL 許容の StructArray フィールドでは、上記の可用性の条件に従い、エンティティはフィールド全体に NULL を格納できます。以下は、前述のコレクション作成例を完全に置き換える代替例です。`tech_articles` が存在しない場合にのみ実行してください。コレクションを作成する前に、StructArray の親で `nullable` を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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
    nullable=True,
    max_capacity=1000,
)

client.create_collection(
    collection_name="tech_articles",
    schema=schema,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(false);

// Collection-level fields.
schema.addField(AddFieldReq.builder()
        .fieldName("doc_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(128)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("title_vector")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());

// Add the StructArray field.
schema.addField(AddFieldReq.builder()
        .fieldName("chunks")
        .dataType(DataType.Array)
        .elementType(DataType.Struct)
        .maxCapacity(1000)
        .isNullable(Boolean.TRUE)
        .addStructField(AddFieldReq.builder()
                .fieldName("text")
                .dataType(DataType.VarChar)
                .maxLength(65535)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("section")
                .dataType(DataType.VarChar)
                .maxLength(128)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("page")
                .dataType(DataType.Int64)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("quality_score")
                .dataType(DataType.Float)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("has_code")
                .dataType(DataType.Bool)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("emb_list_vector")
                .dataType(DataType.FloatVector)
                .dimension(4)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("emb")
                .dataType(DataType.FloatVector)
                .dimension(4)
                .build())
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName("tech_articles")
        .collectionSchema(schema)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err)
    return
}

schema := entity.NewSchema().WithDynamicFieldEnabled(false)

// Collection-level fields.
schema.WithField(entity.NewField().
        WithName("doc_id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true))
schema.WithField(entity.NewField().
        WithName("title").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512))
schema.WithField(entity.NewField().
        WithName("category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
schema.WithField(entity.NewField().
        WithName("title_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// Struct schema used by each element in the StructArray field.
chunkSchema := entity.NewStructSchema()
chunkSchema.WithField(entity.NewField().
        WithName("text").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(65535))
chunkSchema.WithField(entity.NewField().
        WithName("section").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
chunkSchema.WithField(entity.NewField().
        WithName("page").
        WithDataType(entity.FieldTypeInt64))
chunkSchema.WithField(entity.NewField().
        WithName("quality_score").
        WithDataType(entity.FieldTypeFloat))
chunkSchema.WithField(entity.NewField().
        WithName("has_code").
        WithDataType(entity.FieldTypeBool))
chunkSchema.WithField(entity.NewField().
        WithName("emb_list_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))
chunkSchema.WithField(entity.NewField().
        WithName("emb").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

// Add the StructArray field.
schema.WithField(entity.NewField().
        WithName("chunks").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeStruct).
        WithMaxCapacity(1000).
        WithNullable(true).
        WithStructSchema(chunkSchema))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("tech_articles", schema))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

// Collection-level fields.
let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(
        FieldSchema::new()
            .name("doc_id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("title")
            .data_type(DataType::VarChar)
            .max_length(512),
    )
    .add_field(
        FieldSchema::new()
            .name("category")
            .data_type(DataType::VarChar)
            .max_length(128),
    )
    .add_field(
        FieldSchema::new()
            .name("title_vector")
            .data_type(DataType::FloatVector)
            .dimension(4),
    )
    // Struct schema used by each element in the StructArray field.
    .add_struct_field(
        StructFieldSchema::new()
            .name("chunks")
            .max_capacity(1000)
            .nullable(true)
            .add_field(
                FieldSchema::new()
                    .name("text")
                    .data_type(DataType::VarChar)
                    .max_length(65535),
            )
            .add_field(
                FieldSchema::new()
                    .name("section")
                    .data_type(DataType::VarChar)
                    .max_length(128),
            )
            .add_field(
                FieldSchema::new()
                    .name("page")
                    .data_type(DataType::Int64),
            )
            .add_field(
                FieldSchema::new()
                    .name("quality_score")
                    .data_type(DataType::Float),
            )
            .add_field(
                FieldSchema::new()
                    .name("has_code")
                    .data_type(DataType::Bool),
            )
            .add_field(
                FieldSchema::new()
                    .name("emb_list_vector")
                    .data_type(DataType::FloatVector)
                    .dimension(4),
            )
            .add_field(
                FieldSchema::new()
                    .name("emb")
                    .data_type(DataType::FloatVector)
                    .dimension(4),
            ),
    );

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("tech_articles")
            .schema(schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <utility>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

milvus::CollectionSchemaPtr collection_schema = std::make_shared<milvus::CollectionSchema>();
collection_schema->SetEnableDynamicField(false);

// Collection-level fields.
collection_schema->AddField(milvus::FieldSchema("doc_id", milvus::DataType::INT64, "", true, false));
collection_schema->AddField(milvus::FieldSchema("title", milvus::DataType::VARCHAR).WithMaxLength(512));
collection_schema->AddField(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(128));
collection_schema->AddField(milvus::FieldSchema("title_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

// Struct schema used by each element in the StructArray field.
milvus::StructFieldSchema struct_schema =
    milvus::StructFieldSchema()
        .WithName("chunks")
        .WithMaxCapacity(1000)
        .WithNullable(true)
        .AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535))
        .AddField(milvus::FieldSchema("section", milvus::DataType::VARCHAR).WithMaxLength(128))
        .AddField(milvus::FieldSchema("page", milvus::DataType::INT64))
        .AddField(milvus::FieldSchema("quality_score", milvus::DataType::FLOAT))
        .AddField(milvus::FieldSchema("has_code", milvus::DataType::BOOL))
        .AddField(milvus::FieldSchema("emb_list_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4))
        .AddField(milvus::FieldSchema("emb", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
collection_schema->AddStructField(std::move(struct_schema));

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                     .WithCollectionName("tech_articles")
                                     .WithCollectionSchema(collection_schema));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

await client.createCollection({
  collection_name: "tech_articles",
  enable_dynamic_field: false,
  fields: [
    // Collection-level fields.
    { name: "doc_id", data_type: DataType.Int64, is_primary_key: true },
    { name: "title", data_type: DataType.VarChar, max_length: 512 },
    { name: "category", data_type: DataType.VarChar, max_length: 128 },
    { name: "title_vector", data_type: DataType.FloatVector, dim: 4 },
    // StructArray field.
    {
      name: "chunks",
      data_type: DataType.Array,
      element_type: DataType.Struct,
      max_capacity: 1000,
      nullable: true,
      fields: [
        { name: "text", data_type: DataType.VarChar, max_length: 65535 },
        { name: "section", data_type: DataType.VarChar, max_length: 128 },
        { name: "page", data_type: DataType.Int64 },
        { name: "quality_score", data_type: DataType.Float },
        { name: "has_code", data_type: DataType.Bool },
        { name: "emb_list_vector", data_type: DataType.FloatVector, dim: 4 },
        { name: "emb", data_type: DataType.FloatVector, dim: 4 },
      ],
    },
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

CollectionSchema schema = new()
{
    EnableDynamicFields = false,
    Fields =
    {
        // Collection-level fields.
        new FieldSchema("doc_id", DataType.Int64, isPrimaryKey: true),
        FieldSchema.CreateVarchar("title", 512),
        FieldSchema.CreateVarchar("category", 128),
        new FieldSchema("title_vector", DataType.FloatVector) { Dimension = 4 }
    }
};

// StructArray field.
var chunks = new StructFieldSchema("chunks")
{
    MaxCapacity = 1000,
    Nullable = true
};
chunks.Fields.Add(FieldSchema.CreateVarchar("text", 65535));
chunks.Fields.Add(FieldSchema.CreateVarchar("section", 128));
chunks.Fields.Add(new FieldSchema("page", DataType.Int64));
chunks.Fields.Add(new FieldSchema("quality_score", DataType.Float));
chunks.Fields.Add(new FieldSchema("has_code", DataType.Bool));
chunks.Fields.Add(new FieldSchema("emb_list_vector", DataType.FloatVector) { Dimension = 4 });
chunks.Fields.Add(new FieldSchema("emb", DataType.FloatVector) { Dimension = 4 });
schema.StructFields.Add(chunks);

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "tech_articles",
    Schema = schema
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "autoID": false,
      "enableDynamicField": false,
      "fields": [
        {"fieldName": "doc_id", "dataType": "Int64", "isPrimary": true},
        {"fieldName": "title", "dataType": "VarChar", "elementTypeParams": {"max_length": "512"}},
        {"fieldName": "category", "dataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
        {"fieldName": "title_vector", "dataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
      ],
      "structFields": [
        {
          "fieldName": "chunks",
          "nullable": true,
          "typeParams": {"max_capacity": "1000"},
          "fields": [
            {"fieldName": "text", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "65535"}},
            {"fieldName": "section", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
            {"fieldName": "page", "dataType": "Array", "elementDataType": "Int64"},
            {"fieldName": "quality_score", "dataType": "Array", "elementDataType": "Float"},
            {"fieldName": "has_code", "dataType": "Array", "elementDataType": "Bool"},
            {"fieldName": "emb_list_vector", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}},
            {"fieldName": "emb", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
          ]
        }
      ]
    }
  }'
```

</TabItem>

</Tabs>

<Admonition type="info" icon="📘" title="Notes">

NULL は StructArray フィールド全体に適用されます。個々の Struct サブフィールドを独立して NULL 許容に設定しないでください。有効な StructArray 値を指定する場合は、NULL のサブフィールド配列と有効なサブフィールド配列を混在させないでください。詳細は、[StructArray の制限](./struct-array-limits) を参照してください。

</Admonition>

## 既存のコレクションに StructArray フィールドを追加する\{#add-a-structarray-field-to-an-existing-collection}

上記の可用性の条件に従い、既存のコレクションに StructArray フィールドを追加できます。追加する StructArray フィールドは NULL 許容である必要があります。これは、コレクションに既に存在するエンティティには、新しいフィールドの値がないためです。

この代替ワークフローでは、最初の例に含まれる 4 つのコレクションレベルのフィールドを持ち、`chunks` フィールドを持たない `tech_articles` から始めます。選択した言語で初期化したクライアントを再利用します。完全な Struct スキーマを定義し、親を NULL 許容としてマークしたうえでフィールドを追加します。このスキーマ操作は、コレクションの動的フィールド設定（`enable_dynamic_field`）とは独立しており、Struct 内で任意のサブフィールドを有効にするものではありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionStructFieldReq;
import io.milvus.v2.service.collection.request.AddFieldReq;

client.addCollectionStructField(AddCollectionStructFieldReq.builder()
        .collectionName("tech_articles")
        .fieldName("chunks")
        .maxCapacity(1000)
        .nullable(Boolean.TRUE)
        .addStructField(AddFieldReq.builder().fieldName("text").dataType(DataType.VarChar).maxLength(65535).build())
        .addStructField(AddFieldReq.builder().fieldName("section").dataType(DataType.VarChar).maxLength(128).build())
        .addStructField(AddFieldReq.builder().fieldName("page").dataType(DataType.Int64).build())
        .addStructField(AddFieldReq.builder().fieldName("quality_score").dataType(DataType.Float).build())
        .addStructField(AddFieldReq.builder().fieldName("has_code").dataType(DataType.Bool).build())
        .addStructField(AddFieldReq.builder().fieldName("emb_list_vector").dataType(DataType.FloatVector).dimension(4).build())
        .addStructField(AddFieldReq.builder().fieldName("emb").dataType(DataType.FloatVector).dimension(4).build())
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

chunkSchema := entity.NewStructSchema()
chunkSchema.WithField(entity.NewField().
        WithName("text").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(65535))
chunkSchema.WithField(entity.NewField().
        WithName("section").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(128))
chunkSchema.WithField(entity.NewField().
        WithName("page").
        WithDataType(entity.FieldTypeInt64))
chunkSchema.WithField(entity.NewField().
        WithName("quality_score").
        WithDataType(entity.FieldTypeFloat))
chunkSchema.WithField(entity.NewField().
        WithName("has_code").
        WithDataType(entity.FieldTypeBool))
chunkSchema.WithField(entity.NewField().
        WithName("emb_list_vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))
chunkSchema.WithField(entity.NewField().
        WithName("emb").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(4))

structField := entity.NewField().
        WithName("chunks").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeStruct).
        WithMaxCapacity(1000).
        WithNullable(true).
        WithStructSchema(chunkSchema)

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("tech_articles", structField))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let chunk_schema = StructFieldSchema::new()
    .name("chunks")
    .max_capacity(1000)
    .nullable(true)
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(65535))
    .add_field(FieldSchema::new().name("section").data_type(DataType::VarChar).max_length(128))
    .add_field(FieldSchema::new().name("page").data_type(DataType::Int64))
    .add_field(FieldSchema::new().name("quality_score").data_type(DataType::Float))
    .add_field(FieldSchema::new().name("has_code").data_type(DataType::Bool))
    .add_field(FieldSchema::new().name("emb_list_vector").data_type(DataType::FloatVector).dimension(4))
    .add_field(FieldSchema::new().name("emb").data_type(DataType::FloatVector).dimension(4));

client
    .add_collection_struct_field(
        AddCollectionStructFieldRequest::builder()
            .collection_name("tech_articles")
            .struct_field(chunk_schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <utility>
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

milvus::StructFieldSchema struct_schema =
    milvus::StructFieldSchema()
        .WithName("chunks")
        .WithMaxCapacity(1000)
        .WithNullable(true)
        .AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535))
        .AddField(milvus::FieldSchema("section", milvus::DataType::VARCHAR).WithMaxLength(128))
        .AddField(milvus::FieldSchema("page", milvus::DataType::INT64))
        .AddField(milvus::FieldSchema("quality_score", milvus::DataType::FLOAT))
        .AddField(milvus::FieldSchema("has_code", milvus::DataType::BOOL))
        .AddField(milvus::FieldSchema("emb_list_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4))
        .AddField(milvus::FieldSchema("emb", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

status = client->AddCollectionStructField(milvus::AddCollectionStructFieldRequest()
                                                   .WithCollectionName("tech_articles")
                                                   .WithStructField(std::move(struct_schema)));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addCollectionField({
  collection_name: "tech_articles",
  field: {
    name: "chunks",
    data_type: DataType.Array,
    element_type: DataType.Struct,
    nullable: true,
    max_capacity: 1000,
    fields: [
      { name: "text", data_type: DataType.VarChar, max_length: 65535 },
      { name: "section", data_type: DataType.VarChar, max_length: 128 },
      { name: "page", data_type: DataType.Int64 },
      { name: "quality_score", data_type: DataType.Float },
      { name: "has_code", data_type: DataType.Bool },
      { name: "emb_list_vector", data_type: DataType.FloatVector, dim: 4 },
      { name: "emb", data_type: DataType.FloatVector, dim: 4 },
    ],
  },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

var addedChunkSchema = new StructFieldSchema("chunks")
{
    MaxCapacity = 1000,
    Nullable = true
};
addedChunkSchema.Fields.Add(FieldSchema.CreateVarchar("text", 65535));
addedChunkSchema.Fields.Add(FieldSchema.CreateVarchar("section", 128));
addedChunkSchema.Fields.Add(new FieldSchema("page", DataType.Int64));
addedChunkSchema.Fields.Add(new FieldSchema("quality_score", DataType.Float));
addedChunkSchema.Fields.Add(new FieldSchema("has_code", DataType.Bool));
addedChunkSchema.Fields.Add(new FieldSchema("emb_list_vector", DataType.FloatVector) { Dimension = 4 });

addedChunkSchema.Fields.Add(new FieldSchema("emb", DataType.FloatVector) { Dimension = 4 });

await client.AddCollectionStructFieldAsync(new AddCollectionStructFieldReq
{
    CollectionName = "tech_articles",
    StructField = addedChunkSchema
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/struct_fields/add" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "fieldName": "chunks",
      "dataType": "Array",
      "elementDataType": "Struct",
      "nullable": true,
      "typeParams": {"max_capacity": "1000"},
      "fields": [
        {"fieldName": "text", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "65535"}},
        {"fieldName": "section", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
        {"fieldName": "page", "dataType": "Array", "elementDataType": "Int64"},
        {"fieldName": "quality_score", "dataType": "Array", "elementDataType": "Float"},
        {"fieldName": "has_code", "dataType": "Array", "elementDataType": "Bool"},
        {"fieldName": "emb_list_vector", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}},
        {"fieldName": "emb", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
      ]
    }
  }'
```

</TabItem>

</Tabs>

StructArray フィールドを追加した後、既存のエンティティは、そのフィールドにデータを入力するまで、新しいフィールドに対して NULL を返します。

StructArray フィールドを作成した後は、その既存のフィールドにサブフィールドを追加することはできません。次の別の例では、`chunks` を、元の 7 つのサブフィールドと新しい `source` 文字列サブフィールドを含むスキーマに置き換えます。

フィールドを削除すると、そのデータも削除されます。再度追加しても以前の値は復元されません。必要なデータを保持し、[Alter コレクション スキーマ](./add-fields-to-an-existing-collection) の事前準備に従ってから、置き換えたフィールドにデータを再入力し、インデックスを再作成してください。この例ではコレクションレベルの `title_vector` フィールドを保持するため、`chunks` を削除してもコレクションからすべてのベクトルフィールドが削除されることはありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
updated_chunk_schema = client.create_struct_field_schema()
updated_chunk_schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=65535,
)
updated_chunk_schema.add_field(
    field_name="section",
    datatype=DataType.VARCHAR,
    max_length=128,
)
updated_chunk_schema.add_field(
    field_name="page",
    datatype=DataType.INT64,
)
updated_chunk_schema.add_field(
    field_name="quality_score",
    datatype=DataType.FLOAT,
)
updated_chunk_schema.add_field(
    field_name="has_code",
    datatype=DataType.BOOL,
)
updated_chunk_schema.add_field(
    field_name="emb_list_vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)
updated_chunk_schema.add_field(
    field_name="emb",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
)

updated_chunk_schema.add_field(
    field_name="source",
    datatype=DataType.VARCHAR,
    max_length=256,
)

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionStructFieldReq;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.DropCollectionFieldReq;

client.dropCollectionField(DropCollectionFieldReq.builder()
        .collectionName("tech_articles")
        .fieldName("chunks")
        .build());

client.addCollectionStructField(AddCollectionStructFieldReq.builder()
        .collectionName("tech_articles")
        .fieldName("chunks")
        .maxCapacity(1000)
        .nullable(Boolean.TRUE)
        .addStructField(AddFieldReq.builder().fieldName("source").dataType(DataType.VarChar).maxLength(256).build())
        .addStructField(AddFieldReq.builder().fieldName("text").dataType(DataType.VarChar).maxLength(65535).build())
        .addStructField(AddFieldReq.builder().fieldName("section").dataType(DataType.VarChar).maxLength(128).build())
        .addStructField(AddFieldReq.builder().fieldName("page").dataType(DataType.Int64).build())
        .addStructField(AddFieldReq.builder().fieldName("quality_score").dataType(DataType.Float).build())
        .addStructField(AddFieldReq.builder().fieldName("has_code").dataType(DataType.Bool).build())
        .addStructField(AddFieldReq.builder().fieldName("emb_list_vector").dataType(DataType.FloatVector).dimension(4).build())
        .addStructField(AddFieldReq.builder().fieldName("emb").dataType(DataType.FloatVector).dimension(4).build())
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

updatedStructField := entity.NewField().
    WithName("chunks").
    WithDataType(entity.FieldTypeArray).
    WithElementType(entity.FieldTypeStruct).
    WithMaxCapacity(1000).
    WithNullable(true).
    WithStructSchema(entity.NewStructSchema().
        WithField(entity.NewField().WithName("source").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256)).
        WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(65535)).
        WithField(entity.NewField().WithName("section").WithDataType(entity.FieldTypeVarChar).WithMaxLength(128)).
        WithField(entity.NewField().WithName("page").WithDataType(entity.FieldTypeInt64)).
        WithField(entity.NewField().WithName("quality_score").WithDataType(entity.FieldTypeFloat)).
        WithField(entity.NewField().WithName("has_code").WithDataType(entity.FieldTypeBool)).
        WithField(entity.NewField().WithName("emb_list_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(4)).
        WithField(entity.NewField().WithName("emb").WithDataType(entity.FieldTypeFloatVector).WithDim(4)))

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("tech_articles", "chunks"))
if err != nil {
    fmt.Println(err)
    return
}

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("tech_articles", updatedStructField))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let updated_chunk_schema = StructFieldSchema::new()
    .name("chunks")
    .max_capacity(1000)
    .nullable(true)
    .add_field(FieldSchema::new().name("source").data_type(DataType::VarChar).max_length(256))
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(65_535))
    .add_field(FieldSchema::new().name("section").data_type(DataType::VarChar).max_length(128))
    .add_field(FieldSchema::new().name("page").data_type(DataType::Int64))
    .add_field(FieldSchema::new().name("quality_score").data_type(DataType::Float))
    .add_field(FieldSchema::new().name("has_code").data_type(DataType::Bool))
    .add_field(FieldSchema::new().name("emb_list_vector").data_type(DataType::FloatVector).dimension(4))
    .add_field(FieldSchema::new().name("emb").data_type(DataType::FloatVector).dimension(4));

client
    .drop_collection_field(
        DropCollectionFieldRequest::builder()
            .collection_name("tech_articles")
            .field_name("chunks")
            .build()?,
    )
    .await?;

client
    .add_collection_struct_field(
        AddCollectionStructFieldRequest::builder()
            .collection_name("tech_articles")
            .struct_field(updated_chunk_schema)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <utility>
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

milvus::StructFieldSchema updated_struct_schema("chunks");
updated_struct_schema.WithMaxCapacity(1000).WithNullable(true);
updated_struct_schema.AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535));
updated_struct_schema.AddField(milvus::FieldSchema("section", milvus::DataType::VARCHAR).WithMaxLength(128));
updated_struct_schema.AddField(milvus::FieldSchema("page", milvus::DataType::INT64));
updated_struct_schema.AddField(milvus::FieldSchema("quality_score", milvus::DataType::FLOAT));
updated_struct_schema.AddField(milvus::FieldSchema("has_code", milvus::DataType::BOOL));
updated_struct_schema.AddField(milvus::FieldSchema("emb_list_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
updated_struct_schema.AddField(milvus::FieldSchema("emb", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

updated_struct_schema.AddField(milvus::FieldSchema("source", milvus::DataType::VARCHAR).WithMaxLength(256));

status = client->DropCollectionField(milvus::DropCollectionFieldRequest()
                                         .WithCollectionName("tech_articles")
                                         .WithFieldName("chunks"));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

status = client->AddCollectionStructField(milvus::AddCollectionStructFieldRequest()
                                              .WithCollectionName("tech_articles")
                                              .WithStructField(std::move(updated_struct_schema)));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropCollectionField({
  collection_name: "tech_articles",
  field_name: "chunks",
});

await client.addCollectionField({
  collection_name: "tech_articles",
  field: {
    name: "chunks",
    data_type: DataType.Array,
    element_type: DataType.Struct,
    nullable: true,
    max_capacity: 1000,
    fields: [
      { name: "source", data_type: DataType.VarChar, max_length: 256 },
      { name: "text", data_type: DataType.VarChar, max_length: 65535 },
      { name: "section", data_type: DataType.VarChar, max_length: 128 },
      { name: "page", data_type: DataType.Int64 },
      { name: "quality_score", data_type: DataType.Float },
      { name: "has_code", data_type: DataType.Bool },
      { name: "emb_list_vector", data_type: DataType.FloatVector, dim: 4 },
      { name: "emb", data_type: DataType.FloatVector, dim: 4 },
    ],
  },
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Types;

var updatedChunkSchema = new StructFieldSchema("chunks")
{
    MaxCapacity = 1000,
    Nullable = true
};
updatedChunkSchema.Fields.Add(FieldSchema.CreateVarchar("text", 65535));
updatedChunkSchema.Fields.Add(FieldSchema.CreateVarchar("section", 128));
updatedChunkSchema.Fields.Add(new FieldSchema("page", DataType.Int64));
updatedChunkSchema.Fields.Add(new FieldSchema("quality_score", DataType.Float));
updatedChunkSchema.Fields.Add(new FieldSchema("has_code", DataType.Bool));
updatedChunkSchema.Fields.Add(new FieldSchema("emb_list_vector", DataType.FloatVector) { Dimension = 4 });
updatedChunkSchema.Fields.Add(new FieldSchema("emb", DataType.FloatVector) { Dimension = 4 });

updatedChunkSchema.Fields.Add(FieldSchema.CreateVarchar("source", 256));

await client.DropCollectionFieldAsync(new DropCollectionFieldReq
{
    CollectionName = "tech_articles",
    FieldName = "chunks"
});

await client.AddCollectionStructFieldAsync(new AddCollectionStructFieldReq
{
    CollectionName = "tech_articles",
    StructField = updatedChunkSchema
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/drop" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "fieldName": "chunks"
  }'

curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/struct_fields/add" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "fieldName": "chunks",
      "dataType": "Array",
      "elementDataType": "Struct",
      "nullable": true,
      "typeParams": {"max_capacity": "1000"},
      "fields": [
        {"fieldName": "source", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "256"}},
        {"fieldName": "text", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "65535"}},
        {"fieldName": "section", "dataType": "Array", "elementDataType": "VarChar", "elementTypeParams": {"max_length": "128"}},
        {"fieldName": "page", "dataType": "Array", "elementDataType": "Int64"},
        {"fieldName": "quality_score", "dataType": "Array", "elementDataType": "Float"},
        {"fieldName": "has_code", "dataType": "Array", "elementDataType": "Bool"},
        {"fieldName": "emb_list_vector", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}},
        {"fieldName": "emb", "dataType": "ArrayOfVector", "elementDataType": "FloatVector", "elementTypeParams": {"dim": "4"}}
      ]
    }
  }'
```

</TabItem>

</Tabs>

## スキーマルール\{#schema-rules}

| ルール | 説明 |
| --- | --- |
| Struct は Array の要素タイプとして使用します。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成します。Struct をトップレベルのコレクションフィールドとして作成しないでください。 |
| すべての要素が 1 つのスキーマを共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールドに定義された Struct スキーマに従います。 |
| `max_capacity` は必須です。 | 各エンティティが StructArray フィールドに格納できる Struct 要素の数を制限します。 |
| サポートされているサブフィールド型のみ使用できます。 | StructArray でサポートされているスカラーおよびベクトルのサブフィールド型を使用します。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct / Array サブフィールドを定義しないでください。 |
| ベクトルサブフィールドには検索前のインデックスが必要です。 | ベクトル検索を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` などのパスにインデックスを作成します。 |
| 1 つのベクトルサブフィールドには 1 つのインデックスがあります。 | EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの独立したベクトルサブフィールドを作成します。 |
| 既存の StructArray サブフィールドは固定です。 | StructArray フィールドを作成した後は、同じ StructArray フィールドにさらにサブフィールドを追加できると想定しないでください。 |
| Struct 内では関数はサポートされません。 | StructArray フィールド内のフィールドまたはサブフィールドに関数を定義しないでください。 |
| スカラーサブフィールドはフィルターのニーズに合わせます。 | `section`、`quality_score`、`has_code` などのフィールドは、後でフィルタリング、グループ化、または出力する必要がある場合にのみ追加します。 |

## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素タイプとして使用せず、トップレベルのコレクションフィールドとして作成する。

- StructArray フィールドで `max_capacity` の設定を忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Array、ネストされた Struct、または Array-of-Struct など、サポートされていないサブフィールド型を定義する。

- サブフィールド型として `String` を使用する。`VARCHAR` を使用し、`max_length` を設定してください。

- EmbeddingList 検索と要素レベルの検索の両方に 1 つのベクトルサブフィールドを使用する。

- ベクトルサブフィールドのみを追加し、`section`、`quality_score`、`has_code` など、フィルタリングに必要なスカラーサブフィールドを忘れる。

- ベクトルサブフィールドを `$[...]` スカラー述語の入力として扱う。ベクトル検索にはベクトルサブフィールドを、スカラー述語にはスカラーサブフィールドを使用してください。

- フィールドの作成後に、既存の StructArray フィールドに新しいサブフィールドを追加できると想定する。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` の代わりに、`chunks.emb` または `chunks.emb_list_vector` を使用する。

- null 許容の StructArray の動作がすべてのターゲットバージョンで使用できるとみなす。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[StructArray フィールドへのデータの挿入](./insert-struct-array) をお読みください。

2. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) をお読みください。

3. StructArray のベクトルサブフィールドを検索するには、[StructArray を使用した基本的なベクトル検索](./search-with-struct-array) をお読みください。

4. サポートされているデータ型、null 許容の動作、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) をお読みください。

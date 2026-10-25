---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
sidebar_label: "StructArray フィールドを作成する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct の Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。 | Cloud"
type: origin
token: RzSBwW7dUizQeekka9CcZ3Etnyg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray フィールドを作成する

1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct の Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、またはその両方を含めることができます。

このページでは、Struct スキーマを定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択する方法と、データを挿入またはインデックス作成する前に適用されるスキーマルールについて説明します。

## 事前準備\{#before-you-begin}

このページでは、`tech_articles` という名前のコレクションを使用します。各エンティティは 1 つの技術記事を表し、`chunks` フィールドにはチャンクレベルのデータが Struct 要素として格納されます。

| フィールド | 型 | 用途 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事のプライマリキー。 |
| `title` | `VARCHAR` | 記事のタイトル。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルのベクトルフィールド。後のハイブリッド検索の例で使用します。 |
| `chunks` | `ARRAY<STRUCT>` | チャンクレベルのテキスト、メタデータ、埋め込みを格納する StructArray フィールド。 |

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

<Admonition type="info" title="Notes">

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
| Nested `Array`, `ArrayOfVector`, `Struct`, or `ArrayOfStruct` | サポート対象外 | StructArray フィールドには、ネストされた配列、ネストされたベクトル配列、ネストされた Struct フィールド、またはネストされた Array-of-Struct フィールドを含めることはできません。 |

バージョン固有のサポート、nullable の動作、その他の制限については、[StructArray の制限](./struct-array-limits) を参照してください。

## StructArray フィールドを含むコレクションを作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素で使用する Struct スキーマを定義します。次に、Array フィールドを追加し、その要素タイプを Struct に設定します。

1. コレクションスキーマを作成します。

1. プライマリキーや記事レベルのフィールドなど、コレクションレベルのフィールドを追加します。

1. StructArray フィールド内に格納する要素の Struct スキーマを作成します。

1. Struct スキーマにスカラーサブフィールドとベクトルサブフィールドを追加します。

1. `element_type=DataType.STRUCT` を指定して Array フィールドを追加します。

1. `struct_schema` に Struct スキーマを設定します。

1. `max_capacity` を設定して、各エンティティがフィールドに格納できる Struct 要素の数を制限します。

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
import io.milvus.v2.service.collection.request.DropCollectionReq;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

client.dropCollection(DropCollectionReq.builder()
        .collectionName("tech_articles")
        .build());

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
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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
    std::cout << status.Message() << std::endl;
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
    Username = "root",
    Password = "Milvus"
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

Milvus v3.0.x と互換性のあるクラスターは、null 許容の StructArray フィールドをサポートしています。null 許容の StructArray フィールドでは、エンティティが StructArray フィールド全体に `null` を格納できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

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
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

schema.WithField(entity.NewField().
        WithName("chunks").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeStruct).
        WithMaxCapacity(1000).
        WithNullable(true).
        WithStructSchema(chunkSchema))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

StructFieldSchema::new()
    .name("chunks")
    .max_capacity(1000)
    .nullable(true)
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(65535));
```

</TabItem>

<TabItem value='c++'>

```c++
#include <utility>
#include "milvus/MilvusClientV2.h"

milvus::StructFieldSchema struct_schema =
    milvus::StructFieldSchema()
        .WithName("chunks")
        .WithMaxCapacity(1000)
        .WithNullable(true)
        .AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535));
collection_schema->AddStructField(std::move(struct_schema));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const chunksField = {
  name: "chunks",
  data_type: DataType.Array,
  element_type: DataType.Struct,
  max_capacity: 1000,
  nullable: true,
  fields: [
    { name: "text", data_type: DataType.VarChar, max_length: 65535 },
  ],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

// Add a StructArray field to the schema.
var chunks = new StructFieldSchema("chunks")
{
    MaxCapacity = 1000,
    Nullable = true
};
chunks.Fields.Add(FieldSchema.CreateVarchar("text", 65535));

schema.StructFields.Add(chunks);
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

<Admonition type="warning" title="Warning">

null 許容の StructArray フィールドは、Milvus v3.0.x と互換性のあるクラスターでのみ使用できます。null 許容の StructArray フィールドでは、エンティティは有効な StructArray 値を指定するか、フィールド全体を `null` に設定できます。有効な StructArray 値を挿入する場合、すべてのサブフィールドを null にするか、有効な値を持たせる必要があります。一部のサブフィールドを null に設定し、それ以外を有効な値に設定したエンティティを挿入すると、エラーになります。詳細については、[StructArray の制限](./struct-array-limits) を参照してください。

</Admonition>

## 既存のコレクションに StructArray フィールドを追加する\{#add-a-structarray-field-to-an-existing-collection}

Milvus v3.0.x と互換性のあるクラスターは、既存のコレクションへの StructArray フィールドの追加をサポートしています。コレクションにすでに存在するエンティティには新しいフィールドの値がないため、追加する StructArray フィールドは null 許容である必要があります。

既存のコレクションに StructArray フィールドを追加するには、まず Struct スキーマを定義します。次に、`add_collection_struct_field()` を呼び出し、`nullable=True` を設定します。

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

auto status = client->AddCollectionStructField(milvus::AddCollectionStructFieldRequest()
                                                   .WithCollectionName("tech_articles")
                                                   .WithStructField(std::move(struct_schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

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

StructArray フィールドを追加すると、既存のエンティティは、そのすべてのサブフィールドにわたる新しいフィールドに対して `null` を返します。

StructArray フィールドを作成した後は、その既存の StructArray フィールドに新しいサブフィールドを追加できません。後で要素の属性を追加する必要がある場合は、`drop_collection_field()` を呼び出して StructArray フィールドを削除し、更新した Struct スキーマで新しい StructArray フィールドを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

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
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

status = client->DropCollectionField(milvus::DropCollectionFieldRequest()
                                         .WithCollectionName("tech_articles")
                                         .WithFieldName("chunks"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AddCollectionStructField(milvus::AddCollectionStructFieldRequest()
                                              .WithCollectionName("tech_articles")
                                              .WithStructField(std::move(updated_struct_schema)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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
using Milvus.Client.V2.Requests.Collection;

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

1. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) をお読みください。

1. StructArray のベクトルサブフィールドを検索するには、[StructArray を使用した基本的なベクトル検索](./search-with-struct-array) をお読みください。

1. サポートされているデータ型、null 許容の動作、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) をお読みください。

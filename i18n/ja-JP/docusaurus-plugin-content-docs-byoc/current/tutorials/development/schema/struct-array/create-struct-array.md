---
title: "StructArray フィールドを作成する | BYOC"
slug: /create-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、およびスカラー配列サブフィールドを含めることができます。 | BYOC"
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
1 つのエンティティに構造化要素の順序付きリストを格納する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct である Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、およびスカラー配列サブフィールドを含めることができます。


このページでは、Struct スキーマを定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択する方法と、データを挿入またはインデックス作成する前に適用されるスキーマルールについて説明します。

## 事前準備\{#before-you-begin}

Zilliz Cloud では、NULL 許容の StructArray フィールドと StructArray フィールドの動的追加は On-Demand クラスターでサポートされています。動的に追加される StructArray フィールドは NULL 許容である必要があります。Serving クラスターではこれらの機能はサポートされていません。NULL 許容のベクトル配列、要素レベルの null 値、スカラー `ARRAY` サブフィールド、および StructArray サブフィールドの追加または削除は、Zilliz Cloud クラスターではまだ利用できません。

作成、NULL 許容での作成、要素 null での作成、およびフィールド追加の例は、それぞれ代替ワークフローです。同じコレクションに対して順番に実行しないでください。後続の例では、選択した言語のクライアント初期化を再利用してください。

このページでは、`tech_articles` という名前のコレクションを使用します。各エンティティは 1 つの技術記事を表し、`chunks` フィールドはチャンクレベルのデータを Struct 要素として格納します。

| フィールド | 型 | 用途 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事の主キーです。 |
| `title` | `VARCHAR` | 記事のタイトルです。 |
| `category` | `VARCHAR` | 記事レベルのカテゴリです。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルのベクトルフィールドです。後でハイブリッド検索の例で使用します。 |
| `chunks` | `ARRAY` | チャンクレベルのテキスト、メタデータ、埋め込みを格納する StructArray フィールドです。 |

`chunks` StructArray フィールドには、以下のサブフィールドが含まれます。

| サブフィールド | 型 | 用途 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクのテキストです。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名です。 |
| `page` | `INT64` | チャンクのページ番号または論理位置です。 |
| `quality_score` | `FLOAT` | スカラーフィルタリングと範囲の例で使用されるチャンクレベルのスコアです。 |
| `has_code` | `BOOL` | チャンクにコードが含まれているかどうかです。 |
| `emb_list_vector` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索用のベクトルサブフィールドです。 |
| `emb` | `FLOAT_VECTOR` | 通常のベクトルメトリクスを使用した要素レベル検索用のベクトルサブフィールドです。 |

<Admonition type="info" icon="📘" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドは、1 つのインデックスのみを受け付けます。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの個別のベクトルサブフィールドを定義します。この例では、`chunks[emb_list_vector]` は EmbeddingList 検索用、`chunks[emb]` は要素レベル検索用です。

</Admonition>

## サポートされるサブフィールドのデータ型\{#supported-subfield-data-types}

StructArray フィールドは、Struct の各サブフィールドに 1 つの配列値を格納します。Struct スキーマを定義するときは、サポートされているスカラー、スカラー配列、ベクトルの各ファミリーからサブフィールド型を選択します。


| Struct サブフィールドの物理型 | サポート | 注意 |
| --- | --- | --- |
| Array&lt;Bool&gt; | サポート対象 | サブフィールドを `DataType.BOOL` として定義します。 |
| Array&lt;Int8/Int16/Int32/Int64&gt; | サポート対象 | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、`DataType.INT64` のいずれかとして定義します。 |
| Array&lt;Float/Double&gt; | サポート対象 | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| Array&lt;VarChar&gt; | サポート対象 | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| ArrayOfVector&lt;FloatVector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Float16Vector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BFloat16Vector&gt; | サポート対象 | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Int8Vector&gt; | サポート対象 | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BinaryVector&gt; | サポート対象 | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;SparseFloatVector&gt; | 非サポート | スパースベクトルサブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;String&gt; | 非サポート | `String` ではなく `VARCHAR` を使用します。 |
| Array&lt;JSON&gt; | 非サポート | JSON サブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;Geometry&gt; | 非サポート | Geometry サブフィールドと GIS 関数は StructArray フィールドではサポートされていません。 |
| Array&lt;Text&gt; | 非サポート | Text サブフィールドは StructArray フィールドではサポートされていません。 |
| Array&lt;Timestamptz&gt; | 非サポート | Timestamptz サブフィールドと時間固有の式は StructArray フィールドではサポートされていません。 |
| Array&lt;Array&gt; | サポート対象 | サブフィールドを、スカラー `element_type` と内部配列用の `max_capacity` を指定した `DataType.ARRAY` として定義します。各 Struct 要素は 1 つの内部配列を保持します。 |
| `Array` の `Array` の `Array`、ベクトルの `Array`、`Struct`、または `ArrayOfStruct` | 非サポート | Struct 内の配列のネストは 1 レベルに制限され、内部配列はベクトルを保持できず、Struct にネストされた Struct または Array-of-Struct サブフィールドを含めることはできません。 |


バージョン固有のサポート、null 許容の動作、その他の制限については、[StructArray Limits](./struct-array-limits) を参照してください。

## StructArray フィールドを含むコレクションを作成する\{#create-a-collection-with-a-structarray-field}

StructArray フィールドを作成するには、まず各要素が使用する Struct スキーマを定義します。次に、Array フィールドを追加し、その要素タイプを Struct に設定します。

1. コレクションスキーマを作成します。

2. 主キーや記事レベルのフィールドなど、コレクションレベルのフィールドを追加します。

3. StructArray フィールド内に格納する要素の Struct スキーマを作成します。

4. Struct スキーマにスカラーサブフィールドとベクトルサブフィールドを追加します。

5. `element_type=DataType.STRUCT` を指定して Array フィールドを追加します。

6. `struct_schema` を Struct スキーマに設定します。

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

```cpp
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
## スカラー配列サブフィールドを追加する\{#add-a-scalar-array-subfield}

Struct サブフィールドはスカラー `ARRAY` にできます。各 Struct 要素は、たとえば各チャンクのタグのリストなど、1 つの内部配列を保持します。サブフィールドは、`DataType.ARRAY`、スカラーの `element_type`、および内部配列の `max_capacity` を指定して定義します。


```python
chunk_schema.add_field(
    field_name="tags",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=16,
    max_length=64,
)
```

配列サブフィールドには、次のルールが適用されます。

- 内部配列はスカラー値のみを保持します。ベクトル、Struct 要素、または別の配列を保持することはできません。

- サブフィールドの `max_capacity` は内部配列を制限します。StructArray フィールドの `max_capacity` は、引き続き Struct 要素の数を制限します。

- 配列サブフィールドではスカラーインデックスはサポートされていません。

- フィルターでは、`element_filter` または `MATCH_*` 内の `$[tags]`、あるいは `chunks[0][tags]` などの位置指定パスに対して `array_contains`、`array_contains_any`、`array_contains_all`、`array_length` を使用します。詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

## Struct 要素で null 値を許容する\{#allow-null-values-in-struct-elements}

スカラー、ベクトル、または配列のサブフィールドでは、個々の Struct 要素内でそのサブフィールドに null 値を許可できます（**要素レベルの null を許容するサブフィールド**）。スカラーまたはベクトルのサブフィールドでは `nullable=True` を設定します。配列サブフィールドでは、null の内部配列を許可するには `nullable=True` を、内部配列内で null 値を許可するには `element_nullable=True` を設定します。たとえば、チャンクで言語が検出されなくても、他のサブフィールドに値が保持されている場合があります。


次の例では、[Insert Data into StructArray Fields](./insert-struct-array) の要素レベルの null の例が前提とする完全なスキーマを持つ `tech_articles` を作成します。このスキーマは、最初の例のサブフィールドに、要素レベルの null を許容する `lang` サブフィールドと、要素レベルの null を許容する `tags` 配列サブフィールドを加えたものです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

# An element-nullable scalar subfield.
chunk_schema.add_field(
    field_name="lang",
    datatype=DataType.VARCHAR,
    max_length=16,
    nullable=True,
)

# An element-nullable array subfield: nullable=True allows a null inner
# array and element_nullable=True allows null values inside the inner array.
chunk_schema.add_field(
    field_name="tags",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=16,
    max_length=64,
    nullable=True,
    element_nullable=True,
)

# Add the StructArray field. nullable=True applies to the whole field.
schema.add_field(
    field_name="chunks",
    datatype=DataType.ARRAY,
    element_type=DataType.STRUCT,
    struct_schema=chunk_schema,
    max_capacity=1000,
    nullable=True,
)

client.create_collection(
    collection_name="tech_articles",
    schema=schema,
)
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

// An element-nullable scalar subfield.
chunkSchema.WithField(entity.NewField().
        WithName("lang").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(16).
        WithNullable(true))

// An element-nullable array subfield: WithNullable(true) allows a null
// inner array and WithElementNullable(true) allows null values inside it.
chunkSchema.WithField(entity.NewField().
        WithName("tags").
        WithDataType(entity.FieldTypeArray).
        WithElementType(entity.FieldTypeVarChar).
        WithMaxCapacity(16).
        WithMaxLength(64).
        WithNullable(true).
        WithElementNullable(true))

// Add the StructArray field. WithNullable(true) applies to the whole field.
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
            {"fieldName": "lang", "dataType": "Array", "elementDataType": "VarChar", "elementNullable": true, "elementTypeParams": {"max_length": "16"}},
            {"fieldName": "tags", "dataType": "Array", "elementDataType": "Array", "elementNullable": true, "typeSchema": {"arrayElement": {"typeParams": {"max_capacity": "16"}, "arrayElement": {"leafType": "VarChar", "nullable": true, "typeParams": {"max_length": "64"}}}}},
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

要素レベルの null には、次のルールが適用されます。

- 行レベルの `nullable` は StructArray フィールド全体に適用され、親フィールドにのみ設定します。要素レベルの null はサブフィールド自体に設定します。スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列サブフィールドでは `element_nullable=True` を設定します。

- Struct 要素自体は null にできません。代わりに、その要素のサブフィールド値を null に設定してください。

- データを挿入するときに、要素レベルの null を許容するサブフィールドを Struct 要素から省略するか、`None` に設定できます。どちらも null 値を格納します。要素レベルの null を許容しないサブフィールドは、すべての Struct 要素に存在する必要があります。

- 配列サブフィールドでは、`nullable=True` により Struct 要素の内部配列を null にでき、`element_nullable=True` により内部配列内の null 値を許可できます。空の内部配列は null ではありません。

- 要素レベルの null を許容するベクトルサブフィールド（`nullable=True`）は、要素レベルの検索のみをサポートします。`MAX_SIM*` メトリクスと EmbeddingList 検索は拒否され、null ベクトルは検索に参加しません。

- 要素レベルの null を許容するサブフィールドでは、スカラーインデックスはサポートされていません。

- フィルターでは、サブフィールド値が null の場合、要素の述語は false ではなく unknown になります。`element_filter` または `MATCH_*` 内で `$[lang] is null` または `$[lang] is not null` を使用してテストします。詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

## StructArray フィールドのパスを理解する\{#understand-structarray-field-paths}

StructArray フィールドを作成した後は、`structArray[subfield]` パス構文を使用してそのサブフィールドを参照します。この構文は、インデックスを作成するとき、ベクトルサブフィールドを検索するとき、サブフィールドを出力するとき、またはスカラーフィルターを構築するときに使用します。

| パス | 意味 | 一般的な用途 |
| --- | --- | --- |
| `chunks[text]` | 各 Struct 要素内の `text` サブフィールドです。 | 出力フィールドまたはスカラーフィルタリングです。 |
| `chunks[section]` | 各チャンクのセクションラベルです。 | スカラーフィルタリングです。 |
| `chunks[quality_score]` | チャンクレベルの品質スコアです。 | スカラーフィルタリングまたはスカラーインデックスです。 |
| `chunks[emb_list_vector]` | 埋め込みリストとして使用されるベクトルサブフィールドです。 | `MAX_SIM*` を使用した EmbeddingList 検索です。 |
| `chunks[emb]` | 各 Struct 要素が個別に使用するベクトルサブフィールドです。 | 要素レベルのベクトル検索です。 |

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

```cpp
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

NULL は StructArray フィールド全体に適用されます。個々の Struct サブフィールドを行レベルの NULL 許容として個別に構成しないでください。有効な StructArray 値を指定するときは、null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。Struct 要素自体は null にできません。要素レベルの null を許容するサブフィールドは、個々の Struct 要素内で null 値を保持できます。次のセクションを参照してください。詳細については、[StructArray Limits](./struct-array-limits) を参照してください。

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

```cpp
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

### 既存の StructArray フィールドにサブフィールドを追加する\{#add-a-subfield-to-an-existing-structarray-field}

データが既に格納されている StructArray フィールドにサブフィールドを追加できます。サブフィールドのパスをフィールド名として `add_collection_field()` を呼び出し、新しいサブフィールドに `nullable=True` を設定します（追加するすべてのサブフィールドに必須であり、要素レベルの null を可能にする設定です）。配列サブフィールドの場合は、追加で `element_nullable=True` を設定して、内部配列内の null 値を許可します。新しいサブフィールドは、行レベルの `nullable` 設定と StructArray フィールドの `max_capacity` を継承します。


<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.add_collection_field(
    collection_name="tech_articles",
    field_name="chunks[lang]",
    data_type=DataType.VARCHAR,
    max_length=16,
    nullable=True,
)
```

</TabItem>

<TabItem value='go'>

```go
err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("tech_articles",
        entity.NewField().
                WithName("chunks[lang]").
                WithDataType(entity.FieldTypeVarChar).
                WithMaxLength(16).
                WithNullable(true)))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "schema": {
      "fieldName": "chunks[lang]",
      "dataType": "VarChar",
      "elementNullable": true,
      "elementTypeParams": {"max_length": "16"}
    }
  }'
```

</TabItem>

</Tabs>

サブフィールドの追加には、次のルールが適用されます。

- 追加するサブフィールドは `nullable=True` で作成する必要があり、配列サブフィールドを追加する場合は、内部配列内の null 値を許可するために `element_nullable=True` も指定します。デフォルト値は設定できません。既存のエンティティでは、各 Struct 要素の新しいサブフィールドに対して null が返され、StructArray フィールドが null のエンティティは null のままです。

- サブフィールドは、スカラー、ベクトル、またはスカラー配列にできます。Zilliz Cloud は既存のサブフィールドの後に追加します。

- サブフィールドを追加するときにインデックスをバインドすることはできません。別の `create_index()` 呼び出しでインデックスを作成します。追加されたベクトルサブフィールドは要素レベルのメトリクスのみをサポートし、新しいサブフィールドを含めてコレクションをロードする前に、そのインデックスをコレクションに作成しておく必要があります。

- 挿入時に新しいサブフィールドを省略するクライアントは引き続き動作します。Zilliz Cloud は、省略された要素レベルの null を許容するサブフィールドに対して null を格納するためです。

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

```cpp
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
### StructArray フィールドからサブフィールドを削除する\{#drop-a-subfield-from-a-structarray-field}

既存の StructArray フィールドから、そのパスを指定してサブフィールドを削除できます。Zilliz Cloud は、サブフィールド、そのデータ、およびそのインデックスを削除します。


<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_collection_field(
    collection_name="tech_articles",
    field_name="chunks[lang]",
)
```

</TabItem>

<TabItem value='go'>

```go
err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("tech_articles", "chunks[lang]"))
if err != nil {
    fmt.Println(err)
    return
}
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
    "fieldName": "chunks[lang]"
  }'
```

</TabItem>

</Tabs>

StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または関数で使用されているサブフィールドは削除できません。StructArray フィールド全体を削除するには、`chunks` などの名前でフィールドを削除します。サブフィールドを削除した後、そのサブフィールドを引き続き含む挿入リクエストは拒否されます。

サブフィールドに対するクエリの実行中にそのサブフィールドを削除すると、一時的に失敗する可能性があります。古いスキーマに基づいて構築されたクエリプランは、しばらく実行を続けて内部エラーで失敗します。サブフィールドを削除する前に、そのサブフィールドに対するクエリを完了するか、実行中のクエリの完了後に削除を再試行してください。

## スキーマのルール\{#schema-rules}

| ルール | 説明 |
| --- | --- |
| Struct は Array の要素タイプとして使用します。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成します。Struct をトップレベルのコレクションフィールドとして作成しないでください。 |
| すべての要素が 1 つのスキーマを共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールドに定義された Struct スキーマに従います。 |
| `max_capacity` は必須です。 | 各エンティティが StructArray フィールドに格納できる Struct 要素の数を制限します。 |
| サポートされているサブフィールド型のみ使用できます。 | StructArray でサポートされているスカラー、スカラー配列、およびベクトルのサブフィールド型を使用します。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct サブフィールドを定義しないでください。 |
| ベクトルサブフィールドには検索前にインデックスが必要です。 | ベクトル検索を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` などのパスにインデックスを作成します。 |
| 1 つのベクトルサブフィールドには 1 つのインデックスがあります。 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの個別のベクトルサブフィールドを作成します。 |
| サブフィールドのみ変更できます。 | 要素レベルの null を許容するサブフィールドを追加するか、サブフィールドをパスで削除します。 |
| すべてのサブフィールドが 1 つの `max_capacity` を共有します。 | StructArray フィールドの `max_capacity` はすべてのサブフィールドに適用されます。追加されたサブフィールドはそれを継承します。 |
| Struct 内部では関数はサポートされていません。 | StructArray フィールド内のフィールドまたはサブフィールドに対して関数を定義しないでください。 |
| スカラーサブフィールドはフィルターのニーズに合わせます。 | `section`、`quality_score`、`has_code` などのフィールドは、後でフィルター、グループ化、出力を行う場合にのみ追加してください。 |


## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素タイプとして使用せず、トップレベルのコレクションフィールドとして作成する。

- StructArray フィールドに `max_capacity` を設定するのを忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Struct、Array-of-Struct、またはベクトルや別の配列を保持する配列サブフィールドなど、サポートされていないサブフィールド型を定義する。

- サブフィールド型として `String` を使用する。`VARCHAR` を使用し、`max_length` を設定してください。

- 1 つのベクトルサブフィールドを EmbeddingList 検索と要素レベル検索の両方に使用する。

- ベクトルサブフィールドのみを追加し、`section`、`quality_score`、`has_code` などフィルタリングに必要なスカラーサブフィールドを忘れる。

- ベクトルサブフィールドを `$[...]` スカラー述語の入力として扱う。ベクトル検索にはベクトルサブフィールドを使用し、スカラー述語にはスカラーサブフィールドを使用してください。

- 要素レベルの null なしで既存の StructArray フィールドにサブフィールドを追加できると想定する、または要素レベルの null を許可しないサブフィールドを追加する。


- 行レベルの null をサブフィールドに設定する。行レベルの null は StructArray の親にのみ設定します。Struct 要素内の null 値については、スカラーまたはベクトルのサブフィールドに `nullable=True` を、配列サブフィールドに `element_nullable=True` を設定します。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` を使用せず、`chunks.emb` または `chunks.emb_list_vector` を使用する。

- null 許容の StructArray の動作がすべてのターゲットバージョンで利用可能であると見なす。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[Insert Data into StructArray Fields](./insert-struct-array) を参照してください。

2. ベクトルインデックスとスカラーインデックスを作成するには、[Index StructArray Fields](./index-struct-array) を参照してください。

3. StructArray のベクトルサブフィールドを検索するには、[Basic ベクトル Search with StructArray](./search-with-struct-array) を参照してください。

4. サポートされるデータ型、null 許容の動作、バージョン固有の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。

---
title: "StructArray フィールドを作成する | Cloud"
slug: /create-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "1 つのエンティティが構造化要素の順序付きリストを保持する必要がある場合は、StructArray フィールドを作成します。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、およびスカラー配列サブフィールドを含めることができます。 | Cloud"
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
1 つのエンティティが構造化要素の順序付きリストを保持する必要がある場合は、StructArray フィールドを作成します。StructArray フィールドは、要素タイプが Struct の Array フィールドです。各 Struct 要素は同じスキーマに従い、スカラーサブフィールド、ベクトルサブフィールド、およびスカラー配列サブフィールドを含めることができます。


このページでは、Struct スキーマを定義し、それを StructArray フィールドとして追加し、後で検索やフィルタリングに使用するサブフィールドを選択する方法と、データを挿入またはインデックス作成する前に適用されるスキーマルールについて説明します。

## 事前準備\{#before-you-begin}

Zilliz Cloud では、Dedicated クラスターとオンデマンドクラスターで、NULL 許容の StructArray フィールドと StructArray フィールドの動的追加がサポートされています。動的に追加する StructArray フィールドは NULL 許容である必要があります。NULL 許容のベクトル配列、要素レベルの null 値、スカラーの `ARRAY` サブフィールド、および StructArray サブフィールドの追加または削除は、Milvus v3.0.x と互換性のある Dedicated クラスターでサポートされています。これらの機能は、オンデマンドクラスターではまだ利用できません。

作成、NULL 許容での作成、要素単位の null を許可する作成、およびフィールド追加の例は、それぞれ代替のワークフローです。同じコレクションに対してこれらを順番に実行しないでください。後続の例では、選択した言語のクライアント初期化を再利用してください。

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

StructArray フィールドは、Struct の各サブフィールドに対して 1 つの配列値を格納します。Struct スキーマを定義するときは、サブフィールドの型を、サポートされているスカラー、スカラー配列、およびベクトルの型ファミリーから選択します。


| Struct サブフィールドの物理型 | サポート | 注記 |
| --- | --- | --- |
| Array&lt;Bool&gt; | サポート対象 | サブフィールドを `DataType.BOOL` として定義します。 |
| Array&lt;Int8/Int16/Int32/Int64&gt; | サポート対象 | サブフィールドを `DataType.INT8`、`DataType.INT16`、`DataType.INT32`、または `DataType.INT64` として定義します。 |
| Array&lt;Float/Double&gt; | サポート対象 | サブフィールドを `DataType.FLOAT` または `DataType.DOUBLE` として定義します。 |
| Array&lt;VarChar&gt; | サポート対象 | サブフィールドを `DataType.VARCHAR` として定義し、`max_length` を設定します。 |
| ArrayOfVector&lt;FloatVector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Float16Vector&gt; | サポート対象 | サブフィールドを `DataType.FLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BFloat16Vector&gt; | サポート対象 | サブフィールドを `DataType.BFLOAT16_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;Int8Vector&gt; | サポート対象 | サブフィールドを `DataType.INT8_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;BinaryVector&gt; | サポート対象 | サブフィールドを `DataType.BINARY_VECTOR` として定義し、`dim` を設定します。 |
| ArrayOfVector&lt;SparseFloatVector&gt; | サポート対象外 | StructArray フィールドでは、スパースベクトルサブフィールドはサポートされていません。 |
| Array&lt;String&gt; | サポート対象外 | `String` ではなく `VARCHAR` を使用します。 |
| Array&lt;JSON&gt; | サポート対象外 | StructArray フィールドでは、JSON サブフィールドはサポートされていません。 |
| Array&lt;Geometry&gt; | サポート対象外 | StructArray フィールドでは、Geometry サブフィールドと GIS 関数はサポートされていません。 |
| Array&lt;Text&gt; | サポート対象外 | StructArray フィールドでは、テキストサブフィールドはサポートされていません。 |
| Array&lt;Timestamptz&gt; | サポート対象外 | StructArray フィールドでは、Timestamptz サブフィールドと時間固有の式はサポートされていません。 |
| Array&lt;Array&gt; | サポート対象 | サブフィールドを、スカラーの `element_type` と内部配列用の `max_capacity` を指定した `DataType.ARRAY` として定義します。各 Struct 要素は 1 つの内部配列を保持します。 |
| `Array` の `Array` の `Array`、ベクトルの `Array`、`Struct`、または `ArrayOfStruct` | サポート対象外 | Struct 内では、配列のネストは 1 レベルに制限されています。内部配列はベクトルを保持できず、Struct にネストされた Struct サブフィールドや Array-of-Struct サブフィールドを含めることはできません。 |


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

Struct サブフィールドは、スカラーの `ARRAY` にできます。各 Struct 要素は、たとえば各チャンクのタグのリストのように、1 つの内部配列を保持します。サブフィールドは、`DataType.ARRAY`、スカラーの `element_type`、および内部配列用の `max_capacity` を指定して定義します。


```python
chunk_schema.add_field(
    field_name="tags",
    datatype=DataType.ARRAY,
    element_type=DataType.VARCHAR,
    max_capacity=16,
    max_length=64,
)
```

配列サブフィールドには、次のルールが適用されます:

- 内部配列にはスカラー値のみを保持できます。ベクトル、Struct 要素、または別の配列を保持することはできません。

- サブフィールドの `max_capacity` は内部配列を制限します。StructArray フィールドの `max_capacity` は、引き続き Struct 要素の数を制限します。

- 配列サブフィールドでは、スカラーインデックスはサポートされていません。

- フィルターでは、`element_filter` または `MATCH_*` 内の `$[tags]` に対して、あるいは `chunks[0][tags]` などの位置指定パスに対して、`array_contains`、`array_contains_any`、`array_contains_all`、および `array_length` を使用します。詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。

## Struct 要素で null 値を許可する\{#allow-null-values-in-struct-elements}

スカラー、ベクトル、または配列のサブフィールドでは、個々の Struct 要素内でそのサブフィールドに null 値を許可できます（**要素単位で null を許容するサブフィールド**）。スカラーまたはベクトルのサブフィールドでは、`nullable=True` を設定します。配列サブフィールドでは、null の内部配列を許可するには `nullable=True` を、内部配列内で null 値を許可するには `element_nullable=True` を設定します。たとえば、チャンクの言語が検出されなくても、他のサブフィールドには値を保持できます。


次の例では、[StructArray フィールドへのデータの挿入](./insert-struct-array) の要素レベルの null の例が前提とする完全なスキーマを使用して `tech_articles` を作成します。このスキーマには、最初の例のサブフィールドに加えて、要素単位で null を許容する `lang` サブフィールドと、要素単位で null を許容する `tags` 配列サブフィールドが含まれます。

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

要素レベルの null には、次のルールが適用されます:

- 行レベルの `nullable` は StructArray フィールド全体に適用され、親フィールドにのみ設定します。要素レベルの null はサブフィールド自体に設定します。スカラーまたはベクトルのサブフィールドでは `nullable=True`、配列サブフィールドでは `element_nullable=True` を設定します。

- Struct 要素自体を null にすることはできません。代わりに、要素のサブフィールド値を null に設定してください。

- データを挿入する場合、Struct 要素から要素単位で null を許容するサブフィールドを省略するか、`None` に設定できます。どちらの場合も null 値が格納されます。要素単位で null を許容しないサブフィールドは、すべての Struct 要素に存在する必要があります。

- 配列サブフィールドでは、`nullable=True` により Struct 要素に null の内部配列を許可でき、`element_nullable=True` により内部配列内で null 値を許可できます。空の内部配列は null ではありません。

- 要素単位で null を許容するベクトルサブフィールド（`nullable=True`）は、要素レベルの検索のみをサポートします。このサブフィールドでは `MAX_SIM*` メトリクスと EmbeddingList 検索は拒否され、null ベクトルは検索に参加しません。

- 要素単位で null を許容するサブフィールドでは、スカラーインデックスはサポートされていません。

- フィルターでは、サブフィールドの値が null の場合、要素の述語は false ではなく unknown になります。これをテストするには、`element_filter` または `MATCH_*` 内で `$[lang] is null` または `$[lang] is not null` を使用します。詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。

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

NULL は StructArray フィールド全体に適用されます。個々の Struct サブフィールドを、行レベルの NULL 許容として個別に構成しないでください。有効な StructArray 値を指定する場合は、null のサブフィールド配列と有効なサブフィールド配列を混在させないでください。Struct 要素自体を null にすることはできません。要素単位で null を許容するサブフィールドは、個々の Struct 要素内で null 値を保持できます。次のセクションを参照してください。詳細については、[StructArray の制限](./struct-array-limits) を参照してください。

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

データを既に保持している StructArray フィールドにサブフィールドを追加できます。サブフィールドのパスをフィールド名として指定して `add_collection_field()` を呼び出し、新しいサブフィールドに `nullable=True` を設定します（追加するすべてのサブフィールドで必須であり、要素レベルの null を許可するために必要です）。配列サブフィールドでは、さらに `element_nullable=True` を設定して、内部配列内で null 値を許可します。新しいサブフィールドは、行レベルの `nullable` 設定と StructArray フィールドの `max_capacity` を継承します。


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

サブフィールドの追加には、次のルールが適用されます:

- 追加するサブフィールドは `nullable=True` を指定して作成する必要があり、追加する配列サブフィールドでは、内部配列内で null 値を許可するためにさらに `element_nullable=True` を指定します。デフォルト値は設定できません。既存のエンティティは、各 Struct 要素で新しいサブフィールドに対して null を返します。また、StructArray フィールドが null のエンティティは null のままです。

- サブフィールドはスカラー、ベクトル、またはスカラー配列にできます。Zilliz Cloud は既存のサブフィールドの後に追加します。

- サブフィールドの追加時にインデックスをバインドすることはできません。インデックスは、別途 `create_index()` を呼び出して作成します。追加したベクトルサブフィールドは要素レベルのメトリクスのみをサポートするため、新しいサブフィールドを含めてコレクションをロードする前に、コレクション内のそのサブフィールドにインデックスを作成しておく必要があります。

- 挿入時に新しいサブフィールドを省略するクライアントは、引き続き動作します。これは、Zilliz Cloud が省略された要素単位で null を許容するサブフィールドに null を格納するためです。

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

StructArray フィールドの最後のサブフィールド、コレクションの最後のベクトルフィールド、または Function で使用されているサブフィールドは削除できません。StructArray フィールド全体を削除するには、`chunks` などのフィールド名を指定してフィールドを削除します。サブフィールドを削除した後、そのサブフィールドを引き続き含む挿入リクエストは拒否されます。

クエリの実行中にそのサブフィールドを削除すると、一時的に失敗する場合があります。古いスキーマに基づいて作成されたクエリプランは、短時間は実行され続け、内部エラーで失敗します。サブフィールドを削除する前にそのサブフィールドに対するクエリを完了するか、実行中のクエリが終了した後に削除を再試行してください。

## スキーマルール\{#schema-rules}

| ルール | 説明 |
| --- | --- |
| Struct は Array の要素タイプとして使用します。 | StructArray フィールドは、`element_type=STRUCT` を指定した Array フィールドとして作成します。Struct をトップレベルのコレクションフィールドとして作成しないでください。 |
| すべての要素が 1 つのスキーマを共有します。 | 同じ StructArray フィールド内のすべての Struct 要素は、そのフィールドに定義された Struct スキーマに従います。 |
| `max_capacity` は必須です。 | 各エンティティが StructArray フィールドに格納できる Struct 要素の数を制限します。 |
| サポートされているサブフィールド型のみ使用できます。 | StructArray でサポートされているスカラー、スカラー配列、およびベクトルのサブフィールド型を使用します。JSON、Geometry、Text、Timestamptz、SparseFloatVector、またはネストされた Struct サブフィールドを定義しないでください。 |
| ベクトルサブフィールドには検索前のインデックスが必要です。 | ベクトル検索を実行する前に、`chunks[emb_list_vector]` や `chunks[emb]` などのパスにインデックスを作成します。 |
| 1 つのベクトルサブフィールドには 1 つのインデックスがあります。 | EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの独立したベクトルサブフィールドを作成します。 |
| 変更できるのはサブフィールドのみです。 | 要素単位で null を許容するサブフィールドを追加するか、パスを指定してサブフィールドを削除します。既存のサブフィールドを後から `element_nullable` に変更することはできません。 |
| すべてのサブフィールドが 1 つの `max_capacity` を共有します。 | StructArray フィールドの `max_capacity` はすべてのサブフィールドに適用されます。追加されたサブフィールドはそれを継承します。 |
| Struct 内では関数はサポートされません。 | StructArray フィールド内のフィールドまたはサブフィールドに関数を定義しないでください。 |
| スカラーサブフィールドはフィルターのニーズに合わせます。 | `section`、`quality_score`、`has_code` などのフィールドは、後でフィルタリング、グループ化、または出力する必要がある場合にのみ追加します。 |


## よくある間違い\{#common-mistakes}

- `DataType.STRUCT` を Array フィールドの要素タイプとして使用せず、トップレベルのコレクションフィールドとして作成する。

- StructArray フィールドで `max_capacity` の設定を忘れる。

- JSON、Geometry、Text、Timestamptz、SparseFloatVector、ネストされた Struct、Array-of-Struct、またはベクトルや別の配列を保持する配列サブフィールドなど、サポートされていないサブフィールド型を定義する。

- サブフィールド型として `String` を使用する。`VARCHAR` を使用し、`max_length` を設定してください。

- EmbeddingList 検索と要素レベルの検索の両方に 1 つのベクトルサブフィールドを使用する。

- ベクトルサブフィールドのみを追加し、`section`、`quality_score`、`has_code` など、フィルタリングに必要なスカラーサブフィールドを忘れる。

- ベクトルサブフィールドを `$[...]` スカラー述語の入力として扱う。ベクトル検索にはベクトルサブフィールドを、スカラー述語にはスカラーサブフィールドを使用してください。

- 既存の StructArray フィールドに要素レベルの null なしでサブフィールドを追加できると想定する、または要素レベルの null を許可しないサブフィールドを追加する。


- サブフィールドに行レベルの null を設定する。行レベルの null は StructArray の親にのみ設定します。Struct 要素内の null 値には、スカラーまたはベクトルのサブフィールドで `nullable=True` を、配列サブフィールドで `element_nullable=True` を設定してください。

- 必須のパス構文 `chunks[emb]` または `chunks[emb_list_vector]` の代わりに、`chunks.emb` または `chunks.emb_list_vector` を使用する。

- null 許容の StructArray の動作がすべてのターゲットバージョンで使用できるとみなす。

## 次のステップ\{#next-steps}

1. StructArray フィールドにネストされたデータを挿入するには、[StructArray フィールドへのデータの挿入](./insert-struct-array) をお読みください。

2. ベクトルインデックスとスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) をお読みください。

3. StructArray のベクトルサブフィールドを検索するには、[StructArray を使用した基本的なベクトル検索](./search-with-struct-array) をお読みください。

4. サポートされているデータ型、null 許容の動作、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) をお読みください。

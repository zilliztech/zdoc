---
title: "外部データレイク検索のクイックスタート | Cloud"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "外部データレイク検索のクイックスタート"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部データレイク検索を使用すると、コンピューティングリソースを常時稼働させることなく、外部ストレージ内のデータまたは Zilliz Cloud にインポートしたデータにゼロコピーでアクセスして、大規模なデータセットを検索できます。外部ボリュームまたはインポートしたファイルからコレクションを作成し、プロジェクトのデータプレーンエンドポイント経由でインデックスを構築してメタデータを更新し、検索やクエリのワークロードを実行する必要がある場合にのみオンデマンドクラスターを起動できます。 | Cloud"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 外部データレイク検索のクイックスタート

外部データレイク検索を使用すると、コンピューティングリソースを常時稼働させることなく、外部ストレージ内のデータまたは Zilliz Cloud にインポートしたデータにゼロコピーでアクセスして、大規模なデータセットを検索できます。外部ボリュームまたはインポートしたファイルからコレクションを作成し、プロジェクトのデータプレーンエンドポイント経由でインデックスを構築してメタデータを更新し、検索やクエリのワークロードを実行する必要がある場合にのみオンデマンドクラスターを起動できます。

これを行う手順は以下の通りです。

## 事前準備\{#before-you-start}

- **ストレージ統合を作成すること。**

    ストレージ統合は、アクセス資格情報とともにデータの場所を記録するプロファイルです。ストレージ統合を設定するには、[AWS S3](./integrate-with-aws-s3)、[Google GCS](./integrate-with-gcp)、または [Azure](./integrate-with-azure-blob-storage) のストレージ統合作成手順に従って、ストレージ統合 ID を取得してください。

- **外部ボリュームを作成すること。**

    外部ボリュームは、ストレージ統合内のパスです。生データがそのパス上にあることを確認してください。同じストレージ統合から複数の外部ボリュームを作成できます。外部ボリュームを作成するには、[External Volumes](./external-volume#create-an-external-volume) を参照してください。

## ステップ 1: プロジェクトエンドポイントに接続する。\{#step-1-connect-to-a-project-endpoint}

データベースを操作する前に、プロジェクトエンドポイントに接続します。プロジェクトエンドポイントは、Zilliz Cloud コンソールでオンデマンドコンピューティングを有効にした後、クイックスタートページで取得できます。

<Admonition type="info" title="Notes">

外部コレクションの操作には、認証用の **API キー**が必要です。このフローでは `username:password` 認証はサポートされていません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect to database
client = MilvusClient(
    # a project-specific on-demand compute endpoint
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://{project-id}.{region}.api.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "https://{project-id}.{region}.api.zillizcloud.com",
    APIKey:  "YOUR_API_KEY",
})
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY");
let client = ClientV2::new(&config).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam(
    "https://{project-id}.{region}.api.zillizcloud.com", "YOUR_API_KEY"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "https://{project-id}.{region}.api.zillizcloud.com",
    token: "YOUR_API_KEY",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

## ステップ 2: （任意）データベースを作成する。\{#step-2-optional-create-a-database}

Zilliz Cloud にはデフォルトのデータベースが付属しています。それを使用する場合は、このステップをスキップしてください。次のようにデータベースを作成することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.CreateDatabaseReq;

client.createDatabase(CreateDatabaseReq.builder()
        .databaseName("my_database")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_database(CreateDatabaseRequest::builder()
        .database_name("my_database")
        .build()?)
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateDatabase(milvus::CreateDatabaseRequest().WithDatabaseName("my_database"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createDatabase({ db_name: "my_database" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database"
}'
```

</TabItem>
</Tabs>

## ステップ 3: 外部コレクションを作成する。\{#step-3-create-an-external-collection}

データベースの準備ができたら、その中に外部コレクションを作成できます。外部コレクションは、その列を指定したデータファイルにマッピングし、そのコレクション内の検索用にオンデマンドコンピューティングリソースをアタッチします。

生データをコレクションにインポートする必要があるマネージドコレクションとは異なり、外部コレクションは、1 秒未満のリフレッシュ操作によって生データからメタデータを生成します。

次の例では、コレクションのフィールドとデータファイルの間のマッピング関係を設定する方法を示します。スキーマを作成するときは、ボリュームパスとデータ形式を指定します。このクイックスタートでは Iceberg テーブルを使用します。サポートされているデータソースと形式の完全なリストについては、[Supported data sources and formats](./create-external-collection#support-data-sources) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/iceberg/metadata/00001-xxx.metadata.json',
    external_spec='{"format": "iceberg-table", "snapshot_id": "1234567890123456789"}'
)

schema.add_field(
    field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=1536,
    # highlight-next
    external_field="embedding" # field name in the external data file
)

schema.add_field(
    field_name="product_id",
    datatype=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    # highlight-next
    external_field="product_id"
)

schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
    nullable=True,
    # highlight-next
    external_field="title"
)

schema.add_field(
    field_name="main_category",
    datatype=DataType.VARCHAR,
    max_length=64,
    nullable=True,
    # highlight-next
    external_field="main_category"
)

schema.add_field(
    field_name="price",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="price"
)

schema.add_field(
    field_name="average_rating",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="average_rating"
)

schema.add_field(
    field_name="rating_number",
    datatype=DataType.INT64,
    nullable=True,
    # highlight-next
    external_field="rating_number"
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

JsonObject externalSpec = new JsonObject();
externalSpec.addProperty("format", "iceberg-table");
externalSpec.addProperty("snapshot_id", "1234567890123456789");

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .externalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json")
        .externalSpec(externalSpec)
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(1536)
        .externalField("embedding")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .maxLength(32)
        .isNullable(true)
        .externalField("product_id")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .isNullable(true)
        .externalField("title")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("main_category")
        .dataType(DataType.VarChar)
        .maxLength(64)
        .isNullable(true)
        .externalField("main_category")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Double)
        .isNullable(true)
        .externalField("price")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("average_rating")
        .dataType(DataType.Double)
        .isNullable(true)
        .externalField("average_rating")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("rating_number")
        .dataType(DataType.Int64)
        .isNullable(true)
        .externalField("rating_number")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

schema := entity.NewSchema().
    WithExternalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json").
    WithExternalSpec(`{"format": "iceberg-table", "snapshot_id": "1234567890123456789"}`).
    WithField(entity.NewField().
        WithName("vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(1536).
        WithExternalField("embedding")).
    WithField(entity.NewField().
        WithName("product_id").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(32).
        WithNullable(true).
        WithExternalField("product_id")).
    WithField(entity.NewField().
        WithName("title").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512).
        WithNullable(true).
        WithExternalField("title")).
    WithField(entity.NewField().
        WithName("main_category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(64).
        WithNullable(true).
        WithExternalField("main_category")).
    WithField(entity.NewField().
        WithName("price").
        WithDataType(entity.FieldTypeDouble).
        WithNullable(true).
        WithExternalField("price")).
    WithField(entity.NewField().
        WithName("average_rating").
        WithDataType(entity.FieldTypeDouble).
        WithNullable(true).
        WithExternalField("average_rating")).
    WithField(entity.NewField().
        WithName("rating_number").
        WithDataType(entity.FieldTypeInt64).
        WithNullable(true).
        WithExternalField("rating_number"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let schema = CollectionSchema::new()
    .external_source("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json")
    .external_spec(json!({
        "format": "iceberg-table",
        "snapshot_id": "1234567890123456789"
    }))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(1536).external_field("embedding"))
    .add_field(FieldSchema::new().name("product_id").data_type(DataType::VarChar).max_length(32).nullable(true).external_field("product_id"))
    .add_field(FieldSchema::new().name("title").data_type(DataType::VarChar).max_length(512).nullable(true).external_field("title"))
    .add_field(FieldSchema::new().name("main_category").data_type(DataType::VarChar).max_length(64).nullable(true).external_field("main_category"))
    .add_field(FieldSchema::new().name("price").data_type(DataType::Double).nullable(true).external_field("price"))
    .add_field(FieldSchema::new().name("average_rating").data_type(DataType::Double).nullable(true).external_field("average_rating"))
    .add_field(FieldSchema::new().name("rating_number").data_type(DataType::Int64).nullable(true).external_field("rating_number"));
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->WithExternalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json");
schema->WithExternalSpec({
    {"format", "iceberg-table"},
    {"snapshot_id", "1234567890123456789"},
});

schema->AddField(milvus::FieldSchema()
    .WithName("vector")
    .WithDataType(milvus::DataType::FLOAT_VECTOR)
    .WithDimension(1536)
    .WithExternalField("embedding"));
schema->AddField(milvus::FieldSchema()
    .WithName("product_id")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(32)
    .WithNullable(true)
    .WithExternalField("product_id"));
schema->AddField(milvus::FieldSchema()
    .WithName("title")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(512)
    .WithNullable(true)
    .WithExternalField("title"));
schema->AddField(milvus::FieldSchema()
    .WithName("main_category")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(64)
    .WithNullable(true)
    .WithExternalField("main_category"));
schema->AddField(milvus::FieldSchema()
    .WithName("price")
    .WithDataType(milvus::DataType::DOUBLE)
    .WithNullable(true)
    .WithExternalField("price"));
schema->AddField(milvus::FieldSchema()
    .WithName("average_rating")
    .WithDataType(milvus::DataType::DOUBLE)
    .WithNullable(true)
    .WithExternalField("average_rating"));
schema->AddField(milvus::FieldSchema()
    .WithName("rating_number")
    .WithDataType(milvus::DataType::INT64)
    .WithNullable(true)
    .WithExternalField("rating_number"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
    {
        name: "vector",
        data_type: DataType.FloatVector,
        type_params: { dim: "1536" },
        external_field: "embedding",
    },
    {
        name: "product_id",
        data_type: DataType.VarChar,
        type_params: { max_length: "32" },
        nullable: true,
        external_field: "product_id",
    },
    {
        name: "title",
        data_type: DataType.VarChar,
        type_params: { max_length: "512" },
        nullable: true,
        external_field: "title",
    },
    {
        name: "main_category",
        data_type: DataType.VarChar,
        type_params: { max_length: "64" },
        nullable: true,
        external_field: "main_category",
    },
    {
        name: "price",
        data_type: DataType.Double,
        nullable: true,
        external_field: "price",
    },
    {
        name: "average_rating",
        data_type: DataType.Double,
        nullable: true,
        external_field: "average_rating",
    },
    {
        name: "rating_number",
        data_type: DataType.Int64,
        nullable: true,
        external_field: "rating_number",
    },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "externalSource": "volume://my_volume/iceberg/metadata/00001-xxx.metadata.json",
    "externalSpec": "{\"format\": \"iceberg-table\", \"snapshot_id\": \"1234567890123456789\"}",
    "fields": [
        {
            "fieldName": "vector",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "1536"
            },
            "externalField": "embedding"
        },
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "32"
            },
            "nullable": true,
            "externalField": "product_id"
        },
        {
            "fieldName": "title",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "512"
            },
            "nullable": true,
            "externalField": "title"
        },
        {
            "fieldName": "main_category",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "64"
            },
            "nullable": true,
            "externalField": "main_category"
        },
        {
            "fieldName": "price",
            "dataType": "Double",
            "nullable": true,
            "externalField": "price"
        },
        {
            "fieldName": "average_rating",
            "dataType": "Double",
            "nullable": true,
            "externalField": "average_rating"
        },
        {
            "fieldName": "rating_number",
            "dataType": "Int64",
            "nullable": true,
            "externalField": "rating_number"
        }
    ]
}'
```

</TabItem>
</Tabs>

次に、上記のスキーマを使用してコレクションを作成できます。デフォルトのデータベースを使用する場合は、`db_name` パラメーターを省略しても問題ありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database"
)

# create the collection
client.create_collection(
    collection_name="my_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

client.useDatabase("my_database");

CreateCollectionReq createReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(createReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
    // handle error
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.use_database("my_database").await?;

client
    .create_collection(CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .build()?)
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->UseDatabase("my_database");
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("my_collection")
    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.useDatabase({ db_name: "my_database" });

await client.createCollection({
    collection_name: "my_collection",
    fields: schema,
    external_source: "volume://my_volume/iceberg/metadata/00001-xxx.metadata.json",
    external_spec: JSON.stringify({
        format: "iceberg-table",
        snapshot_id: "1234567890123456789",
    }),
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"my_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## ステップ 4: インデックスを作成してコレクションをリフレッシュする。\{#step-4-create-indexes-and-refresh-the-collection}

マネージドコレクションと同様に、外部データベースでもインデックスを作成できます。すべてのベクトルフィールドにインデックスを作成する必要があり、高速なメタデータフィルタリングのために一部のスカラーフィールドにインデックスを作成することを選択できます。ただし、インデックスを構築するにはリフレッシュを呼び出す必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

index_params.add_index(
    field_name="main_category", 
    index_type="AUTOINDEX"
)

client.create_index(
    db_name="my_database",
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.*;

IndexParam vectorIndex = IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
IndexParam categoryIndex = IndexParam.builder()
        .fieldName("main_category")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build();

client.createIndex(CreateIndexReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .indexParams(Arrays.asList(vectorIndex, categoryIndex))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

vectorIndex := index.NewAutoIndex(entity.COSINE)
categoryIndex := index.NewGenericIndex("main_category", map[string]string{
    index.IndexTypeKey: string(index.AUTOINDEX),
})

vectorTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "vector", vectorIndex))
if err != nil {
    // handle error
}
err = vectorTask.Await(ctx)
if err != nil {
    // handle error
}

categoryTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "main_category", categoryIndex))
if err != nil {
    // handle error
}
err = categoryTask.Await(ctx)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_index(CreateIndexRequest::builder()
        .collection_name("my_collection")
        .index_params(vec![
            IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
            IndexParam::new().field_name("main_category").index_type(IndexType::AutoIndex),
        ])
        .build()?)
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("my_collection")
    .AddIndex(milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE))
    .AddIndex(milvus::IndexDesc("main_category", "main_category", milvus::IndexType::AUTOINDEX)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex([
    {
        db_name: "my_database",
        collection_name: "my_collection",
        field_name: "vector",
        index_type: "AUTOINDEX",
        metric_type: "COSINE",
    },
    {
        db_name: "my_database",
        collection_name: "my_collection",
        field_name: "main_category",
        index_type: "AUTOINDEX",
    },
]);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "vector",
        "metricType": "COSINE",
        "indexName": "vector",
        "indexType": "AUTOINDEX"
    },
    {
        "fieldName": "main_category",
        "indexName": "main_category",
        "indexType": "AUTOINDEX"
    }
]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"my_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

次に、外部コレクションをリフレッシュします。`externalSource` と `externalSpec` を省略してコレクションスキーマを再利用するか、両方を指定して新しいソースからコレクションスキーマをリフレッシュできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# refresh the external database
job_id = client.refresh_external_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

RefreshExternalCollectionResp refreshResp = client.refreshExternalCollection(
        RefreshExternalCollectionReq.builder()
                .collectionName("my_collection")
                .build());
long jobId = refreshResp.getJobId();
```

</TabItem>

<TabItem value='go'>

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    milvusclient.NewRefreshExternalCollectionOption("my_collection"))
if err != nil {
    // handle error
}
jobID := refreshResult.JobID
```

</TabItem>

<TabItem value='rust'>

```rust
let resp = client
    .refresh_external_collection(RefreshExternalCollectionRequest::builder()
        .collection_name("my_collection")
        .build()?)
    .await?;
let job_id = resp.job_id();
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::RefreshExternalCollectionResponse refresh_response;
status = client->RefreshExternalCollection(
    milvus::RefreshExternalCollectionRequest().WithCollectionName("my_collection"),
    refresh_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
int64_t jobId = refresh_response.JobID();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const resp = await client.refreshExternalCollection({ collection_name: "my_collection" });
const jobId = resp.job_id;
```

</TabItem>

<TabItem value='bash'>

```bash
# Refresh the external collection
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection"
}'

# job-xxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

次に、進行状況監視の呼び出しをラップしてリフレッシュ操作の進行状況を追跡するループを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
progress = client.get_refresh_external_collection_progress(job_id=job_id)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;

GetRefreshExternalCollectionProgressResp progressResp = client.getRefreshExternalCollectionProgress(
        GetRefreshExternalCollectionProgressReq.builder()
                .jobId(jobId)
                .build());
```

</TabItem>

<TabItem value='go'>

```go
progress, err := client.GetRefreshExternalCollectionProgress(ctx,
    milvusclient.NewGetRefreshExternalCollectionProgressOption(jobID))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let progress = client
    .get_refresh_external_collection_progress(GetRefreshExternalCollectionProgressRequest::builder()
        .job_id(job_id)
        .build()?)
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::GetRefreshExternalCollectionProgressResponse progress_response;
status = client->GetRefreshExternalCollectionProgress(
    milvus::GetRefreshExternalCollectionProgressRequest().WithJobID(jobId),
    progress_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const progress = await client.getRefreshExternalCollectionProgress({ job_id: jobId });
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/describe" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "jobId": "job-xxxxxxxxxxxxxxxxxxx"
    }'
```

</TabItem>
</Tabs>

## ステップ 5: オンデマンドクラスターを作成する\{#step-5-create-an-on-demand-cluster}

外部コレクションの準備ができたら、オンデマンド検索のためにそれをオンデマンドクラスターにアタッチする必要があります。次のコマンドはクラスターを作成し、その ID を返します。

```bash
export CONTROL_PLANE_ENDPOINT="https://api.cloud.zilliz.com"

curl --request POST \
--url "${CONTROL_PLANE_ENDPOINT}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60
}'

# inxx-xxxxxxxxxxxxx
```

デフォルトでは、クラスターは最後のリクエストから 60 秒後に自動的にサスペンドされ、ユースケースに適した値に設定できます。

## ステップ 6: 検索を実行する。\{#step-6-conduct-searches}

検索、クエリ、またはハイブリッド検索を実行する必要がある場合は、セッションを通じて前のステップで作成したオンデマンドクラスターにアタッチできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxx"
)
# highlight-end

# 1536-dimensional vector
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxx");

FloatVec queryVector = new FloatVec(Arrays.asList(
        0.3580376395471989f,
        -0.6023495712049978f,
        0.18414012509913835f,
        -0.26286205330961354f,
        0.9029438446296592f /* ...remaining dims */));

SearchResp searchResp = session.search(SearchReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .annsField("vector")
        .data(Collections.singletonList(queryVector))
        .limit(3)
        .outputFields(Arrays.asList("product_id", "title", "main_category", "price", "average_rating", "rating_number"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: session-based search (client.session + cluster-scoped search) is not
// supported in the Go SDK as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='rust'>

```rust
let session = client.session("inxx-xxxxxxxxxxxxx")?;

let query_vector = vec![
    0.3580376395471989,
    -0.6023495712049978,
    0.18414012509913835,
    -0.26286205330961354,
    0.9029438446296592 /* ...remaining dims */,
];

let results = session
    .search(SearchRequest::builder()
        .database_name("my_database")
        .collection_name("my_collection")
        .vector_field("vector")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(3)
        .output_fields(["product_id", "title", "main_category", "price", "average_rating", "rating_number"])
        .build()?)
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxx", session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::SearchResponse search_response;
milvus::SearchRequest search_request;
search_request.WithDatabaseName("my_database")
    .WithCollectionName("my_collection")
    .WithAnnsField("vector")
    .WithMetricType(milvus::MetricType::COSINE)
    .WithLimit(3)
    .WithOutputFields({"product_id", "title", "main_category", "price", "average_rating", "rating_number"})
    .AddFloatVector({0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f /* ...remaining dims */});
status = session->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxx");

const queryVector = [
    0.3580376395471989,
    -0.6023495712049978,
    0.18414012509913835,
    -0.26286205330961354,
    0.9029438446296592 /* ...remaining dims */,
];

const res = await session.search({
    collection_name: "my_collection",
    data: [queryVector],
    anns_field: "vector",
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

その後、データを探索して最も価値のあるサブセットを見つけることができます。次に、サービングクラスターに接続し、データをインポートして、本番環境で提供できます。

---
title: "Partition Key の使用 | Cloud"
slug: /use-partition-key
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Partition Key は、コレクションの名前空間として機能し、論理的なデータ分離を実現する検索最適化ソリューションです。テナント ID やプロジェクト名などの特定のスカラーフィールドを Partition Key に指定すると、単一のコレクション内でデータを複数の名前空間に効果的に分割できます。これにより、フィルター条件を使用して検索リクエストを特定の名前空間に限定できるため、検索範囲を大幅に狭め、全体的な効率を向上できます。この記事では、この名前空間ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項について説明します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-use-partition-key
sidebar_label: "Partition Key（名前空間）"
sidebar_position: 19
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/use-partition-key.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Partition Key の使用

**Partition Key** は、コレクションの**名前空間**として機能し、論理的なデータ分離を実現する検索最適化ソリューションです。テナント ID やプロジェクト名などの特定のスカラーフィールドを Partition Key に指定すると、単一のコレクション内でデータを複数の名前空間に効果的に分割できます。これにより、フィルター条件を使用して検索リクエストを特定の名前空間に限定できるため、検索範囲を大幅に狭め、全体的な効率を向上できます。この記事では、この名前空間ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項について説明します。

## 概要\{#overview}

Zilliz Cloud では、パーティションを使用してデータ分離を実装し、検索範囲を特定のパーティションに制限することで検索パフォーマンスを向上できます。パーティションを手動で管理する場合、コレクション内に最大 1,024 個のパーティションを作成し、特定のルールに基づいてエンティティをこれらのパーティションに挿入することで、特定の数のパーティション内に検索を制限して検索範囲を狭めることができます。

Zilliz Cloud では、コレクション内に作成できるパーティション数の制限を克服するために、データ分離でパーティションを再利用できる Partition Key を提供しています。コレクションを作成する際、スカラーフィールドを Partition Key として使用できます。コレクションの準備が完了すると、Zilliz Cloud はコレクション内に指定された数のパーティションを作成します。挿入されたエンティティを受信すると、Zilliz Cloud はエンティティの Partition Key 値を使用してハッシュ値を計算し、そのハッシュ値とコレクションの `partitions_num` プロパティに基づいて剰余演算を実行して対象のパーティション ID を取得し、エンティティを対象のパーティションに保存します。

![パーティションと Partition Key の比較](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/96cfbef93a0f80ef7a790c929b531e7d2314de2d09c195f5c9ff453af7e5be57.png)

次の図は、Partition Key 機能が有効な場合と無効な場合に、Zilliz Cloud がコレクション内で検索リクエストを処理する方法を示しています。

- Partition Key が無効な場合、Zilliz Cloud はコレクション内でクエリベクトルに最も類似するエンティティを検索します。最も関連性の高い結果を含むパーティションがわかっている場合は、検索範囲を狭めることができます。

- Partition Key が有効な場合、Zilliz Cloud は検索フィルターで指定された Partition Key 値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![Partition Key がある場合とない場合](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/55f54b68431a798a958a962b741889b8d054e5f8f1badddf30f3fe847f84f548.png)

## Partition Key を使用する\{#use-partition-key}

Partition Key を使用するには、次の手順を実行します。

- [Partition Key を設定する](./use-partition-key#set-partition-key)、

- [作成するパーティション数を設定する](./use-partition-key#set-partition-numbers)（任意）、

- [Partition Key に基づくフィルター条件を作成する](./use-partition-key#create-filtering-condition)、および

- [Partition Key にインデックスを作成する](./use-partition-key#index-partition-key)（推奨）。

### Partition Key を設定する\{#set-partition-key}

スカラーフィールドを Partition Key として指定するには、スカラーフィールドを追加するときに、その `is_partition_key` 属性を `true` に設定する必要があります。

<Admonition type="info" icon="📘" title="Notes">

スカラーフィールドを Partition Key に設定した場合、フィールドの値は空または null にできません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient, DataType
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id",
    datatype=DataType.INT64,
    is_primary=True)
    
schema.add_field(field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=5)

# Add the partition key
schema.add_field(
    field_name="my_varchar", 
    datatype=DataType.VARCHAR, 
    max_length=512,
    # highlight-next-line
    is_partition_key=True,
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

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
        
// Add the partition key
schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        .maxLength(512)
        // highlight-next-line
        .isPartitionKey(true)
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

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(false)
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("my_varchar").
    WithDataType(entity.FieldTypeVarChar).
    WithIsPartitionKey(true).
    WithMaxLength(512),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("id")
            .data_type(DataType::Int64)
            .primary_key(true),
    )
    .add_field(
        FieldSchema::new()
            .name("vector")
            .data_type(DataType::FloatVector)
            .dimension(5),
    )
    .add_field(
        FieldSchema::new()
            .name("my_varchar")
            .data_type(DataType::VarChar)
            .max_length(512)
            .partition_key(true), // Add the partition key
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithPartitionKey(true).WithMaxLength(512));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// Define fields
const fields = [
  {
    name: 'id',
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: 'vector',
    data_type: DataType.FloatVector,
    dim: 5,
  },
  {
    name: 'my_varchar',
    data_type: DataType.VarChar,
    max_length: 512,
    // highlight-next-line
    is_partition_key: true,
  },
];
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

var schema = new CollectionSchema
{
    Fields =
    {
        new FieldSchema("id", DataType.Int64, isPrimaryKey: true),
        FieldSchema.CreateFloatVector("vector", dimension: 5),
        // Add the partition key
        FieldSchema.CreateVarchar("my_varchar", maxLength: 512, isPartitionKey: true)
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "isPartitionKey": true,
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'
```

</TabItem>

</Tabs>


### パーティション数を設定する\{#set-partition-numbers}

コレクション内のスカラーフィールドを Partition Key として指定すると、Zilliz Cloud はコレクション内に 16 個のパーティションを自動的に作成します。エンティティを受け取ると、Zilliz Cloud はそのエンティティの Partition Key 値に基づいてパーティションを選択し、エンティティをそのパーティションに保存します。その結果、一部またはすべてのパーティションに、異なる Partition Key 値を持つエンティティが格納されます。

コレクションの作成時に、作成するパーティション数を決定することもできます。これは、Partition Key として指定されたスカラーフィールドがある場合にのみ有効です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    num_partitions=128
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
                .collectionName("my_collection")
                .collectionSchema(schema)
                .numPartitions(128)
                .build();
        client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithNumPartitions(128))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .num_partitions(128)
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .WithNumPartitions(128));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    fields: fields,
    num_partitions: 128
})
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "my_collection",
    Schema = schema,
    NumPartitions = 128
});
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionsNum": 128
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>

</Tabs>


### フィルター条件を作成する\{#create-filtering-condition}

Partition Key 機能が有効なコレクションで ANN 検索を実行する場合は、検索リクエストに Partition Key を含むフィルター式を指定する必要があります。フィルター式で Partition Key 値を特定の範囲に制限すると、Zilliz Cloud は対応するパーティション内に検索範囲を制限します。

削除操作を実行する場合は、より効率的な削除を実現するために、単一の Partition Key を指定するフィルター式を含めることをお勧めします。この方法では、削除操作が特定のパーティションに限定されるため、Compaction 中の書き込み増幅が抑制され、Compaction とインデックス作成のためのリソースが節約されます。

次の例では、特定の Partition Key 値と一連の Partition Key 値に基づく、Partition Key ベースのフィルタリングを示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Filter based on a single partition key value, or
filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='java'>

```java
// Filter based on a single partition key value, or
String filter = "partition_key == 'x' && <other conditions>";

// Filter based on multiple partition key values
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='go'>

```go
// Filter based on a single partition key value, or
filter := "partition_key == 'x' && <other conditions>"

// Filter based on multiple partition key values
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>"
```

</TabItem>

<TabItem value='rust'>

```rust
// Filter based on a single partition key value, or
let filter = "partition_key == 'x' && <other conditions>";

// Filter based on multiple partition key values
let filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='c++'>

```c++
// Filter based on a single partition key value, or
std::string filter = R"(partition_key == 'x' && <other conditions>)";

// Filter based on multiple partition key values
filter = R"(partition_key in ['x', 'y', 'z'] && <other conditions>)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Filter based on a single partition key value, or
const filter = 'partition_key == "x" && <other conditions>'

// Filter based on multiple partition key values
filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Filter based on a single partition key value, or
string filter = "partition_key == 'x' && <other conditions>";

// Filter based on multiple partition key values
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='bash'>

```bash
# Filter based on a single partition key value, or
export filter='partition_key == "x" && <other conditions>'

# Filter based on multiple partition key values
export filter='partition_key in ["x", "y", "z"] && <other conditions>'
```

</TabItem>

</Tabs>


<Admonition type="info" icon="📘" title="Notes">

`partition_key` は、Partition Key として指定されたフィールドの名前に置き換える必要があります。

</Admonition>

### Partition Key にインデックスを作成する\{#index-partition-key}

Partition Key フィールドにスカラーインデックスを作成することをお勧めします。

Partition Key は、一致する Partition Key 値を保持する可能性があるパーティションに検索を絞り込みます。ただし、各パーティションには通常、さまざまな Partition Key 値を持つエンティティが多数格納されるため、Zilliz Cloud は検索対象のパーティション内のすべてのエンティティに対して Partition Key ベースのフィルターを評価します。フィールドにスカラーインデックスがない場合、この評価はフィールド値のフルスキャンとなり、大規模なコレクションでは検索レイテンシの大部分を占める可能性があります。スカラーインデックスがある場合、Zilliz Cloud は代わりにインデックス内で一致するエンティティを検索します。

この評価は、ベクトルインデックスの種類に関係なく行われます。Zilliz Cloud は Partition Key 値を HNSW ファミリーのベクトルインデックスに埋め込むことができるため、Partition Key でフィルターされた検索は関連するサブインデックスのみを走査します。ただし、この最適化はベクトルの走査範囲を狭めるものであり、フィルターの評価をなくすものではありません。スカラーフィールドのみでフィルターする検索には、同等のショートカットはありません。どちらの場合も、Partition Key フィールドのスカラーインデックスが評価を高速に保ちます。

Partition Key フィールドに基づいてインデックスタイプを選択します。

- [INVERTED](./inverted-index-type) は、Partition Key ベースのフィルターで `==` 条件と `in` 条件が使用されるため、ほとんどの Partition Key フィールドに適しています。

- [BITMAP](./bitmap-index-type) は、異なる値が少ないフィールドに適しています。一般的な目安として、フィールドに含まれる異なる値が 500 個未満の場合にのみ使用してください。

- [STL_SORT](./slt-sort-index-type) は、数値フィールドおよび `VARCHAR` フィールドの代替手段です。

次の例では、ベクトルフィールドのインデックスと合わせて、コレクションのインデックスパラメーターに Partition Key フィールドの `INVERTED` インデックスを追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

# Index the partition key
index_params.add_index(
    field_name="my_varchar",
    # highlight-next-line
    index_type="INVERTED"
)

client.create_index(
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

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

// Index the partition key
indexParams.add(IndexParam.builder()
        .fieldName("my_varchar")
        // highlight-next-line
        .indexType(IndexParam.IndexType.INVERTED)
        .build());

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("my_collection", "vector",
        index.NewAutoIndex(entity.COSINE)),
    // Index the partition key
    milvusclient.NewCreateIndexOption("my_collection", "my_varchar",
        index.NewInvertedIndex()),
}

for _, opt := range indexOptions {
    indexTask, err := client.CreateIndex(ctx, opt)
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
    err = indexTask.Await(ctx)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [{
    collection_name: "my_collection",
    field_name: "vector",
    index_type: "AUTOINDEX",
    metric_type: "COSINE"
},{
    collection_name: "my_collection",
    // Index the partition key
    field_name: "my_varchar",
    // highlight-next-line
    index_type: "INVERTED"
}]

await client.createIndex(index_params)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "my_varchar",
            "indexName": "my_varchar",
            "indexType": "INVERTED"
        }
    ]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>

</Tabs>

これらのインデックスパラメーターは、コレクションの作成時に渡すか、既存のコレクションにインデックスを作成するときに渡します。詳細については、[Create コレクション](./manage-collections-sdks) を参照してください。

## Partition Key Isolation を使用する\{#use-partition-key-isolation}

マルチテナンシーのシナリオでは、テナントの識別情報に関連するスカラーフィールドを Partition Key に指定し、このスカラーフィールドの特定の値に基づくフィルターを作成できます。同様のシナリオで検索パフォーマンスをさらに向上させるために、Zilliz Cloud は Partition Key Isolation 機能を提供しています。

![Partition Key Isolation](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/860603c61403ad03f54e29f4dbd3188761ade992a5f15182ffe8f7cf9d912b07.png)

上の図に示すように、Zilliz Cloud は Partition Key 値に基づいてエンティティをグループ化し、各グループに個別のインデックスを作成します。検索リクエストを受信すると、Zilliz Cloud はフィルター条件で指定された Partition Key 値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティ内に検索範囲を制限します。これにより、検索中に関係のないエンティティをスキャンすることを回避し、検索パフォーマンスを大幅に向上させます。

Partition Key Isolation を有効にした後は、Zilliz Cloud が一致するインデックスに含まれるエンティティ内に検索範囲を制限できるように、Partition Key ベースのフィルターに特定の値を 1 つだけ含める必要があります。

<Admonition type="info" icon="📘" title="Notes">

現在、Partition Key Isolation 機能は、インデックスタイプが HNSW に設定された検索にのみ適用されます。

</Admonition>

Partition Key Isolation は、Partition Key フィールドのスカラーインデックスに代わるものではありません。フィルター内の Partition Key 値は一致するサブインデックスを特定しますが、Zilliz Cloud は一致するエンティティを特定するためにフィルター自体を引き続き評価するため、[Partition Key にインデックスを作成する](./use-partition-key#index-partition-key) こともお勧めします。

### Partition Key Isolation を有効にする\{#enable-partition-key-isolation}

次のコード例は、Partition Key Isolation を有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    properties={"partitionkey.isolation": True}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

Map<String, String> properties = new HashMap<>();
properties.put("partitionkey.isolation", "true");

CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .properties(properties)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithProperty("partitionkey.isolation", true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .properties(HashMap::from([(
            "partitionkey.isolation".to_string(),
            "true".to_string(),
        )]))
        .build()?,
)
.await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .AddProperty("partitionkey.isolation", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
})
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Collection;

await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = "my_collection",
    Schema = schema,
    Properties = { ["partitionkey.isolation"] = "true" }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "partitionKeyIsolation": true
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>

</Tabs>


Partition Key Isolation を有効にした後も、[パーティション数の設定](./use-partition-key#set-partition-numbers) で説明されているように、Partition Key とパーティション数を設定できます。Partition Key ベースのフィルターには、特定の Partition Key 値のみを含める必要があることに注意してください。

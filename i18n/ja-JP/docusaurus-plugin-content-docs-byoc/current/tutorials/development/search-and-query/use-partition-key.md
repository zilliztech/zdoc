---
title: "Partition Key を使用する | BYOC"
slug: /use-partition-key
sidebar_label: "Partition Key (Namespace)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Partition Key は、collection の namespace として機能することで論理的なデータ分離を可能にする検索最適化ソリューションです。特定の scalar フィールド（tenant ID や project 名など）を Partition Key として指定することで、1 つの collection 内のデータを個別の namespace に効果的に分割できます。これにより、検索リクエストはフィルタリング条件を通じて特定の namespace に限定でき、検索範囲を大幅に狭めて全体的な効率を向上させます。この記事では、この namespace ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項を紹介します。 | BYOC"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Partition Key を使用する

**Partition Key** は、collection の **namespace** として機能することで論理的なデータ分離を可能にする検索最適化ソリューションです。特定の scalar フィールド（tenant ID や project 名など）を Partition Key として指定することで、1 つの collection 内のデータを個別の namespace に効果的に分割できます。これにより、検索リクエストはフィルタリング条件を通じて特定の namespace に限定でき、検索範囲を大幅に狭めて全体的な効率を向上させます。この記事では、この namespace ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項を紹介します。

## 概要\{#overview}

Zilliz Cloud では、partition を使用してデータ分離を実装し、検索範囲を特定の partition に制限することで検索パフォーマンスを向上できます。partition を手動で管理する場合、1 つの collection に最大 1,024 個の partition を作成でき、特定のルールに基づいて entity をこれらの partition に挿入することで、検索を特定数の partition 内に制限して検索範囲を狭めることができます。

Zilliz Cloud では、collection に作成できる partition 数の制限を克服するために、データ分離で partition を再利用する Partition Key を導入しています。collection の作成時に、scalar フィールドを Partition Key として使用できます。collection の準備が整うと、Zilliz Cloud は指定された数の partition を collection 内に作成します。挿入された entity を受け取ると、Zilliz Cloud はその entity の Partition Key 値を使用してハッシュ値を計算し、そのハッシュ値と collection の `partitions_num` プロパティに基づいて剰余演算を実行して対象 partition の ID を取得し、その entity を対象 partition に保存します。

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](https://zdoc-images.s3.us-west-2.amazonaws.com/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

次の図は、Partition Key 機能が有効な場合と無効な場合で、Zilliz Cloud が collection 内の検索リクエストをどのように処理するかを示しています。 

- Partition Key が無効な場合、Zilliz Cloud は collection 内でクエリ vector に最も類似した entity を検索します。どの partition に最も関連性の高い結果が含まれているかが分かっている場合は、検索範囲を狭めることができます。

- Partition Key が有効な場合、Zilliz Cloud は検索フィルタで指定された Partition Key 値に基づいて検索範囲を決定し、一致する partition 内の entity のみをスキャンします。

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](https://zdoc-images.s3.us-west-2.amazonaws.com/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## Partition Key を使用する\{#use-partition-key}

Partition Key を使用するには、次の作業が必要です。

- [Partition Key を設定する](./use-partition-key#set-partition-key)

- [作成する partition 数を設定する](./use-partition-key#set-partition-numbers)（任意）

- [Partition Key に基づくフィルタリング条件を作成する](./use-partition-key#create-filtering-condition)

### Partition Key を設定する\{#set-partition-key}

scalar フィールドを Partition Key として指定するには、その scalar フィールドを追加する際に `is_partition_key` 属性を `true` に設定する必要があります。

<Admonition type="info" icon="📘" title="注意">

scalar フィールドを Partition Key として設定すると、そのフィールド値を空または null にすることはできません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 3. Create a collection in customized setup mode
// 3.1 Define fields
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
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithPartitionKey(true).WithMaxLength(512));
```

</TabItem>
</Tabs>

### partition 数を設定する\{#set-partition-numbers}

collection 内の scalar フィールドを Partition Key として指定すると、Zilliz Cloud は collection 内に自動的に 16 個の partition を作成します。entity を受け取ると、Zilliz Cloud はその entity の Partition Key 値に基づいて partition を選択し、その partition に entity を保存します。その結果、一部またはすべての partition に異なる Partition Key 値を持つ entity が格納されます。 

また、collection とあわせて作成する partition 数を指定することもできます。これは、Partition Key として指定された scalar フィールドがある場合にのみ有効です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
await client.create_collection({
    collection_name: "my_collection",
    schema: schema,
    num_partitions: 128
})
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithNumPartitions(128));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### フィルタリング条件を作成する\{#create-filtering-condition}

Partition Key 機能が有効な collection で ANN 検索を行う場合、検索リクエストに Partition Key を含むフィルタ式を含める必要があります。フィルタ式では、Partition Key 値を特定の範囲内に制限できるため、Zilliz Cloud は対応する partition 内に検索範囲を制限できます。 

削除操作を実行する際は、より効率的な削除を実現するために、単一の partition key を指定するフィルタ式を含めることが推奨されます。この方法により削除操作が特定の partition に限定され、compaction 時の書き込み増幅が減少し、compaction と indexing のためのリソースを節約できます。

次の例は、特定の Partition Key 値と、Partition Key 値のセットに基づく Partition-Key ベースのフィルタリングを示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
String filter = "partition_key in ['x', 'y', 'z'] && <other conditions>";
```

</TabItem>

<TabItem value='go'>

```go
// Filter based on a single partition key value, or
filter = "partition_key == 'x' && <other conditions>"

// Filter based on multiple partition key values
filter = "partition_key in ['x', 'y', 'z'] && <other conditions>"
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Filter based on a single partition key value, or
const filter = 'partition_key == "x" && <other conditions>'

// Filter based on multiple partition key values
const filter = 'partition_key in ["x", "y", "z"] && <other conditions>'
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

<TabItem value='c++'>

```c++
const auto filter = R"(partition_key == 'x' && <other conditions>)";
const auto filter = R"(partition_key in ['x', 'y', 'z'] && <other conditions>)";
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注意">

`partition_key` は、partition key として指定したフィールド名に置き換える必要があります。

</Admonition>

## Partition Key Isolation を使用する\{#use-partition-key-isolation}

マルチテナンシーのシナリオでは、tenant の識別情報に関連する scalar フィールドを partition key として指定し、この scalar フィールドの特定の値に基づくフィルタを作成できます。このようなシナリオで検索パフォーマンスをさらに向上させるために、Zilliz Cloud では Partition Key Isolation 機能を導入しています。

![BVotwv5BvhBWXXbvotUccowZnng](https://zdoc-images.s3.us-west-2.amazonaws.com/BVotwv5BvhBWXXbvotUccowZnng.png)

上の図に示すように、Zilliz Cloud は Partition Key 値に基づいて entity をグループ化し、それぞれのグループごとに個別の index を作成します。検索リクエストを受け取ると、Zilliz Cloud はフィルタリング条件で指定された Partition Key 値に基づいて index を特定し、その index に含まれる entity 内に検索範囲を制限します。これにより、検索時に無関係な entity をスキャンすることを避け、検索パフォーマンスを大幅に向上させます。

Partition Key Isolation を有効にした後は、Zilliz Cloud が一致する index に含まれる entity 内に検索範囲を制限できるように、Partition-key ベースのフィルタには 1 つの特定の値のみを含める必要があります。

### Partition Key Isolation を有効にする\{#enable-partition-key-isolation}

次のコード例は、Partition Key Isolation を有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
})
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .AddProperty("partitionkey.isolation", "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

Partition Key Isolation を有効にした後でも、[partition 数を設定する](./use-partition-key#set-partition-numbers) で説明したように Partition Key と partition 数を設定できます。Partition-Key ベースのフィルタには、1 つの特定の Partition Key 値のみを含める必要がある点に注意してください。

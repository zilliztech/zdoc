---
title: "Partition Key を使用する | Cloud"
slug: /use-partition-key
sidebar_label: "Partition Key（Namespace）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Partition Key は、コレクションの namespace として機能することで論理的なデータ分離を可能にする検索最適化ソリューションです。特定のスカラーフィールド（tenant ID やプロジェクト名など）を Partition Key として指定することで、1 つのコレクション内のデータを個別の namespace に効果的に分割できます。これにより、フィルタリング条件を通じて検索リクエストを特定の namespace に限定でき、検索範囲を大幅に狭めて全体的な効率を向上させることができます。この記事では、この namespace ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項を紹介します。 | Cloud"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Partition Key を使用する

**Partition Key** は、コレクションの **namespace** として機能することで論理的なデータ分離を可能にする検索最適化ソリューションです。特定のスカラーフィールド（tenant ID やプロジェクト名など）を Partition Key として指定することで、1 つのコレクション内のデータを個別の namespace に効果的に分割できます。これにより、フィルタリング条件を通じて検索リクエストを特定の namespace に限定でき、検索範囲を大幅に狭めて全体的な効率を向上させることができます。この記事では、この namespace ベースの最適化を実装する方法と、Partition Key を使用する際の考慮事項を紹介します。

## 概要\{#overview}

Zilliz Cloud では、パーティションを使用してデータ分離を実装し、検索範囲を特定のパーティションに制限することで検索パフォーマンスを向上させることができます。パーティションを手動で管理する場合、1 つのコレクションに最大 1,024 個のパーティションを作成でき、特定のルールに基づいてエンティティをこれらのパーティションに挿入することで、検索を特定数のパーティション内に制限して検索範囲を狭めることができます。

Zilliz Cloud は、1 つのコレクションに作成できるパーティション数の制限を克服し、データ分離においてパーティションを再利用できるようにするために Partition Key を導入しています。コレクションの作成時に、スカラーフィールドを Partition Key として使用できます。コレクションの準備ができると、Zilliz Cloud はコレクション内に指定された数のパーティションを作成します。エンティティの挿入を受け取ると、Zilliz Cloud はそのエンティティの Partition Key 値を使用してハッシュ値を計算し、そのハッシュ値とコレクションの `partitions_num` プロパティに基づいて剰余演算を実行して対象のパーティション ID を取得し、そのエンティティを対象のパーティションに保存します。

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](https://zdoc-images.s3.us-west-2.amazonaws.com/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

次の図は、Partition Key 機能が有効なコレクションと無効なコレクションで、Zilliz Cloud が検索リクエストをどのように処理するかを示しています。 

- Partition Key が無効な場合、Zilliz Cloud はコレクション内でクエリベクトルに最も類似するエンティティを検索します。最も関連性の高い結果を含むパーティションがわかっている場合は、検索範囲を狭めることができます。

- Partition Key が有効な場合、Zilliz Cloud は検索フィルターで指定された Partition Key 値に基づいて検索範囲を決定し、一致するパーティション内のエンティティのみをスキャンします。

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](https://zdoc-images.s3.us-west-2.amazonaws.com/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## Partition Key を使用する\{#use-partition-key}

Partition Key を使用するには、次の操作が必要です。

- [Partition Key を設定する](./use-partition-key#set-partition-key)

- [作成するパーティション数を設定する](./use-partition-key#set-partition-numbers)（任意）

- [Partition Key に基づくフィルタリング条件を作成する](./use-partition-key#create-filtering-condition)

### Partition Key を設定する\{#set-partition-key}

スカラーフィールドを Partition Key として指定するには、そのスカラーフィールドを追加するときに `is_partition_key` 属性を `true` に設定する必要があります。

<Admonition type="info" title="Notes">

スカラーフィールドを Partition Key として設定した場合、フィールド値を空または null にすることはできません。

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

### パーティション数を設定する\{#set-partition-numbers}

コレクション内のスカラーフィールドを Partition Key として指定すると、Zilliz Cloud はコレクション内に自動的に 16 個のパーティションを作成します。エンティティを受け取ると、Zilliz Cloud はそのエンティティの Partition Key 値に基づいてパーティションを選択し、そのパーティションにエンティティを保存します。その結果、一部またはすべてのパーティションに、異なる Partition Key 値を持つエンティティが格納されることになります。 

また、コレクションとあわせて作成するパーティション数を指定することもできます。これは、Partition Key として指定されたスカラーフィールドがある場合にのみ有効です。

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

Partition Key 機能が有効なコレクションで ANN 検索を実行する場合、検索リクエストに Partition Key を含むフィルタリング式を含める必要があります。フィルタリング式では、Partition Key 値を特定の範囲に制限できるため、Zilliz Cloud は対応するパーティション内に検索範囲を制限できます。 

削除操作を実行する場合は、より効率的な削除を実現するために、単一のパーティションキーを指定するフィルター式を含めることを推奨します。この方法では削除操作を特定のパーティションに限定できるため、Compaction 中の書き込み増幅を抑制し、Compaction とインデックス作成のためのリソースを節約できます。

次の例では、特定の Partition Key 値と複数の Partition Key 値のセットに基づく Partition Key ベースのフィルタリングを示します。

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

<Admonition type="info" title="Notes">

`partition_key` は、パーティションキーとして指定されたフィールドの名前に置き換える必要があります。

</Admonition>

## Partition Key Isolation を使用する\{#use-partition-key-isolation}

マルチテナンシーのシナリオでは、テナントの識別情報に関連するスカラーフィールドをパーティションキーとして指定し、このスカラーフィールド内の特定の値に基づくフィルターを作成できます。このようなシナリオで検索パフォーマンスをさらに向上させるために、Zilliz Cloud は Partition Key Isolation 機能を導入しています。

![BVotwv5BvhBWXXbvotUccowZnng](https://zdoc-images.s3.us-west-2.amazonaws.com/BVotwv5BvhBWXXbvotUccowZnng.png)

上図に示すように、Zilliz Cloud は Partition Key 値に基づいてエンティティをグループ化し、これらのグループごとに個別のインデックスを作成します。検索リクエストを受け取ると、Zilliz Cloud はフィルタリング条件で指定された Partition Key 値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティ内に検索範囲を制限します。これにより、検索中に関係のないエンティティをスキャンすることを回避し、検索パフォーマンスを大幅に向上させます。

Partition Key Isolation を有効にした後は、一致するインデックスに含まれるエンティティ内に Zilliz Cloud が検索範囲を制限できるように、Partition Key ベースのフィルターに 1 つの特定の値のみを含める必要があります。

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

Partition Key Isolation を有効にした後でも、[パーティション数を設定する](./use-partition-key#set-partition-numbers) で説明されているとおり、Partition Key とパーティション数を設定できます。なお、Partition Key ベースのフィルターには、1 つの特定の Partition Key 値のみを含める必要があります。

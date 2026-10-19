---
title: "コレクションを作成する | Cloud"
slug: /manage-collections-sdks
sidebar_label: "マネージドコレクション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマ、インデックスパラメーター、メトリックタイプ、作成時にロードするかどうかを定義してコレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。 | Cloud"
type: origin
token: EmcowmwYpiFbWgkmnqfcMf3knVc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを作成する

スキーマ、インデックスパラメーター、メトリックタイプ、作成時にロードするかどうかを定義してコレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。

<Admonition type="info" title="Notes">

強力なデータ分離が必要で、管理するテナント数が少ない場合は、テナントごとに個別のコレクションを作成できます。

ただし、[プロジェクトプランとクラスターデプロイオプション](./limits) によって、作成できるコレクションは最大 16,384 個です。そのため、大規模なマルチテナンシーでは、ユースケースに応じて、パーティションベースまたはパーティションキーベースのマルチテナンシーなどの代替戦略の使用を検討してください。詳細は、[マルチテナンシーの実装](./multi-tenancy) を参照してください。

</Admonition>

## 概要\{#overview}

コレクションは、固定された列と可変の行を持つ 2 次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。このような構造化データ管理を実装するには、スキーマが必要です。挿入するすべてのエンティティは、スキーマで定義された制約を満たす必要があります。

スキーマ、インデックスパラメーター、メトリックタイプ、作成時にロードするかどうかなど、コレクションのあらゆる側面を決定して、コレクションが要件を完全に満たすようにできます。

コレクションを作成するには、次の作業を行います。

- [スキーマの作成](./manage-collections-sdks#create-schema)

- [インデックスパラメーターの設定](./manage-collections-sdks#optional-set-index-parameters)（任意）

- [コレクションの作成](./manage-collections-sdks#create-a-collection)

## スキーマを作成する\{#create-schema}

スキーマはコレクションのデータ構造を定義します。コレクションを作成するときは、要件に基づいてスキーマを設計する必要があります。詳細は、[スキーマの説明](./schema-explained) を参照してください。

次のコードスニペットは、動的フィールドを有効にし、`my_id`、`my_vector`、`my_varchar` という名前の 3 つの必須フィールドを持つスキーマを作成します。

<Admonition type="info" title="Notes">

すべてのスカラーフィールドにデフォルト値を設定し、NULL 許容にできます。詳細は、[NULL 許容とデフォルト値](./nullable-fields) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3. Create a collection in customized setup mode
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 3.1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 3.2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
schema.add_field(field_name="my_varchar", datatype=DataType.VARCHAR, max_length=512)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 3. Create a collection in customized setup mode

// 3.1 Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 3.2 Add fields to schema
schema.addField(AddFieldReq.builder()
        .fieldName("my_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("my_vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("my_varchar")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(true).
        WithField(entity.NewField().WithName("my_id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("my_vector").WithDataType(entity.FieldTypeFloatVector).WithDim(5)).
        WithField(entity.NewField().WithName("my_varchar").WithDataType(entity.FieldTypeVarChar).WithMaxLength(512))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// 3. Create a collection in customized setup mode
// 3.1 + 3.2 Create schema and add fields
let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let schema = CollectionSchema::new()
    .enable_dynamic_field(true)
    .add_field(FieldSchema::new().name("my_id").description("my id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("my_vector").data_type(DataType::FloatVector).dimension(5))
    .add_field(FieldSchema::new().name("my_varchar").data_type(DataType::VarChar).max_length(512));
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(true);
schema->AddField(milvus::FieldSchema("my_id", milvus::DataType::INT64, "my id", true, false));
schema->AddField(milvus::FieldSchema("my_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithMaxLength(512));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 3. Create a collection in customized setup mode
// 3.1 + 3.2 Create schema and define fields
const fields = [
    {
        name: "my_id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "my_vector",
        data_type: DataType.FloatVector,
        dim: 5
    },
    {
        name: "my_varchar",
        data_type: DataType.VarChar,
        max_length: 512
    }
]
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": true,
        "fields": [
            {
                "fieldName": "my_id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "my_vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

## （任意）インデックスパラメーターを設定する\{#optional-set-index-parameters}

特定のフィールドにインデックスを作成すると、そのフィールドに対する検索を高速化できます。インデックスは、コレクション内のエンティティの順序を記録します。次のコードスニペットに示すように、`metric_type` と `index_type` を使用して、Zilliz Cloud がフィールドにインデックスを作成し、ベクトル埋め込み間の類似性を測定するための適切な方法を選択できます。

Zilliz Cloud では、すべてのベクトルフィールドのインデックスタイプとして `AUTOINDEX` を使用でき、必要に応じて `COSINE`、`L2`、`IP` のいずれかをメトリックタイプとして使用できます。

上記のコードスニペットに示すように、ベクトルフィールドにはインデックスタイプとメトリックタイプの両方を設定し、スカラーフィールドにはインデックスタイプのみを設定する必要があります。インデックスはベクトルフィールドに必須であり、フィルター条件で頻繁に使用するスカラーフィールドにはインデックスを作成することをお勧めします。

詳細は、[インデックス](./indexes) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3.3. Prepare index parameters
index_params = client.prepare_index_params()

# 3.4. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="AUTOINDEX"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="COSINE"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

// 3.3 + 3.4 Prepare index parameters and add indexes
IndexParam indexParamForIdField = IndexParam.builder()
        .fieldName("my_id")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build();

IndexParam indexParamForVectorField = IndexParam.builder()
        .fieldName("my_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

collectionName := "customized_setup_1"
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "my_id", index.NewAutoIndex(entity.COSINE)),
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// 3.3 + 3.4 Prepare and add index parameters
let index_params = vec![
    IndexParam::new().field_name("my_vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
    IndexParam::new().field_name("my_id").index_type(IndexType::AutoIndex),
];
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("my_vector", "my_vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE),
    milvus::IndexDesc("my_id", "my_id", milvus::IndexType::AUTOINDEX)};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3.3 + 3.4 Prepare and add index parameters
const index_params = [{
    field_name: "my_id",
    index_type: "AUTOINDEX"
},{
    field_name: "my_vector",
    index_type: "AUTOINDEX",
    metric_type: "COSINE"
}]
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "my_vector",
            "metricType": "COSINE",
            "indexName": "my_vector",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "my_id",
            "indexName": "my_id",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

## コレクションを作成する\{#create-a-collection}

インデックスパラメーターを指定してコレクションを作成した場合、Zilliz Cloud はコレクションの作成時に自動的にコレクションをロードします。この場合、インデックスパラメーターで言及されているすべてのフィールドにインデックスが作成されます。

次のコードスニペットは、インデックスパラメーターを指定してコレクションを作成し、そのロード状態を確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3.5. Create a collection with the index loaded simultaneously
client.create_collection(
    collection_name="customized_setup_1",
    schema=schema,
    index_params=index_params
)

res = client.get_load_state(
    collection_name="customized_setup_1"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

// 3.5 Create a collection with schema and index parameters
CreateCollectionReq customizedSetupReq1 = CreateCollectionReq.builder()
        .collectionName("customized_setup_1")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();

client.createCollection(customizedSetupReq1);

// Check the load state of the collection
GetLoadStateReq customSetupLoadStateReq1 = GetLoadStateReq.builder()
        .collectionName("customized_setup_1")
        .build();

Boolean loaded = client.getLoadState(customSetupLoadStateReq1);
System.out.println(loaded);

// Output:
// true
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_1", schema).
    WithIndexOptions(indexOptions...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// 3.5 Create a collection with the index loaded simultaneously
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_1")
    .schema(schema.clone())
    .index_params(index_params.clone())
    .build()?).await?;

let res = client.get_load_state(GetLoadStateRequest::builder()
    .collection_name("customized_setup_1")
    .build()?).await?;
println!("{:?}", res.state());
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("customized_setup_1")
                                        .WithCollectionSchema(schema)
                                        .WithIndexes(std::move(indexes)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetLoadStateResponse response;
status = client->GetLoadState(milvus::GetLoadStateRequest()
                                .WithCollectionName("customized_setup_1"),
                              response);
std::cout << std::to_string(response.State()) << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3.5 Create a collection with fields and index parameters
let res = await client.createCollection({
    collection_name: "customized_setup_1",
    fields: fields,
    enable_dynamic_field: true,
    index_params: index_params,
})

console.log(res.error_code)

// Output
//
// Success
//

res = await client.getLoadState({
    collection_name: "customized_setup_1"
})

console.log(res.state)

// Output
//
// LoadStateLoaded
//
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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_1\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

インデックスパラメーターを指定せずにコレクションを作成し、後から追加することもできます。この場合、Zilliz Cloud はコレクションの作成時にコレクションをロードしません。既存のコレクションにインデックスを作成する方法の詳細は、[AUTOINDEX の解説](./autoindex-explained) を参照してください。

次のコードスニペットは、インデックスを指定せずにコレクションを作成する方法を示しています。作成時点では、コレクションのロード状態は未ロードのままです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3.6. Create a collection and index it separately
client.create_collection(
    collection_name="customized_setup_2",
    schema=schema,
)

res = client.get_load_state(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

// 3.6 Create a collection and index it separately
CreateCollectionReq customizedSetupReq2 = CreateCollectionReq.builder()
    .collectionName("customized_setup_2")
    .collectionSchema(schema)
    .build();

client.createCollection(customizedSetupReq2);

GetLoadStateReq customSetupLoadStateReq2 = GetLoadStateReq.builder()
        .collectionName("customized_setup_2")
        .build();

Boolean loaded = client.getLoadState(customSetupLoadStateReq2);
System.out.println(loaded);

// Output:
// false
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_2", schema))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("customized_setup_2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state.State)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// 3.6 Create a collection and index it separately
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_2")
    .schema(schema.clone())
    .build()?).await?;

let res = client.get_load_state(GetLoadStateRequest::builder()
    .collection_name("customized_setup_2")
    .build()?).await?;
println!("{:?}", res.state());
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("customized_setup_2")
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetLoadStateResponse response;
status = client->GetLoadState(milvus::GetLoadStateRequest()
                                .WithCollectionName("customized_setup_2"),
                              response);
std::cout << std::to_string(response.State()) << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3.6 Create a collection and index it separately
let res = await client.createCollection({
    collection_name: "customized_setup_2",
    fields: fields,
    enable_dynamic_field: true,
})

console.log(res.error_code)

// Output
//
// Success
//

res = await client.getLoadState({
    collection_name: "customized_setup_2"
})

console.log(res.state)

// Output
//
// LoadStateNotLoad
//
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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_2\",
    \"schema\": $schema
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_2\"
}"
```

</TabItem>
</Tabs>

## コレクションプロパティを設定する\{#set-collection-properties}

作成するコレクションにプロパティを設定して、サービスに適合させることができます。適用可能なプロパティは以下の通りです。

### シャード数を設定する\{#set-shard-number}

シャードはコレクションを水平方向に分割したものであり、各シャードは 1 つのデータ入力チャネルに対応します。デフォルトでは、すべてのコレクションに 1 つのシャードがあります。コレクションを作成するときにシャード数を指定して、データ量とワークロードにより適した構成にできます。

シャード数を設定する際の一般的なガイドラインとして、以下を考慮してください。

- **データサイズ:** 一般的な方法では、2 億エンティティごとに 1 つのシャードを用意します。データの総量に基づいて見積もることもできます。たとえば、挿入する予定のデータが 100 GB 増えるごとに 1 つのシャードを追加します。

次のコードスニペットは、コレクションの作成時にシャード数を設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# With shard number
client.create_collection(
    collection_name="customized_setup_3",
    schema=schema,
    # highlight-next-line
    num_shards=1
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// With shard number
CreateCollectionReq customizedSetupReq3 = CreateCollectionReq.builder()
    .collectionName("customized_setup_3")
    .collectionSchema(schema)
    // highlight-next-line
    .numShards(1)
    .build();
client.createCollection(customizedSetupReq3);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_3", schema).WithShardNum(1))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// With shard number
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_3")
    .schema(schema.clone())
    .num_shards(1)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("customized_setup_3")
                                          .WithCollectionSchema(schema)
                                          .WithNumShards(1));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_3",
    fields: fields,
    enable_dynamic_field: true,
    // highlight-next-line
    shards_num: 1
}
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "shardsNum": 1
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_3\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### mmap を有効にする\{#enable-mmap}

Zilliz Cloud はデフォルトですべてのコレクションで mmap を有効にしており、Zilliz Cloud は生のフィールドデータを完全にはロードせずにメモリにマッピングできます。これによりメモリフットプリントが削減され、コレクション容量が増加します。mmap の詳細は、[mmap の使用](./use-mmap) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# With mmap
client.create_collection(
    collection_name="customized_setup_4",
    schema=schema,
    # highlight-next-line
    enable_mmap=False
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.Constant;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// With MMap
CreateCollectionReq customizedSetupReq4 = CreateCollectionReq.builder()
        .collectionName("customized_setup_4")
        .collectionSchema(schema)
        // highlight-next-line
        .property(Constant.MMAP_ENABLED, "false")
        .build();
client.createCollection(customizedSetupReq4);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_4", schema).
    WithProperty(common.MmapEnabledKey, false))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// With mmap
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_4")
    .schema(schema.clone())
    .properties(std::collections::HashMap::from([("mmap.enabled".to_string(), "false".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("customized_setup_4")
                                          .WithCollectionSchema(schema)
                                          .AddProperty(milvus::MMAP_ENABLED, "false"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createCollection({
    collection_name: "customized_setup_4",
    fields: fields,
    enable_dynamic_field: true,
    properties: {
        'mmap.enabled': false,
    },
})
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "mmap.enabled": false
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_4\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### コレクションの TTL を設定する\{#set-collection-ttl}

コレクション内のデータを特定の期間後に削除する必要がある場合は、Time-To-Live（TTL）を秒単位で設定することを検討してください。TTL がタイムアウトすると、Zilliz Cloud はコレクション内のエンティティを削除します。削除は非同期で行われるため、削除が完了するまでは検索やクエリを実行できます。

次のコードスニペットでは、TTL を 1 日（86400 秒）に設定しています。TTL は最低でも数日間に設定することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# With TTL
client.create_collection(
    collection_name="customized_setup_5",
    schema=schema,
    # highlight-start
    properties={
        "collection.ttl.seconds": 86400
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.Constant;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// With TTL
CreateCollectionReq customizedSetupReq5 = CreateCollectionReq.builder()
        .collectionName("customized_setup_5")
        .collectionSchema(schema)
        // highlight-next-line
        .property(Constant.TTL_SECONDS, "86400")
        .build();
client.createCollection(customizedSetupReq5);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_5", schema).
    WithProperty(common.CollectionTTLConfigKey, 86400))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// With TTL
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_5")
    .schema(schema.clone())
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "86400".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("customized_setup_5")
                                          .WithCollectionSchema(schema)
                                          .AddProperty(milvus::COLLECTION_TTL_SECONDS, "86400"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_5",
    fields: fields,
    enable_dynamic_field: true,
    // highlight-start
    properties: {
        "collection.ttl.seconds": 86400
    }
    // highlight-end
}
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "ttlSeconds": 86400
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_5\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### 整合性レベルを設定する\{#set-consistency-level}

コレクションを作成するときに、コレクション内の検索およびクエリの整合性レベルを設定できます。また、特定の検索またはクエリの実行中にコレクションの整合性レベルを変更することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# With consistency level
client.create_collection(
    collection_name="customized_setup_6",
    schema=schema,
    # highlight-next-line
    consistency_level="Bounded",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// With consistency level
CreateCollectionReq customizedSetupReq6 = CreateCollectionReq.builder()
        .collectionName("customized_setup_6")
        .collectionSchema(schema)
        // highlight-next-line
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();
client.createCollection(customizedSetupReq6);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_6", schema).
    WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// With consistency level
client.create_collection(CreateCollectionRequest::builder()
    .collection_name("customized_setup_6")
    .schema(schema.clone())
    .consistency_level(ConsistencyLevel::Bounded)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("customized_setup_6")
                                          .WithCollectionSchema(schema)
                                          .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_6",
    fields: fields,
    enable_dynamic_field: true,
    // highlight-next-line
    consistency_level: "Bounded",
}

client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "consistencyLevel": "Bounded"
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"customized_setup_6\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

整合性レベルの詳細は、[整合性レベル](./consistency-level) を参照してください。

### 動的フィールドを有効にする\{#enable-dynamic-field}

コレクションの動的フィールドは、**\&#36;meta** という名前の予約済み JavaScript Object Notation（JSON）フィールドです。このフィールドを有効にすると、Zilliz Cloud は各エンティティに含まれるスキーマ未定義のすべてのフィールドとその値を、キーと値のペアとして予約済みフィールドに保存します。

動的フィールドの使用方法の詳細は、[動的フィールド](./enable-dynamic-field) を参照してください。

---
title: "Collectionの作成 | Cloud"
slug: /manage-collections-sdks
sidebar_label: "Managed Collection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "schema、indexパラメーター、metric type、作成時に読み込むかどうかを定義することで、collectionを作成できます。このページでは、collectionをゼロから作成する方法を紹介します。 | Cloud"
type: origin
token: EmcowmwYpiFbWgkmnqfcMf3knVc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - collectionの作成
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Collectionの作成

schema、indexパラメーター、metric type、作成時に読み込むかどうかを定義することで、collectionを作成できます。このページでは、collectionをゼロから作成する方法を紹介します。

<Admonition type="info" icon="📘" title="注記">

強力なデータ分離が必要で、少数のテナントのみを管理する場合は、テナントごとに個別のcollectionを作成できます。

ただし、[project planおよびcluster deployment option](./limits)に応じて、作成できるcollectionは最大16,384個までです。そのため、大規模なマルチテナンシーでは、ユースケースに応じて、partitionベースまたはpartition-keyベースのマルチテナンシーなどの代替戦略の使用を検討してください。詳細については、[マルチテナンシーの実装](./multi-tenancy)を参照してください。

</Admonition>

## 概要\{#overview}

collectionは、固定された列と可変の行を持つ2次元テーブルです。各列はfieldを表し、各行はentityを表します。このような構造化データ管理を実装するにはschemaが必要です。挿入するすべてのentityは、schemaで定義された制約を満たす必要があります。

collectionが要件を完全に満たすように、schema、indexパラメーター、metric type、作成時に読み込むかどうかなど、collectionのあらゆる側面を決定できます。

collectionを作成するには、以下を行う必要があります。

- [schemaを作成する](./manage-collections-sdks#create-schema)

- [indexパラメーターを設定する](./manage-collections-sdks#optional-set-index-parameters)（オプション）

- [collectionを作成する](./manage-collections-sdks#create-a-collection)

## Schemaを作成する\{#create-schema}

schemaはcollectionのデータ構造を定義します。collectionを作成する際は、要件に基づいてschemaを設計する必要があります。詳細については、[Schema Explained](./schema-explained)を参照してください。

次のコードスニペットは、有効化されたdynamic fieldと、`my_id`、`my_vector`、`my_varchar`という名前の3つの必須fieldを持つschemaを作成します。

<Admonition type="info" icon="📘" title="注記">

任意のscalar fieldにデフォルト値を設定し、nullableにすることができます。詳細については、[Nullable & Default](./nullable-fields)を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/v2/common"
)
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
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

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enabledDynamicField": false,
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("my_id", milvus::DataType::INT64, "my id", true, false));
schema->AddField(milvus::FieldSchema("my_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(5));
schema->AddField(milvus::FieldSchema("my_varchar", milvus::DataType::VARCHAR).WithMaxLength(512));
```

</TabItem>
</Tabs>

## （オプション）Indexパラメーターを設定する\{#optional-set-index-parameters}

特定のfieldにindexを作成すると、そのfieldに対する検索が高速化されます。indexはcollection内のentityの順序を記録します。次のコードスニペットに示すように、`metric_type`と`index_type`を使用して、Zilliz Cloudがfieldをindex化し、vector embeddings間の類似度を測定するための適切な方法を選択できます。

Zilliz Cloudでは、すべてのvector fieldに対してindex typeとして`AUTOINDEX`を使用でき、ニーズに基づいてmetric typeとして`COSINE`、`L2`、`IP`のいずれかを使用できます。

上記のコードスニペットで示したように、vector fieldにはindex typeとmetric typeの両方を設定し、scalar fieldにはindex typeのみを設定する必要があります。vector fieldにはindexが必須であり、フィルタリング条件で頻繁に使用されるscalar fieldにはindexを作成することをお勧めします。

詳細については、[Indexes](./indexes)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

// 3.3 Prepare index parameters
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

<TabItem value='javascript'>

```javascript
// 3.2 Prepare index parameters
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

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

collectionName := "customized_setup_1"
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "my_id", index.NewAutoIndex(entity.COSINE)),
}
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("my_vector", "my_vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE),
    milvus::IndexDesc("my_id", "my_id", milvus::IndexType::AUTOINDEX)};
}
```

</TabItem>
</Tabs>

## Collectionを作成する\{#create-a-collection}

indexパラメーターを指定してcollectionを作成した場合、Zilliz Cloudは作成時にcollectionを自動的に読み込みます。この場合、indexパラメーターに記載されているすべてのfieldがindex化されます。

次のコードスニペットは、indexパラメーターを指定してcollectionを作成し、そのload statusを確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

// 3.4 Create a collection with schema and index parameters
CreateCollectionReq customizedSetupReq1 = CreateCollectionReq.builder()
        .collectionName("customized_setup_1")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();

client.createCollection(customizedSetupReq1);

// 3.5 Get load state of the collection
GetLoadStateReq customSetupLoadStateReq1 = GetLoadStateReq.builder()
        .collectionName("customized_setup_1")
        .build();

Boolean loaded = client.getLoadState(customSetupLoadStateReq1);
System.out.println(loaded);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3.3 Create a collection with fields and index parameters
res = await client.createCollection({
    collection_name: "customized_setup_1",
    fields: fields,
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

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_1", schema).
    WithIndexOptions(indexOptions...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("customized_setup_1")
                                        .WithCollectionSchema(schema))
                                        .WithIndexes(std::move(indexes));
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
</Tabs>

indexパラメーターを指定せずにcollectionを作成し、後から追加することもできます。この場合、Zilliz Cloudは作成時にcollectionを読み込みません。既存のcollectionにindexを作成する方法の詳細については、[AUTOINDEX Explained](./autoindex-explained)を参照してください。

次のコードスニペットは、indexなしでcollectionを作成する方法を示しており、collectionのload statusは作成時にunloadedのままです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
// 3.4 Create a collection and index it seperately
res = await client.createCollection({
    collection_name: "customized_setup_2",
    fields: fields,
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

<TabItem value='go'>

```go
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
</Tabs>

## Collectionプロパティを設定する\{#set-collection-properties}

作成するcollectionにプロパティを設定して、サービスに適合させることができます。適用可能なプロパティは以下のとおりです。

### Shard数を設定する\{#set-shard-number}

shardはcollectionの水平方向のスライスであり、各shardはデータ入力チャネルに対応します。デフォルトでは、すべてのcollectionに1つのshardがあります。collectionを作成する際にshard数を指定して、データ量とワークロードにより適合させることができます。

一般的な指針として、shard数を設定する際には次の点を考慮してください。

- **データサイズ:** 一般的な方法は、2億entityごとに1つのshardを持つことです。合計データサイズに基づいて見積もることもできます。たとえば、挿入予定のデータ100 GBごとに1つのshardを追加します。

次のコードスニペットは、collectionを作成するときにshard数を設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
// With shard number
CreateCollectionReq customizedSetupReq3 = CreateCollectionReq.builder()
    .collectionName("customized_setup_3")
    .collectionSchema(collectionSchema)
    // highlight-next-line
    .numShards(1)
    .build();
client.createCollection(customizedSetupReq3);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_3",
    schema: schema,
    // highlight-next-line
    shards_num: 1
}
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_3", schema).WithShardNum(1))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
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
</Tabs>

### mmapを有効にする\{#enable-mmap}

Zilliz Cloudでは、すべてのcollectionでデフォルトでmmapが有効になっており、raw field dataを完全に読み込む代わりにメモリへマップできます。これにより、メモリフットプリントが削減され、collection容量が増加します。mmapの詳細については、[mmapを使用する](./use-mmap)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
client.create_collection({
    collection_name: "customized_setup_4",
    schema: schema,
     properties: {
        'mmap.enabled': true,
     },
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_4", schema).
    WithProperty(common.MmapEnabledKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "mmap.enabled": True
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("customized_setup_4")
                                          .WithCollectionSchema(schema)
                                          .AddProperty(milvus::MMAP_ENABLED, "true"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### Collection TTLを設定する\{#set-collection-ttl}

collection内のデータを特定の期間で削除する必要がある場合は、Time-To-Live（TTL）を秒単位で設定することを検討してください。TTLがタイムアウトすると、Zilliz Cloudはcollection内のentityを削除します。削除は非同期で行われるため、削除が完了する前でも検索やクエリは引き続き可能です。

次のコードスニペットは、TTLを1日（86400秒）に設定します。TTLは最低でも数日に設定することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_5",
    schema: schema,
    // highlight-start
    properties: {
        "collection.ttl.seconds": 86400
    }
    // highlight-end
}
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_5", schema).
    WithProperty(common.CollectionTTLConfigKey, true))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
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
</Tabs>

### Consistency Levelを設定する\{#set-consistency-level}

collectionを作成する際、collection内の検索とクエリに対するconsistency levelを設定できます。特定の検索またはクエリ中に、collectionのconsistency levelを変更することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# With consistency level
client.create_collection(
    collection_name="customized_setup_6",
    schema=schema,
    # highlight-next
    consistency_level="Bounded",
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;

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

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "customized_setup_6",
    schema: schema,
    // highlight-next
    consistency_level: "Bounded",
    // highlight-end
}

client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("customized_setup_6", schema).
    WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println("collection created")
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
</Tabs>

consistency levelの詳細については、[Consistency Level](./consistency-level)を参照してください。

### Dynamic Fieldを有効にする\{#enable-dynamic-field}

collection内のdynamic fieldは、**\&#36;meta**という名前の予約済みJavaScript Object Notation（JSON）fieldです。このfieldを有効にすると、Zilliz Cloudは各entityに含まれるschemaで定義されていないすべてのfieldとその値を、予約済みfield内のkey-valueペアとして保存します。

dynamic fieldの使用方法の詳細については、[Dynamic Field](./enable-dynamic-field)を参照してください。

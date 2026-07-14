---
title: "コレクションを作成する | BYOC"
slug: /manage-collections-sdks
sidebar_label: "管理対象コレクション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スキーマ、インデックスパラメータ、メトリックタイプ、作成時にロードするかどうかを定義して、コレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。 | BYOC"
type: origin
token: EmcowmwYpiFbWgkmnqfcMf3knVc
sidebar_position: 2
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - コレクション
  - コレクションの作成
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを作成する

スキーマ、インデックスパラメータ、メトリックタイプ、作成時にロードするかどうかを定義して、コレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。

<Admonition type="info" icon="📘" title="注記">

強力なデータ分離が必要で、管理するテナント数が少ない場合は、テナントごとに個別のコレクションを作成できます。

ただし、[プロジェクトプランとクラスターのデプロイオプション](./limits)に応じて、作成できるコレクションの最大数は 16,384 です。したがって、大規模なマルチテナンシーでは、ユースケースに応じて、パーティションベースまたはパーティションキーベースのマルチテナンシーなどの代替戦略の使用を検討してください。詳細は、[マルチテナンシーを実装する](./multi-tenancy) を参照してください。

</Admonition>

## 概要\{#overview}

コレクションは、固定された列と可変の行を持つ二次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。このような構造化データ管理を実装するには、スキーマが必要です。挿入するすべてのエンティティは、スキーマで定義された制約を満たしている必要があります。

スキーマ、インデックスパラメータ、メトリックタイプ、作成時にロードするかどうかなど、コレクションのあらゆる側面を決定して、要件を完全に満たすコレクションを作成できます。

コレクションを作成するには、以下が必要です。

- [スキーマを作成する](./manage-collections-sdks#create-schema)

- [インデックスパラメータを設定する](./manage-collections-sdks#optional-set-index-parameters)（任意）

- [コレクションを作成する](./manage-collections-sdks#create-a-collection)

## スキーマを作成する\{#create-schema}

スキーマはコレクションのデータ構造を定義します。コレクションを作成する際には、要件に基づいてスキーマを設計する必要があります。詳細は、[スキーマの説明](./schema-explained) を参照してください。

次のコードスニペットでは、動的フィールドを有効にし、`my_id`、`my_vector`、`my_varchar` という 3 つの必須フィールドを持つスキーマを作成します。

<Admonition type="info" icon="📘" title="注記">

任意のスカラーフィールドにデフォルト値を設定し、nullable にすることができます。詳細は、[Nullable & Default](./nullable-fields) を参照してください。

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

<Admonition type="info" icon="📘" title="注記">

データプレーンの RESTful API エンドポイントを呼び出す際の認証トークンには、`username:password` のように、対象クラスターのユーザー名とパスワードをコロンで区切った形式を使用してください。

</Admonition>

## （任意）インデックスパラメータを設定する\{#optional-set-index-parameters}

特定のフィールドにインデックスを作成すると、そのフィールドに対する検索が高速化されます。インデックスはコレクション内のエンティティの順序を記録します。次のコードスニペットに示すように、`metric_type` と `index_type` を使用して、Zilliz Cloud がフィールドにインデックスを作成する方法と、ベクトル埋め込み間の類似度を測定する方法を適切に選択できます。

Zilliz Cloud では、すべてのベクトルフィールドのインデックスタイプとして `AUTOINDEX` を使用でき、ニーズに応じて `COSINE`、`L2`、`IP` のいずれかをメトリックタイプとして使用できます。

上記のコードスニペットで示したように、ベクトルフィールドにはインデックスタイプとメトリックタイプの両方を設定し、スカラーフィールドにはインデックスタイプのみを設定する必要があります。ベクトルフィールドにはインデックスが必須であり、フィルタ条件で頻繁に使用されるスカラーフィールドにはインデックスを作成することを推奨します。

詳細は、[インデックス](./indexes) を参照してください。

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

## コレクションを作成する\{#create-a-collection}

インデックスパラメータを指定してコレクションを作成すると、Zilliz Cloud は作成時に自動的にコレクションをロードします。この場合、インデックスパラメータに記載されたすべてのフィールドにインデックスが作成されます。

次のコードスニペットでは、インデックスパラメータを使用してコレクションを作成し、そのロード状態を確認する方法を示します。

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

インデックスパラメータを指定せずにコレクションを作成し、後から追加することもできます。この場合、Zilliz Cloud はコレクションの作成時にそのコレクションをロードしません。既存のコレクションにインデックスを作成する方法の詳細は、[AUTOINDEX の説明](./autoindex-explained) を参照してください。

次のコードスニペットでは、インデックスなしでコレクションを作成する方法を示しており、コレクションのロード状態は作成時に未ロードのままになります。

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

## コレクションプロパティを設定する\{#set-collection-properties}

作成するコレクションにプロパティを設定して、サービスに適合させることができます。適用可能なプロパティは次のとおりです。

### シャード数を設定する\{#set-shard-number}

シャードはコレクションの水平スライスであり、各シャードは 1 つのデータ入力チャネルに対応します。デフォルトでは、すべてのコレクションには 1 つのシャードがあります。データ量やワークロードにより適合させるために、コレクション作成時にシャード数を指定できます。

一般的なガイドラインとして、シャード数を設定する際には次の点を考慮してください。

- **データサイズ:** 一般的には、2 億エンティティごとに 1 つのシャードを持たせるのがよくある方法です。あるいは、総データサイズに基づいて見積もることもでき、たとえば、挿入予定のデータ 100 GB ごとに 1 つのシャードを追加します。

次のコードスニペットは、コレクション作成時にシャード数を設定する方法を示しています。

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

### mmap を有効にする\{#enable-mmap}

Zilliz Cloud では、デフォルトですべてのコレクションで mmap が有効になっており、フィールドの生データを完全にロードする代わりに、それらをメモリにマップできます。これにより、メモリ使用量が削減され、コレクションの容量が増加します。mmap の詳細については、[mmap を使用する](./use-mmap) を参照してください。

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

### コレクション TTL を設定する\{#set-collection-ttl}

コレクション内のデータを一定期間後に削除する必要がある場合は、秒単位で Time-To-Live（TTL）を設定することを検討してください。TTL がタイムアウトすると、Zilliz Cloud はコレクション内のエンティティを削除します。削除は非同期で行われるため、削除が完了する前でも検索やクエリは引き続き可能です。

次のコードスニペットでは、TTL を 1 日（86400 秒）に設定しています。TTL は最低でも数日単位で設定することを推奨します。

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

### 整合性レベルを設定する\{#set-consistency-level}

コレクションを作成する際に、そのコレクション内の検索とクエリに対する整合性レベルを設定できます。また、特定の検索またはクエリの実行時にコレクションの整合性レベルを変更することもできます。

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

整合性レベルの詳細については、[整合性レベル](./consistency-level) を参照してください。

### 動的フィールドを有効にする\{#enable-dynamic-field}

コレクションの動的フィールドは、**\&#36;meta** という名前の予約済み JavaScript Object Notation（JSON）フィールドです。このフィールドを有効にすると、Zilliz Cloud は各エンティティに含まれる、スキーマで定義されていないすべてのフィールドとその値を、予約済みフィールドにキーと値のペアとして保存します。

動的フィールドの使用方法の詳細については、[動的フィールド](./enable-dynamic-field) を参照してください。

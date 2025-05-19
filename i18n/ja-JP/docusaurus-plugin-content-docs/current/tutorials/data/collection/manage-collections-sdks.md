---
title: "コレクションを作成 | Cloud"
slug: /manage-collections-sdks
sidebar_label: "コレクションを作成"
beta: FALSE
notebook: FALSE
description: "スキーマ、インデックスパラメータ、メトリックタイプ、および作成時にロードするかどうかを定義することで、コレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。 | Cloud"
type: origin
token: GnYTwgZkwiXreLkEX7LcmUsrn8d
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - create collection
  - custom setup
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを作成

スキーマ、インデックスパラメータ、メトリックタイプ、および作成時にロードするかどうかを定義することで、コレクションを作成できます。このページでは、コレクションをゼロから作成する方法を紹介します。

## 概要について{#overview}

コレクションは、固定列とバリアント行を持つ2次元テーブルです。各列はフィールドを表し、各行はエンティティを表します。このような構造データ管理を実装するにはスキーマが必要です。挿入するすべてのエンティティは、スキーマで定義された制約を満たす必要があります。

スキーマ、インデックスパラメーター、メトリックタイプ、作成時にロードするかどうかなど、コレクションのあらゆる側面を決定して、コレクションが要件を完全に満たしていることを確認できます。

コレクションを作成するには、

- [スキーマの作成](./manage-collections-sdks#create-schema)

- [インデックスパラメータの設定](./manage-collections-sdks#set-index-parameters)（任意）

- [コレクションを作成](./manage-collections-sdks#create-collection)

## スキーマの作成{#create-schema}

スキーマは、コレクションのデータ構造を定義します。コレクションを作成する際には、要件に基づいてスキーマを設計する必要があります。詳細については、「[スキーマの説明](./schema-explained)」を参照してください。

次のコードスニペットは、有効になっている動的フィールドと名前が必須の3つのフィールド`my_id`、`my_vector`、および`my_varchar`でスキーマを作成します。

<Admonition type="info" icon="📘" title="ノート">

<p>任意のスカラーフィールドに対してデフォルト値を設定し、nullを許容することができます。詳細については、<a href="./nullable-and-default">Nullableデフォルト</a>を参照してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v2/entity"

schema := entity.NewSchema().WithDynamicFieldEnabled(true).
        WithField(entity.NewField().WithName("my_id").WithIsAutoID(true).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
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
</Tabs>

## (オプション)インデックスパラメータの設定{#set-index-parameters}

特定のフィールドにインデックスを作成すると、このフィールドに対する検索が高速化されます。インデックスは、コレクション内のエンティティの順序を記録します。次のコードスニペットに示すように、`metric_type`と`index_type`を使用して、Zilliz Cloudを使用してフィールドをインデックス化し、ベクトル埋め込みの類似性を測定するための適切な方法を選択できます。

Zilliz Cloudでは、すべてのベクトルフィールドのインデックスタイプとして`AUTOINDEX`を使用し、必要に応じてメトリックタイプとして`COSINE`、`L 2`、`IP`のいずれかを使用できます。

上記のコードスニペットで示されているように、ベクトルフィールドにはインデックスタイプとメトリックタイプの両方を設定し、スカラーフィールドにはインデックスタイプのみを設定する必要があります。ベクトルフィールドにはインデックスが必須であり、フィルタリング条件で頻繁に使用されるスカラーフィールドにインデックスを作成することをお勧めします。

詳しくはManage Indexesするを参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 3.3. Prepare index parameters
index_params = client.prepare_index_params()

# 3.4. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
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
        .indexType(IndexParam.IndexType.STL_SORT)
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
    index_type: "STL_SORT"
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

indexOptions := []milvusclient.CreateIndexOption{
    client.NewCreateIndexOption(collectionName, "my_vector", index.NewAutoIndex(entity.COSINE)).WithIndexName("my_vector"),
    client.NewCreateIndexOption(collectionName, "my_id", index.NewSortedIndex()).WithIndexName("my_id"),
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
            "indexType": "STL_SORT"
        }
    ]'
```

</TabItem>
</Tabs>

## コレクションを作成{#create-collection}

インデックスパラメータを持つコレクションを作成した場合、Zilliz Cloudは作成時にコレクションを自動的にロードします。この場合、インデックスパラメータに記載されているすべてのフィールドがインデックス化されます。

次のコードスニペットは、インデックスパラメーターを使用してコレクションを作成し、その読み込み状態を確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err := milvusclient.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_1", schema).
    WithIndexOptions(indexOptions...),
)
if err != nil {
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
-d "{
    \"collectionName\": \"customized_setup_1\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

インデックスパラメータなしでコレクションを作成し、後から追加することもできます。この場合、Zilliz Cloudは作成時にコレクションをロードしません。既存のコレクションのインデックスを作成する方法の詳細については、[AUTOINDEXの説明](./autoindex-explained)を参照してください。

次のコードスニペットは、コレクションなしでコレクションを作成する方法を示しており、コレクションのロード状態は作成時にアンロードされたままになります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err := milvusclient.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_2", schema))
if err != nil {
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
-d "{
    \"collectionName\": \"customized_setup_2\",
    \"schema\": $schema
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"customized_setup_2\"
}"
```

</TabItem>
</Tabs>

Zilliz Cloudでは、コレクションを即座に作成する方法も提供されています。

## コレクションのプロパティを設定{#set-collection-properties}

サービスに合わせてコレクションを作成するためのプロパティを設定することができます。適用可能なプロパティは以下の通りです。

### シャード番号の設定{#set-shard-number}

シャードはコレクションの水平スライスです。各シャードはデータ入力チャネルに対応します。すべてのコレクションにはデフォルトでシャードがあります。コレクションを作成する際に、期待されるスループットとコレクションに挿入するデータの量に基づいて、適切なシャード数を設定できます。

一般的な場合には、期待されるスループットが500 MB/s増加するたびに、または挿入するデータ量が100 GB増加するたびに、シャード数を1つ増やすことを検討してください。この提案は私たち自身の経験に基づいており、アプリケーションシナリオに完全に適合しない場合があります。この数を自分自身のニーズに合わせて調整するか、デフォルト値を使用することができます。

次のコードスニペットは、コレクションを作成するときにシャード番号を設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err := cli.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_3", schema).WithShardNum(1))
if err != nil {
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
-d "{
    \"collectionName\": \"customized_setup_3\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### mmapを有効にする{#enable-mmap}

Zilliz Cloudはデフォルトですべてのコレクションでmmapを有効にします。これにより、Zilliz Cloudは、生のフィールドデータを完全にロードする代わりにメモリにマップできます。これにより、メモリフットプリントが減少し、コレクション容量が増加します。mmapの詳細については、「Use mmap」を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import (
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/common"
)

err := cli.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_4", schema).WithProperty(common.MmapEnabledKey, true))
if err != nil {
    // handle error
}
fmt.Println("collection created")
```

</TabItem>

<TabItem value='bash'>

```bash
# REST 暂无此功能。
```

</TabItem>
</Tabs>

### セットコレクションTTL{#set-collection-ttl}

 コレクション内のデータを特定の期間削除する必要がある場合は、Time-To-Live(TTL)を秒単位で設定することを検討してください。TTLがタイムアウトすると、Zilliz Cloudはコレクション内のエンティティを削除します。削除は非同期であり、削除が完了する前に検索やクエリが可能であることを示しています。

以下のコードスニペットでは、TTLを1日（86400秒）に設定しています。TTLは最低でも数日に設定することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import (
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/pkg/common"
)

err = cli.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_5", schema).
        WithProperty(common.CollectionTTLConfigKey, 86400)) //  TTL in seconds
if err != nil {
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
-d "{
    \"collectionName\": \"customized_setup_5\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### 一貫性レベルを設定{#set-consistency-level}

コレクションを作成する際に、コレクション内の検索やクエリの一貫性レベルを設定できます。また、特定の検索やクエリ中にコレクションの一貫性レベルを変更することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
import (
    "github.com/milvus-io/milvus/client/v2/milvusclient"
    "github.com/milvus-io/milvus/client/v2/entity"
)

err := cli.CreateCollection(ctx, client.NewCreateCollectionOption("customized_setup_6", schema).
    WithConsistencyLevel(entity.ClBounded))
if err != nil {
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
-d "{
    \"collectionName\": \"customized_setup_6\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

一貫性レベルの詳細については、[一貫性レベル](./consistency-level)を参照してください。

### ダイナミックフィールドを有効にする{#enable-dynamic-field}

コレクション内の動的フィールドは、**$meta**という名前の予約済みJava Script Object Notation(JSON)フィールドです。このフィールドを有効にすると、Zilliz Cloudは、各エンティティに含まれるスキーマ定義されていないフィールドとその値を、予約済みフィールドのキーと値のペアとして保存します。

ダイナミックフィールドの使用方法については、[ダイナミックフィールド](./enable-dynamic-field)を参照してください。
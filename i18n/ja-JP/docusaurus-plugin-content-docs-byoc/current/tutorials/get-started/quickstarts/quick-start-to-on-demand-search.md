---
title: "オンデマンド検索クイックスタート | BYOC"
slug: /quick-start-to-on-demand-search
sidebar_label: "オンデマンド検索クイックスタート"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud はオンデマンドのコンピューティングリソースを提供し、類似度検索やクエリを必要なときに実行できます。下図に示すように、リクエストがない場合はコンピューティングリソースが自動的にサスペンドされ、サスペンド中は料金が発生しません。 | BYOC"
type: origin
token: GQN0wDCrni4n36kyeVQcF41Lned
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# オンデマンド検索クイックスタート

Zilliz Cloud はオンデマンドのコンピューティングリソースを提供し、類似度検索やクエリを必要なときに実行できます。下図に示すように、リクエストがない場合はコンピューティングリソースが自動的にサスペンドされ、サスペンド中は料金が発生しません。

![ZhWHbgOD0o56IpxbQ32ctGaInBe](https://zdoc-images.s3.us-west-2.amazonaws.com/zhwhbgod0o56ipxbq32ctgainbe.png "ZhWHbgOD0o56IpxbQ32ctGaInBe")

## ステップ 1: プロジェクトエンドポイントに接続する\{#step-1-connect-to-a-project-endpoint}

データベースを操作する前に、プロジェクトエンドポイントに接続します。プロジェクトエンドポイントは、Zilliz Cloud コンソールでオンデマンドコンピューティングを有効にした後、クイックスタートページから取得できます。

<Admonition type="info" icon="📘" title="Notes">

- マネージドコレクションの操作には、認証に **API key** が必要です。このフローでは `username:password` 認証はサポートされていません。

- オンデマンドコンピューティング用データベースのマネージドコレクションでは、ロード操作は不要です。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY")
    .build());
```

</TabItem>

<TabItem value='go'>

```go
ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "https://{project-id}.{region}.api.zillizcloud.com",
    APIKey:  "YOUR_API_KEY",
})
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'https://{project-id}.{region}.api.zillizcloud.com',
  token: 'YOUR_API_KEY',
});

await client.connectPromise;
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
```

</TabItem>

<TabItem value='c++'>

```c++
#include <milvus/MilvusClientV2.h>

auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param(
    "https://{project-id}.{region}.api.zillizcloud.com",
    "YOUR_API_KEY"
);

auto status = client->Connect(connect_param);
```

</TabItem>
</Tabs>

## ステップ 2: （任意）データベースを作成する\{#step-2-optional-create-a-database}

Zilliz Cloud にはデフォルトのデータベースが用意されています。デフォルトのデータベースを使用する場合は、このステップをスキップしてください。以下のように新しいデータベースを作成することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"},{"label":"C++","value":"c++"}]}>
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
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createDatabase({
  db_name: 'my_database',
});
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

<TabItem value='shell'>

```shell
zilliz database create --name my_database
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::CreateDatabaseRequest request;
request.WithDatabaseName("my_database");

auto status = client->CreateDatabase(request);
```

</TabItem>
</Tabs>

## ステップ 3: マネージドコレクションを作成する\{#step-3-create-a-managed-collection}

データベースの準備ができたら、その中にマネージドコレクションを作成できます。コレクションのカラムを外部データファイルにマッピングする外部コレクションとは異なり、マネージドコレクションではデータをインポートすることで大幅なパフォーマンス向上を実現できます。

次の例では、コレクションスキーマの設定とコレクションの作成方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()

schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    is_primary=True
)

schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512
)

schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
    .fieldName("product_id")
    .dataType(DataType.Int64)
    .isPrimaryKey(true)
    .build());

schema.addField(AddFieldReq.builder()
    .fieldName("product_name")
    .dataType(DataType.VarChar)
    .maxLength(512)
    .build());

schema.addField(AddFieldReq.builder()
    .fieldName("embedding")
    .dataType(DataType.FloatVector)
    .dimension(768)
    .build());
```

</TabItem>

<TabItem value='go'>

```go
schema := entity.NewSchema().
    WithField(entity.NewField().
        WithName("product_id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("product_name").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512)).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(768))
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from '@zilliz/milvus2-sdk-node';

const schema = [
  {
    name: 'product_id',
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: 'product_name',
    data_type: DataType.VarChar,
    max_length: 512,
  },
  {
    name: 'embedding',
    data_type: DataType.FloatVector,
    dim: 768,
  },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "Int64",
            "isPrimary": true
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "768"
            }
        },
        {
            "fieldName": "product_name",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": 512
            }
        }
    ]
}'
```

</TabItem>

<TabItem value='shell'>

```shell
cat > schema.json <<'JSON'
{
  "fields": [
    {
      "fieldName": "product_id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "product_name",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": 512
      }
    },
    {
      "fieldName": "embedding",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": "768"
      }
    }
  ]
}
JSON
```

</TabItem>

<TabItem value='c++'>

```c++
auto schema = std::make_shared<milvus::CollectionSchema>();

schema->AddField(milvus::FieldSchema("product_id", milvus::DataType::INT64)
    .WithPrimaryKey(true));
schema->AddField(milvus::FieldSchema("product_name", milvus::DataType::VARCHAR)
    .WithMaxLength(512));
schema->AddField(milvus::FieldSchema("embedding", milvus::DataType::FLOAT_VECTOR)
    .WithDimension(768));
```

</TabItem>
</Tabs>

上記のスキーマを使用してコレクションを作成できます。デフォルトのデータベースを使用する場合は、`db_name` パラメーターを省略しても問題ありません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database"
)

# create the collection
client.create_collection(
    collection_name="prod_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
client.createCollection(CreateCollectionReq.builder()
    .databaseName("my_database")
    .collectionName("prod_collection")
    .collectionSchema(schema)
    .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
    log.Fatal(err)
}

err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("prod_collection", schema))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.useDatabase({
  db_name: 'my_database',
});

await client.createCollection({
  collection_name: 'prod_collection',
  fields: schema,
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
    \"collectionName\": \"prod_collection\",
    \"schema\": $schema
}"
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz collection create \
  --database my_database \
  --name prod_collection \
  --body file://schema.json
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->UseDatabase("my_database");

milvus::CreateCollectionRequest request;
request.WithCollectionName("prod_collection")
       .WithCollectionSchema(schema);

status = client->CreateCollection(request);
```

</TabItem>
</Tabs>

## ステップ 4: インデックスの作成\{#step-4-create-indexes}

すべてのベクトルフィールドにインデックスを作成する必要があります。また、任意で選択したスカラーフィールドにもインデックスを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

index_params.add_index(
    field_name="product_name", 
    index_type="AUTOINDEX"
)

client.create_index(
    db_name="my_database",
    collection_name="prod_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

List<IndexParam> indexParams = Arrays.asList(
    IndexParam.builder()
        .fieldName("embedding")
        .indexName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build(),
    IndexParam.builder()
        .fieldName("product_name")
        .indexName("product_name")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build()
);

client.createIndex(CreateIndexReq.builder()
    .databaseName("my_database")
    .collectionName("prod_collection")
    .indexParams(indexParams)
    .build());
```

</TabItem>

<TabItem value='go'>

```go
vectorIndex := index.NewAutoIndex(entity.COSINE)
vectorIndexTask, err := client.CreateIndex(ctx,
    milvusclient.NewCreateIndexOption("prod_collection", "embedding", vectorIndex).
        WithIndexName("embedding"))
if err != nil {
    log.Fatal(err)
}
if err := vectorIndexTask.Await(ctx); err != nil {
    log.Fatal(err)
}

scalarIndexTask, err := client.CreateIndex(ctx,
    milvusclient.NewCreateIndexOption("prod_collection", "product_name", index.NewInvertedIndex()).
        WithIndexName("product_name"))
if err != nil {
    log.Fatal(err)
}
if err := scalarIndexTask.Await(ctx); err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex([
  {
    collection_name: 'prod_collection',
    field_name: 'embedding',
    index_name: 'embedding',
    index_type: 'AUTOINDEX',
    metric_type: 'COSINE',
  },
  {
    collection_name: 'prod_collection',
    field_name: 'product_name',
    index_name: 'product_name',
    index_type: 'AUTOINDEX',
  },
]);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "embedding",
        "metricType": "COSINE",
        "indexName": "embedding",
        "indexType": "AUTOINDEX"
    },
    {
        "fieldName": "product_name",
        "indexName": "product_name",
        "indexType": "AUTOINDEX"
    }
]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"prod_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz index create \
  --database my_database \
  --collection prod_collection \
  --body '{"indexParams":[{"fieldName":"embedding","metricType":"COSINE","indexName":"embedding","indexType":"AUTOINDEX"},{"fieldName":"product_name","indexName":"product_name","indexType":"AUTOINDEX"}]}'
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::CreateIndexRequest request;
request.WithDatabaseName("my_database")
       .WithCollectionName("prod_collection")
       .AddIndex(milvus::IndexDesc(
           "embedding",
           "embedding",
           milvus::IndexType::AUTOINDEX,
           milvus::MetricType::COSINE))
       .AddIndex(milvus::IndexDesc(
           "product_name",
           "product_name",
           milvus::IndexType::AUTOINDEX));

auto status = client->CreateIndex(request);
```

</TabItem>
</Tabs>

## ステップ 5: データのインポート\{#step-5-import-data}

すべての準備が整ったら、処理済みデータをインポートできます。以下の例では、処理済みデータが外部ストレージバケットに保存されていることを前提としています。

バケットやストレージ連携におけるデータ形式については、[Format Options](./data-import-format-options) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# The path should be relative to the root 
# of a zilliz cloud volume or an external storage
OBJECT_URLS = [[                                                                                                             
    "https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json"                                           
]]                                                                                                                                                                                                                                                     
ACCESS_KEY = "YOUR_STORAGE_ACCESS_KEY"                                                                                       
SECRET_KEY = "YOUR_STORAGE_SECRET_KEY"

res = bulk_import(
    api_key="YOUR_ZILLIZ_API_KEY",
    url="https://api.cloud.zilliz.com",
    project_id="proj-xxxxxxxxxxxxxxxxxxx",
    region_id="aws-us-west-2",
    db_name="my_database",
    collection_name="prod_collection",
    object_url=OBJECT_URLS,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

# job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.import_.CloudImportRequest;
import io.milvus.bulkwriter.restful.BulkImportUtils;

import java.util.Collections;
import java.util.List;

String cloudEndpoint = "https://api.cloud.zilliz.com";

List<List<String>> objectUrls = Collections.singletonList(
    Collections.singletonList("https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json")
);

CloudImportRequest request = CloudImportRequest.builder()
    .apiKey("YOUR_ZILLIZ_API_KEY")
    .clusterId("inxx-xxxxxxxxxxxxxxxxxxx")
    .dbName("my_database")
    .collectionName("prod_collection")
    .objectUrls(objectUrls)
    .accessKey("YOUR_STORAGE_ACCESS_KEY")
    .secretKey("YOUR_STORAGE_SECRET_KEY")
    .build();

String res = BulkImportUtils.bulkImport(cloudEndpoint, request);
System.out.println(res);

// job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HttpClient } from '@zilliz/milvus2-sdk-node';

const client = new HttpClient({
  endpoint: 'https://api.cloud.zilliz.com',
  token: 'YOUR_ZILLIZ_API_KEY',
});

const res = await client.createImportJobs({
  projectId: 'proj-xxxxxxxxxxxxxxxxxxx',
  regionId: 'aws-us-west-2',
  dbName: 'my_database',
  collectionName: 'prod_collection',
  objectUrls: [[
    'https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json',
  ]],
  accessKey: 'YOUR_STORAGE_ACCESS_KEY',
  secretKey: 'YOUR_STORAGE_SECRET_KEY',
});

// job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \                                                                                                        
  --url "${CLOUD_PLATFORM_ENDPOINT}/v2/vectordb/jobs/import/create" \                                                        
  --header "Authorization: Bearer ${TOKEN}" \                                                                                
  --header "Accept: application/json" \                                                                                      
  --header "Content-Type: application/json" \                                                                                
  -d '{                                                                                                                      
    "projectId": "proj-xxxxxxxxxxxxxxxxxx",                                                                                  
    "regionId": "aws-us-west-2",                                                                                             
    "dbName": "my_database",                                                                                                 
    "collectionName": "prod_collection",                                                                                     
    "objectUrls": [["https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json"]],                        
    "accessKey": "YOUR_STORAGE_ACCESS_KEY",                                                                                  
    "secretKey": "YOUR_STORAGE_SECRET_KEY"                                                                                   
  }'
    
 # job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz import start \
  --cluster-id inxx-xxxxxxxxxxxxxxxxxxx \
  --collection prod_collection \
  --body '{"projectId":"proj-xxxxxxxxxxxxxxxxxxx","regionId":"aws-us-west-2","dbName":"my_database","objectUrls":[["https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json"]],"accessKey":"YOUR_STORAGE_ACCESS_KEY","secretKey":"YOUR_STORAGE_SECRET_KEY"}'

# job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

返されたジョブ ID を使って、進捗状況を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import get_import_progress

# Get bulk-insert job progress
resp = get_import_progress(
    api_key="YOUR_ZILLIZ_API_KEY",
    url="https://api.cloud.zilliz.com",
    cluster_id="inxx-xxxxxxxxxxxxxxxxxxx",
    job_id="job-xxxxxxxxxxxxxxxxxxxxx",
)

print(json.dumps(resp.json(), indent=4))
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.describe.CloudDescribeImportRequest;
import io.milvus.bulkwriter.restful.BulkImportUtils;

String cloudEndpoint = "https://api.cloud.zilliz.com";

CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
    .apiKey("YOUR_ZILLIZ_API_KEY")
    .clusterId("inxx-xxxxxxxxxxxxxxxxxxx")
    .jobId("job-xxxxxxxxxxxxxxxxxxxxx")
    .build();

String resp = BulkImportUtils.getImportProgress(cloudEndpoint, request);
System.out.println(resp);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HttpClient } from '@zilliz/milvus2-sdk-node';

const client = new HttpClient({
  endpoint: 'https://api.cloud.zilliz.com',
  token: 'YOUR_ZILLIZ_API_KEY',
});

const resp = await client.getImportJobProgress({
  clusterId: 'inxx-xxxxxxxxxxxxxxxxxxx',
  jobId: 'job-xxxxxxxxxxxxxxxxxxxxx',
});

console.log(JSON.stringify(resp, null, 2));
```

</TabItem>

<TabItem value='bash'>

```bash
  # Use jobId returned from create API                                                                                         
  curl --request POST \                                                                                                        
    --url "${CLOUD_PLATFORM_ENDPOINT}/v2/vectordb/jobs/import/getProgress" \                                                   
    --header "Authorization: Bearer ${TOKEN}" \                                                                                
    --header "Accept: application/json" \                                                                                      
    --header "Content-Type: application/json" \                                                                                
    -d '{                                                                                                                      
      "clusterId": "inxx-xxxxxxxxxxxxxxx",                                                                                     
      "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"                                                                                     
    }'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz import status \
  --cluster-id inxx-xxxxxxxxxxxxxxxxxxx \
  --job-id job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

## ステップ 6: オンデマンドクラスターを作成する\{#step-6-create-an-on-demand-cluster}

コレクションの準備ができたら、オンデマンド検索を実行するためにオンデマンドクラスターにアタッチする必要があります。次のコマンドはクラスターを作成し、その ID を返します。

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

デフォルトでは、クラスターは最後のリクエストから 60 秒後に自動的にサスペンドされますが、ユースケースに合わせてこの値を変更できます。

## ステップ 7: 検索を実行する\{#step-7-conduct-searches}

検索、クエリ、またはハイブリッド検索を実行する際は、セッションを通じて前のステップで作成したオンデマンドクラスターにアタッチできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient                         
                                                                                                                               
client = MilvusClient(                                                                                                       
    uri="https://{project-id}.{region}.api.zillizcloud.com",                                                                 
    token="YOUR_API_KEY"                                                                                                     
)                                                                                                                            
                                                                                                                               
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")                                                                  
                                                                                                                               
# Must match collection vector dimension (example: 768)                                                                      
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]                                
                                                                                                                               
res = session.search(                                                                                                        
    db_name="my_database",                                                                                                   
    collection_name="prod_collection",                                                                                       
    anns_field="embedding",                                                                                                  
    data=[query_vector],                                                                                                     
    limit=3,                                                                                                                 
    output_fields=["product_id", "product_name"]                                                                                
) 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;

MilvusClientV2 sessionClient = new MilvusClientV2(ConnectConfig.builder()
    .uri("https://{project-id}.{region}.api.zillizcloud.com")
    .token("YOUR_API_KEY")
    .option(Collections.singletonMap("cluster_id", "inxx-xxxxxxxxxxxxxxx"))
    .build());

// Must match collection vector dimension (example: 768)
float[] queryVector = new float[] {
    0.35803764f, -0.6023496f, 0.18414013f, -0.26286206f, /* ... */ 0.90294385f
};

SearchResp res = sessionClient.search(SearchReq.builder()
    .databaseName("my_database")
    .collectionName("prod_collection")
    .annsField("embedding")
    .data(Collections.singletonList(new FloatVec(queryVector)))
    .limit(3)
    .outputFields(Arrays.asList("product_id", "product_name"))
    .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const sessionClient = new MilvusClient({
  address: 'https://{project-id}.{region}.api.zillizcloud.com',
  token: 'YOUR_API_KEY',
  option: { cluster_id: 'inxx-xxxxxxxxxxxxxxx' },
});

await sessionClient.connectPromise;

// Must match collection vector dimension (example: 768)
const queryVector = [
  0.3580376395471989,
  -0.6023495712049978,
  0.18414012509913835,
  -0.26286205330961354,
  // ...
  0.9029438446296592,
];

const res = await sessionClient.search({
  db_name: 'my_database',
  collection_name: 'prod_collection',
  anns_field: 'embedding',
  data: [queryVector],
  limit: 3,
  output_fields: ['product_id', 'product_name'],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \                                                                                                        
  --url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxx" \
  --header "Authorization: Bearer ${TOKEN}" \                                                                                
  --header "Content-Type: application/json" \                                                                                
  -d '{                                                                                                                      
    "dbName": "my_database",                                                                                                 
    "collectionName": "prod_collection",                                                                                     
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            ...
            0.9029438446296592
        ]
    ]                                                         
    "annsField": "embedding",                                                                                                
    "limit": 3,                                                                                                              
    "outputFields": ["product_id", "product_name"]                                                                           
  }'
```

</TabItem>

<TabItem value='shell'>

```shell
zilliz context set --cluster-id inxx-xxxxxxxxxxxxxxx

QUERY_VECTOR=$(python3 - <<'PY'
import json

query_vector = [
    0.3580376395471989,
    -0.6023495712049978,
    0.18414012509913835,
    -0.26286205330961354,
] + [0.0] * 763 + [0.9029438446296592]

print(json.dumps([query_vector]))
PY
)

zilliz vector search \
  --database my_database \
  --collection prod_collection \
  --anns-field embedding \
  --data "$QUERY_VECTOR" \
  --limit 3 \
  --output-fields '["product_id","product_name"]'
```

</TabItem>
</Tabs>

データを探索して最も価値のあるサブセットを見つけたら、サービングクラスターに接続してデータをインポートし、本番環境で利用できるようになります。


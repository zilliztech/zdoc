---
title: "データのインポート(SDK) | Cloud"
slug: /import-data-via-sdks
sidebar_label: "SDKs"
beta: FALSE
notebook: FALSE
description: "このガイドでは、バルクライターおよびバルクインポートAPIを使用して、S DKを使用してデータをコレクションにインポートする方法について説明します。 | Cloud"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - sdk
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート(SDK)

このガイドでは、バルクライターおよびバルクインポートAPIを使用して、S DKを使用してデータをコレクションにインポートする方法について説明します。

代わりに、[私たちのファストトラックのエンドツーエンドコース](./data-import-zero-to-hero)を参照することもできます。これは、データの準備とZilliz Cloudコレクションへのデータのインポートの両方をカバーしています。

## 依存関係のインストール{#install-dependencies}

<tabs groupid="code" defaultvalue="python" values="{[{&#34;label&#34;:&#34;Python&#34;,&#34;value&#34;:&#34;python&#34;},{&#34;label&#34;:&#34;Java&#34;,&#34;value&#34;:&#34;java&#34;}]}"></tabs>

<tabitem value="python"></tabitem>

ターミナルで次のコマンドを実行して、**pymilvus**と**minio**をインストールするか、最新バージョンにアップグレードしてください。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<tabitem value="java"></tabitem>

- Apache Mavenの場合、**pom. xml**依存関係に以下を追加してください

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>

<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.9</version>
</dependency>
```

- Gradle/Grailsの場合、以下を実行してください。

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
compile 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## 準備したデータを確認する{#check-prepared-data}

[BulkWriterツール](./use-bulkwriter)を使用してデータを準備し、準備したファイルへのパスを取得したら、Zilliz Cloudコレクションにインポートする準備ができます。準備ができているかどうかを確認するには、次の手順を実行してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from minio import Minio

# Third-party constants
ACCESS_KEY = "YOUR_ACCESS_KEY"
SECRET_KEY = "YOUR_SECRET_KEY"
BUCKET_NAME = "YOUR_BUCKET_NAME"
REMOTE_PATH = "YOUR_REMOTE_PATH"

client = Minio(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS S3
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    secure=True
)

objects = client.list_objects(
    bucket_name=BUCKET_NAME,
    prefix=REMOTE_PATH,
    recursive=True
)

print([obj.object_name for obj in objects])

# Output
#
# [
#     "folder/1/claps.npy",
#     "folder/1/id.npy",
#     "folder/1/link.npy",
#     "folder/1/publication.npy",
#     "folder/1/reading_time.npy",
#     "folder/1/responses.npy",
#     "folder/1/title.npy",
#     "folder/1/vector.npy"
# ]

```

</TabItem>

<TabItem value='java'>

```java
import io.minio.MinioClient;
import io.minio.Result;
import io.minio.messages.Item;

import java.util.Iterator;

// Third-party constants
String ACCESS_KEY = "YOUR_ACCESS_KEY";
String SECRET_KEY = "YOUR_SECRET_KEY";
String BUCKET_NAME = "YOUR_BUCKET_NAME";
String REMOTE_PATH = "YOUR_REMOTE_PATH";

MinioClient minioClient = MinioClient.builder()
        .endpoint("storage.googleapis.com") // use 's3.amazonaws.com' for AWS S3
        .credentials(ACCESS_KEY, SECRET_KEY)
        .build();
        
Iterable<Result<Item>> results = minioClient.listObjects(
    ListObjectsArgs.builder().bucket(BUCKET_NAME).prefix(REMOTE_PATH).build();
);

while (results.hasNext()) {
    Result<Item> result = results.next();
    System.out.println(result.get().objectName());
}

// Output
// [[1.parquet]]
```

</TabItem>
</Tabs>

## コレクションを作成{#create-collection}

データファイルの準備ができたら、Zilliz Cloudクラスタに接続し、スキーマからコレクションを作成し、ストレージバケット内のファイルからデータをインポートします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# set up your collection

## Zilliz Cloud constants
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"
API_KEY = "YOUR_CLUSTER_TOKEN"
CLUSTER_ID = "YOUR_CLUSTER_ID" # inxx-xxxxxxxxxxxxxxx
CLUSTER_REGION = "YOUR_CLUSTER_REGION"
COLLECTION_NAME = "medium_articles"

## Third-party constants
OBJECT_URL = "YOUR_OBJECT_URL"

# create a milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# prepare schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_schema=False
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="link", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="reading_time", datatype=DataType.INT64)
schema.add_field(field_name="publication", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="claps", datatype=DataType.INT64)
schema.add_field(field_name="responses", datatype=DataType.INT64)

schema.verify()

# prepare index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="L2"
)

client.create_collection(
    collection_name="customized_setup",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.FieldType;
import io.milvus.grpc.DataType;
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;
import io.milvus.param.IndexType;
import io.milvus.param.MetricType;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.LoadCollectionParam;
import io.milvus.param.index.CreateIndexParam;

// Configs for Zilliz Cloud cluster
String CLUSTER_ENDPOINT = "";
String TOKEN = "";
String API_KEY = "";
String CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
String CLOUD_REGION = "";
String COLLECTION_NAME = "";

// Third-party constants 
String OBJECT_URL = ""

// Define schema for the target collection
FieldType id = FieldType.newBuilder()
        .withName("id")
        .withDataType(DataType.Int64)
        .withPrimaryKey(true)
        .withAutoID(false)
        .build();

FieldType titleVector = FieldType.newBuilder()
        .withName("vector")
        .withDataType(DataType.FloatVector)
        .withDimension(768)
        .build();

FieldType title = FieldType.newBuilder()
        .withName("title")
        .withDataType(DataType.VarChar)
        .withMaxLength(512)
        .build();

FieldType link = FieldType.newBuilder()
        .withName("link")
        .withDataType(DataType.VarChar)
        .withMaxLength(512)
        .build();
        
FieldType readingTime = FieldType.newBuilder()
        .withName("reading_time")
        .withDataType(DataType.Int64)
        .build();
        
FieldType publication = FieldType.newBuilder()
        .withName("publication")
        .withDataType(DataType.VarChar)
        .withMaxLength(512)
        .build();

FieldType claps = FieldType.newBuilder()
        .withName("claps")
        .withDataType(DataType.Int64)
        .build();     
        
FieldType responses = FieldType.newBuilder()
        .withName("responses")
        .withDataType(DataType.Int64)
        .build();

CollectionSchemaParam schema = CollectionSchemaParam.newBuilder()
        .withEnableDynamicField(false)
        .addFieldType(id)
        .addFieldType(titleVector)
        .addFieldType(title)
        .addFieldType(link)
        .addFieldType(readingTime)
        .addFieldType(publication)
        .addFieldType(claps)
        .addFieldType(responses)
        .build();
        
// Create a collection with the given schema
ConnectParam connectParam = ConnectParam.newBuilder()
        .withUri(CLUSTER_ENDPOINT)
        .withToken(TOKEN)
        .build();

MilvusServiceClient milvusClient = new MilvusServiceClient(connectParam);

CreateCollectionParam collectionParam = CreateCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withSchema(schema)
        .build();

milvusClient.createCollection(collectionParam);

CreateIndexParam indexParam = CreateIndexParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .withFieldName("title_vector")
        .withIndexType(IndexType.AUTOINDEX)
        .withMetricType(MetricType.L2)
        .build();

milvusClient.createIndex(indexParam);

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();

milvusClient.loadCollection(loadCollectionParam);
```

</TabItem>
</Tabs>

上記のコードスニペットで、`CLUSTER_ENDPOINT`、`TOKEN`、`API_KEY`、`CLUSTER_ID`、`CLOUD_REGION`にそれぞれデータを入力してください。 

クラスターのパブリックエンドポイントから`CLOUD_REGION`と`CLUSTER_ID`を取得できます。例えば、パブリックエンドポイント`https://in03-3bf3c31f4248e22.api.aws-us-east1.zillizcloud.com`では、`CLOUD_REGION_ID`は`aws-us-east1`であり、`CLUSTER_ID`は`in03-3bf3c31f4248e22`です。 

</include>

## データのインポート{#import-data}

データとコレクションの準備ができたら、次のようにインポート過程を開始できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# Bulk-import your data from the prepared data files
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""
STORAGE_URL = ""
ACCESS_KEY = ""
SECRET_KEY = ""

res = bulk_import(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,
    collection_name="quick_setup",
    object_url=STORAGE_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

print(res.json())

# Output
#
# {
#     "code": 0,
#     "data": {
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a"
#     }
# }
```

</TabItem>

<TabItem value='java'>

```java
private static String bulkImport() throws InterruptedException {
    /**
     * The value of the URL is fixed.
     */
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
    String CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
    String API_KEY = "";
    String STORAGE_URL = "";
    String ACCESS_KEY = "";
    String SECRET_KEY = "";

    CloudImportRequest cloudImportRequest = CloudImportRequest.builder()
            .apiKey(API_KEY)
            .clusterId(CLUSTER_ID)
            .collectionName("quick_setup")
            .objectUrl(STORAGE_URL)
            .accessKey(ACCESS_KEY)
            .secretKey(SECRET_KEY)
            .build();
    String bulkImportResult = BulkImport.bulkImport(CLOUD_API_ENDPOINT, cloudImportRequest);
    System.out.println(bulkImportResult);

    JsonObject bulkImportObject = new Gson().fromJson(bulkImportResult, JsonObject.class);
    String jobId = bulkImportObject.getAsJsonObject("data").get("jobId").getAsString();
    System.out.println("Create a bulkInert task, job id: " + jobId);
    return jobId;
}

public static void main(String[] args) throws Exception {
    String jobId = bulkImport();
}

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>データのインポートを成功させるには、ターゲットコレクションに10,000件小なりの実行中または保留中のインポートジョブがあることを確認します。</p>

</Admonition>

### インポートの進捗を確認する{#check-import-progress}

指定した一括インポートジョブの進捗状況を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import get_import_progress

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# Get bulk-insert job progress
resp = get_import_progress(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,
    job_id="job-01fa0e5d42cjxudhpuehyp",
)

print(json.dumps(resp.json(), indent=4))
```

</TabItem>

<TabItem value='java'>

```java
private static void getImportProgress(String jobId) {
    /**
     * The value of the URL is fixed.
     */
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
    String CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
    String API_KEY = "";

    CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(jobId)
        .build();
    String getImportProgressResult = BulkImport.getImportProgress(CLOUD_API_ENDPOINT, request);
    System.out.println("Get import progress, result: " + getImportProgressResult);
}

public static void main(String[] args) throws Exception {
    getImportProgress("job-xxxx");
}
```

</TabItem>
</Tabs>

### インポートジョブの一覧{#list-all-import-jobs}

一括インポートタスクについても知りたい場合は、以下のようにlist-import-jobs APIを呼び出すことができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import list_import_jobs

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# List bulk-insert jobs
resp = list_import_jobs(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID
)

print(json.dumps(resp.json(), indent=4))
```

</TabItem>

<TabItem value='java'>

```java
private static void listImportJobs() {
    /**
     * The value of the URL is fixed.
     */
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
    String CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
    String API_KEY = "";
    
    CloudListImportJobsRequest listImportJobsRequest = CloudListImportJobsRequest.builder()
            .apiKey(API_KEY)
            .clusterId(CLUSTER_ID).build();
    String listImportJobsResult = BulkImport.listImportJobs(CLOUD_API_ENDPOINT, listImportJobsRequest);
    System.out.println(listImportJobsResult);
}

public static void main(String[] args) throws Exception {
    listImportJobs();
}
```

</TabItem>
</Tabs>

## 関連するトピック{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [書式オプション](./data-import-format-options)

- [RESTful APIを使用してデータをインポートする](./import-data-via-restful-api)

- リンク_PLACEHOLDER_0 


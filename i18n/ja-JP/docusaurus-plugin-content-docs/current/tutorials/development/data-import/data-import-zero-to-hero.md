---
title: "データインポート ハンズオン | Cloud"
slug: /data-import-zero-to-hero
sidebar_label: "Zero to Hero"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "これは、データ準備と collection のセットアップから実際のデータインポート処理まで、Zilliz Cloud で素早くデータインポートを始めるための短期集中コースです。このチュートリアル全体を通して、次のことを学びます | Cloud"
type: origin
token: BjHZwBkk0iFScik49QMc1Wwjndb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Data Import Hands-On

これは、データ準備と collection のセットアップから実際のデータインポート処理まで、Zilliz Cloud で素早くデータインポートを始めるための短期集中コースです。このチュートリアルを通して、次のことを学びます。

- スキーマを定義し、ターゲット collection をセットアップする方法

- **BulkWriter** を使用してソースデータを準備し、リモートストレージバケットに書き込む方法

- bulk-import API を呼び出してデータをインポートする方法

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud cluster にデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud cluster にデータをインポートできます。

低レイテンシで安定した体験を確保するために、ターゲット cluster と同じプロバイダー上にあり、同じリージョンにあるバケットまたは blob container を使用することをお勧めします。

</Admonition>

## 開始前に\{#before-you-start}

スムーズに進めるために、以下のセットアップを完了していることを確認してください。

### Zilliz Cloud cluster をセットアップする\{#set-up-your-zilliz-cloud-cluster}

- まだであれば、[cluster を作成](./create-cluster)してください。

- 次の詳細情報を収集します: **Cluster Endpoint**、**API Key**、**Cluster ID**。

### 依存関係をインストールする\{#install-dependencies}

現在、データインポート関連の API は Python または Java で使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

Python API を使用するには、ターミナルで次のコマンドを実行して **pymilvus** と **minio** をインストールするか、最新バージョンにアップグレードします。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Maven の場合は、以下を **pom.xml** の dependencies に追加します。

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>
```

- Gradle/Grails の場合は、次を実行します

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
```

</TabItem>

</Tabs>

### リモートストレージバケットを設定する\{#configure-your-remote-storage-bucket}

- AWS S3、Google GCS、または Azure Blob を使用してリモートバケットをセットアップします。

- 次の情報をメモしておきます

    - S3 互換のブロックストレージサービスの場合は、**Access Key**、**Secret Key**、および **Bucket Name**。

    - Microsoft Azure blob storage service の場合は、**AccountName**、**AccountKey**、および **ContainerName**。

    これらの詳細情報は、バケットをホストしているクラウドプロバイダーのコンソールで確認できます。

サンプルコードを使いやすくするために、設定情報は変数に保存することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
## The value of the URL is fixed.
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
API_KEY=""

# Configs for Zilliz Cloud cluster
CLUSTER_ENDPOINT=""
CLUSTER_ID="" # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
COLLECTION_NAME="zero_to_hero"

# Configs for remote bucket
BUCKET_NAME=""
ACCESS_KEY=""
SECRET_KEY=""
```

</TabItem>

<TabItem value='java'>

```java
/**
 * The value of the URL is fixed.
 */
String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
String API_KEY = "";

// Configs for Zilliz Cloud cluster
String CLUSTER_ENDPOINT = "";
String CLUSTER_ID = ""; // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
String COLLECTION_NAME = "zero_to_hero";

// Configs for remote bucket
String BUCKET_NAME = "";
String ACCESS_KEY = "";
String SECRET_KEY = "";
```

</TabItem>
</Tabs>

## ターゲット collection のスキーマをセットアップする\{#set-up-target-collection-schema}

上記の出力に基づいて、ターゲット collection のスキーマを作成できます。

以下のデモでは、事前定義されたスキーマに最初の 4 つのフィールドを含め、残りの 4 つを動的フィールドとして使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# You need to work out a collection schema out of your dataset.
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True
)

DIM = 512

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True),
schema.add_field(field_name="bool", datatype=DataType.BOOL),
schema.add_field(field_name="int8", datatype=DataType.INT8),
schema.add_field(field_name="int16", datatype=DataType.INT16),
schema.add_field(field_name="int32", datatype=DataType.INT32),
schema.add_field(field_name="int64", datatype=DataType.INT64),
schema.add_field(field_name="float", datatype=DataType.FLOAT),
schema.add_field(field_name="double", datatype=DataType.DOUBLE),
schema.add_field(field_name="varchar", datatype=DataType.VARCHAR, max_length=512),
schema.add_field(field_name="json", datatype=DataType.JSON),
schema.add_field(field_name="array_str", datatype=DataType.ARRAY, max_capacity=100, element_type=DataType.VARCHAR, max_length=128)
schema.add_field(field_name="array_int", datatype=DataType.ARRAY, max_capacity=100, element_type=DataType.INT64)
schema.add_field(field_name="float_vector", datatype=DataType.FLOAT_VECTOR, dim=DIM),
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=DIM),
schema.add_field(field_name="float16_vector", datatype=DataType.FLOAT16_VECTOR, dim=DIM),
# schema.add_field(field_name="bfloat16_vector", datatype=DataType.BFLOAT16_VECTOR, dim=DIM),
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

schema.verify()

print(schema)
```

上記コードのパラメータは以下のとおりです。 

- fields:

    - `id` は主フィールドです。

    - `float_vector` は floating vector フィールドです。

    - `binary_vector` は binary vector フィールドです。

    - `float16_vector` は半精度 floating vector フィールドです。

    - `sparse_vector` は sparse vector フィールドです。

    - 残りのフィールドは scalar フィールドです。

- `auto_id=False`

    これはデフォルト値です。これを **True** に設定すると、**BulkWriter** は生成されたファイルに主フィールドを含めなくなります。 

- `enable_dynamic_field=True`

    この値のデフォルトは **False** です。これを **True** に設定すると、**BulkWriter** は生成されたファイル内の未定義フィールドとその値をキーと値のペアとして含め、それらを **&#36;meta** という名前の予約済み JSON フィールドに配置できます。 

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.BulkImport;
import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.bulkwriter.common.clientenum.CloudStorage;
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;
import io.milvus.bulkwriter.request.describe.MilvusDescribeImportRequest;
import io.milvus.bulkwriter.request.import_.MilvusImportRequest;
import io.milvus.bulkwriter.request.list.MilvusListImportJobsRequest;
import io.milvus.common.utils.Float16Utils;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.*;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.TimeUnit;

private static final String STORAGE_ENDPOINT = CloudStorage.AWS.getEndpoint();
private static final String BUCKET_NAME = "a-bucket";
private static final String ACCESS_KEY = "access-key";
private static final String SECRET_KEY = "secret-key";

private static final Integer DIM = 512;
private static final Gson GSON_INSTANCE = new Gson();

private static CreateCollectionReq.CollectionSchema createSchema() {
    CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
    schema.addField(AddFieldReq.builder()
            .fieldName("id")
            .dataType(io.milvus.v2.common.DataType.Int64)
            .isPrimaryKey(Boolean.TRUE)
            .autoID(false)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("bool")
            .dataType(DataType.Bool)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int8")
            .dataType(DataType.Int8)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int16")
            .dataType(DataType.Int16)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int32")
            .dataType(DataType.Int32)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int64")
            .dataType(DataType.Int64)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float")
            .dataType(DataType.Float)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("double")
            .dataType(DataType.Double)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("varchar")
            .dataType(DataType.VarChar)
            .maxLength(512)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("json")
            .dataType(io.milvus.v2.common.DataType.JSON)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("array_int")
            .dataType(io.milvus.v2.common.DataType.Array)
            .maxCapacity(100)
            .elementType(io.milvus.v2.common.DataType.Int64)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("array_str")
            .dataType(io.milvus.v2.common.DataType.Array)
            .maxCapacity(100)
            .elementType(io.milvus.v2.common.DataType.VarChar)
            .maxLength(128)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float_vector")
            .dataType(io.milvus.v2.common.DataType.FloatVector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("binary_vector")
            .dataType(io.milvus.v2.common.DataType.BinaryVector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float16_vector")
            .dataType(io.milvus.v2.common.DataType.Float16Vector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("sparse_vector")
            .dataType(io.milvus.v2.common.DataType.SparseFloatVector)
            .build());
    
    return schema;
}
```

上記のコードブロックでは、 

- `id` フィールドは主フィールドで、`withAutoID` が `false` に設定されています。これは、インポートするデータに `id` フィールドを含める必要があることを示します。

- `float_vector`、`binary_vector`、`float16_vector`、および `sparse_vector` フィールドは vector フィールドです。

- スキーマでは `withEnableDynamicField` が `true` に設定されています。これは、スキーマで定義されていないフィールドをインポートするデータに含めることができることを示します。

</TabItem>

</Tabs>

スキーマの設定が完了したら、次のようにターゲット collection を作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=API_KEY
)

# 2. Set index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="float_vector",
    index_type="AUTOINDEX",
    metric_type="IP"
)

index_params.add_index(
    field_name="binary_vector",
    index_type="AUTOINDEX",
    metric_type="HAMMING"
)

index_params.add_index(
    field_name="float16_vector",
    index_type="AUTOINDEX",
    metric_type="IP"
)

index_params.add_index(
    field_name="sparse_vector",
    index_type="AUTOINDEX",
    metric_type="IP"
)

# 3. Create collection
client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.common.collect.Lists;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.List;

// 1. Set up a Milvus client
MilvusClientV2 milvusClient = new MilvusClientV2(ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(API_KEY)
        .build());

// 2. Set index parameters
IndexParam floatVectorIndex = IndexParam.builder()
        .fieldName("float_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build();

IndexParam binaryVectorIndex = IndexParam.builder()
        .fieldName("binary_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.HAMMING)
        .build();

IndexParam float16VectorIndex = IndexParam.builder()
        .fieldName("float16_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build();

IndexParam sparseVectorIndex = IndexParam.builder()
        .fieldName("sparse_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build();

List<IndexParam> indexParamList = Lists.newArrayList(
        floatVectorIndex,
        binaryVectorIndex,
        float16VectorIndex,
        sparseVectorIndex
);

// 3. Create collection
CreateCollectionReq.CollectionSchema schema = createSchema();
CreateCollectionReq request = CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(schema)
        .indexParams(indexParamList)
        .build();
milvusClient.createCollection(request);
```

</TabItem>
</Tabs>

## ソースデータを準備する\{#prepare-source-data}

**BulkWriter** は、データセットを JSON、Parquet、または NumPy ファイルに書き換えることができます。ここでは **RemoteBulkWriter** を作成し、この writer を使用してデータをこれらの形式に書き換えます。

### RemoteBulkWriter を作成する\{#create-remotebulkwriter}

schema の準備ができたら、その schema を使用して **RemoteBulkWriter** を作成できます。**RemoteBulkWriter** は、リモートバケットにアクセスするための権限を必要とします。リモートバケットにアクセスするための接続パラメータを **ConnectParam** オブジェクトに設定し、それを **RemoteBulkWriter** で参照する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"AWS S3/GCS","value":"python"},{"label":"Microsoft Azure","value":"python_1"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType
# Use `from pymilvus import RemoteBulkWriter, BulkFileType`
# if your pymilvus version is earlier than 2.4.2 

# Connections parameters to access the remote bucket
conn = RemoteBulkWriter.S3ConnectParam(
    endpoint="s3.amazonaws.com", # Use "storage.googleapis.com" for Google Cloud Storage
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    bucket_name=BUCKET_NAME, 
    secure=True
)
```

</TabItem>
<TabItem value='python_1'>

```python
# Third-party constants
AZURE_CONNECT_STRING = ""

conn = RemoteBulkWriter.AzureConnectParam(
    conn_str=AZURE_CONNECT_STRING,
    container_name=BUCKET_NAME
)

# or

# Thrid-party constants
AZURE_ACCOUNT_URL = ""
AZURE_CREDENTIAL = ""

conn = RemoteBulkWriter.AzureConnectParam(
    account_url=AZURE_ACCOUNT_URL,
    credential=AZURE_CREDENTIAL,
    container_name=BUCKET_NAME
)
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='java'>

<Tabs groupId="java" defaultValue='java' values={[{"label":"AWS S3/GCS","value":"java"},{"label":"Microsoft Azure","value":"java_1"}]}>
<TabItem value='java'>

```java
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;

// Create a remote bucket writer.
StorageConnectParam storageConnectParam = S3ConnectParam.newBuilder()
        .withEndpoint("s3.amazonaws.com") // Use "storage.googleapis.com" for Google Cloud Storage
        .withBucketName(BUCKET_NAME)
        .withAccessKey(ACCESS_KEY)
        .withSecretKey(SECRET_KEY)
        .build();
```

</TabItem>
<TabItem value='java_1'>

```java
import io.milvus.bulkwriter.connect.AzureConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;

String AZURE_CONNECT_STRING = ""
String AZURE_CONTAINER = ""

StorageConnectParam storageConnectParam = AzureConnectParam.newBuilder()
        .withConnStr(AZURE_CONNECT_STRING)
        .withContainerName(AZURE_CONTAINER)
        .build()
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

**endpoint** パラメータは、クラウドプロバイダのストレージサービス URI を指します。 

S3 互換ストレージサービスの場合、使用可能な URI は次のとおりです。

- `s3.amazonaws.com`(AWS S3)

- `storage.googleapis.com` (GCS)

Azure blob storage container の場合は、次のような[有効な接続文字列](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage#view-account-access-keys)を使用する必要があります。

`DefaultEndpointsProtocol=https;AccountName=<accountName>;AccountKey=<accountKey>;EndpointSuffix=core.windows.net`

</Admonition>

その後、以下のように **RemoteBulkWriter** 内で接続パラメータを参照できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

```python
writer = RemoteBulkWriter(
    schema=schema, # Target collection schema
    remote_path="/", # Output directory relative to the remote bucket root
    segment_size=1024*1024*1024, # Maximum segment size when segmenting the raw data
    connect_param=conn, # Connection parameters defined above
    file_type=BulkFileType.PARQUET # Type of the generated file.
)

# Possible file types:
# - BulkFileType.JSON, 
# - BulkFileType.NPY, and 
# - BulkFileType.PARQUET
```

上記の writer は JSON 形式のファイルを生成し、指定されたバケットのルートフォルダにアップロードします。

- `remote_path="/"`

    これは、リモートバケット内で生成されたファイルの出力パスを決定します。 

    `"/"` に設定すると、**RemoteBulkWriter** は生成されたファイルをリモートバケットのルートフォルダに配置します。他のパスを使用する場合は、リモートバケットのルートからの相対パスを設定してください。

- `file_type=BulkFileType.PARQUET`

    これは生成されるファイルの種類を決定します。指定可能な値は次のとおりです。

    - **BulkFileType.JSON**

    - **BulkFileType.PARQUET**

    - **BulkFileType.NPY**

- `segment_size=1024*1024*1024`

    これは、**BulkWriter** が生成されたファイルを分割するかどうかを決定します。デフォルト値は 1024 MB (1024 * 1024 * 1024) です。データセットに非常に多くのレコードが含まれている場合は、**segment_size** を適切な値に設定してデータを分割することを推奨します。

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;

RemoteBulkWriterParam remoteBulkWriterParam = RemoteBulkWriterParam.newBuilder()
        .withCollectionSchema(schema)
        .withRemotePath("/")
        .withChunkSize(1024 * 1024 * 1024)
        .withConnectParam(storageConnectParam)
        .withFileType(BulkFileType.PARQUET)
        .build();
        
@SuppressWarnings("resource")
RemoteBulkWriter remoteBulkWriter = new RemoteBulkWriter(remoteBulkWriterParam);

// Possible file types:
// - BulkFileType.PARQUET
```

上記の writer は Parquet 形式のファイルを生成し、指定されたバケットのルートフォルダにアップロードします。

- `withRemotePath("/")`

    これは、リモートバケット内で生成されたファイルの出力パスを決定します。 

    `"/"` に設定すると、**RemoteBulkWriter** は生成されたファイルをリモートバケットのルートフォルダに配置します。他のパスを使用する場合は、リモートバケットのルートからの相対パスを設定してください。

- `withFileType(BulkFileType.PARQUET)`

    これは生成されるファイルの種類を決定します。現在使用可能なのは **PARQUET** のみです。

- `withChunkSize(1024*1024*1024)`

    これは、**BulkWriter** が生成されたファイルを分割するかどうかを決定します。デフォルト値は 1024 MB (1024 * 1024 * 1024) です。データセットに非常に多くのレコードが含まれている場合は、**withChunkSize** を適切な値に設定してデータを分割することを推奨します。

</TabItem>

</Tabs>

### writer を使用する\{#use-the-writer}

writer には 2 つのメソッドがあります。1 つはソースデータセットから行を追加するためのもので、もう 1 つはデータをリモートファイルにコミットするためのものです。

以下のように、ソースデータセットから行を追加できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import random, string, json
import numpy as np
import tensorflow as tf

def generate_random_str(length=5):
    letters = string.ascii_uppercase
    digits = string.digits
    
    return ''.join(random.choices(letters + digits, k=length))

# optional input for binary vector:
# 1. list of int such as [1, 0, 1, 1, 0, 0, 1, 0]
# 2. numpy array of uint8
def gen_binary_vector(to_numpy_arr):
    raw_vector = [random.randint(0, 1) for i in range(DIM)]
    if to_numpy_arr:
        return np.packbits(raw_vector, axis=-1)
    return raw_vector

# optional input for float vector:
# 1. list of float such as [0.56, 1.859, 6.55, 9.45]
# 2. numpy array of float32
def gen_float_vector(to_numpy_arr):
    raw_vector = [random.random() for _ in range(DIM)]
    if to_numpy_arr:
        return np.array(raw_vector, dtype="float32")
    return raw_vector

# # optional input for bfloat16 vector:
# # 1. list of float such as [0.56, 1.859, 6.55, 9.45]
# # 2. numpy array of bfloat16
# def gen_bf16_vector(to_numpy_arr):
#     raw_vector = [random.random() for _ in range(DIM)]
#     if to_numpy_arr:
#         return tf.cast(raw_vector, dtype=tf.bfloat16).numpy()
#     return raw_vector

# optional input for float16 vector:
# 1. list of float such as [0.56, 1.859, 6.55, 9.45]
# 2. numpy array of float16
def gen_fp16_vector(to_numpy_arr):
    raw_vector = [random.random() for _ in range(DIM)]
    if to_numpy_arr:
        return np.array(raw_vector, dtype=np.float16)
    return raw_vector

# optional input for sparse vector:
# only accepts dict like {2: 13.23, 45: 0.54} or {"indices": [1, 2], "values": [0.1, 0.2]}
# note: no need to sort the keys
def gen_sparse_vector(pair_dict: bool):
    raw_vector = {}
    dim = random.randint(2, 20)
    if pair_dict:
        raw_vector["indices"] = [i for i in range(dim)]
        raw_vector["values"] = [random.random() for _ in range(dim)]
    else:
        for i in range(dim):
            raw_vector[i] = random.random()
    return raw_vector

for i in range(2000):
    writer.append_row({
        "id": np.int64(i),
        "bool": True if i % 3 == 0 else False,
        "int8": np.int8(i%128),
        "int16": np.int16(i%1000),
        "int32": np.int32(i%100000),
        "int64": np.int64(i),
        "float": np.float32(i/3),
        "double": np.float64(i/7),
        "varchar": f"varchar_{i}",
        "json": json.dumps({"dummy": i, "ok": f"name_{i}"}),
        "array_str": np.array([f"str_{k}" for k in range(5)], np.dtype("str")),
        "array_int": np.array([k for k in range(10)], np.dtype("int64")),
        "float_vector": gen_float_vector(True),
        "binary_vector": gen_binary_vector(True),
        "float16_vector": gen_fp16_vector(True),
        # "bfloat16_vector": gen_bf16_vector(True),
        "sparse_vector": gen_sparse_vector(True),
        f"dynamic_{i}": i,
    })
    if (i+1)%1000 == 0:
        writer.commit()
        print('committed')

print(writer.batch_files)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;
import io.milvus.common.utils.Float16Utils;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.SortedMap;
import java.util.TreeMap;

private static byte[] genBinaryVector() {
    Random ran = new Random();
    int byteCount = DIM / 8;
    ByteBuffer vector = ByteBuffer.allocate(byteCount);
    for (int i = 0; i < byteCount; ++i) {
        vector.put((byte) ran.nextInt(Byte.MAX_VALUE));
    }
    return vector.array();
}

private static List<Float> genFloatVector() {
    Random ran = new Random();
    List<Float> vector = new ArrayList<>();
    for (int i = 0; i < DIM; ++i) {
        vector.add(ran.nextFloat());
    }
    return vector;
}

private static byte[] genFloat16Vector() {
    List<Float> originalVector = genFloatVector();
    return Float16Utils.f32VectorToFp16Buffer(originalVector).array();
}

private static SortedMap<Long, Float> genSparseVector() {
    Random ran = new Random();
    SortedMap<Long, Float> sparse = new TreeMap<>();
    int dim = ran.nextInt(18) + 2; // [2, 20)
    for (int i = 0; i < dim; ++i) {
        sparse.put((long)ran.nextInt(1000000), ran.nextFloat());
    }
    return sparse;
}

private static List<String> genStringArray(int length) {
    List<String> arr = new ArrayList<>();
    for (int i = 0; i < length; i++) {
        arr.add("str_" + i);
    }
    return arr;
}

private static List<Long> genIntArray(int length) {
    List<Long> arr = new ArrayList<>();
    for (long i = 0; i < length; i++) {
        arr.add(i);
    }
    return arr;
}

private static RemoteBulkWriter createRemoteBulkWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws IOException {
    StorageConnectParam connectParam = S3ConnectParam.newBuilder()
            .withEndpoint(STORAGE_ENDPOINT)
            .withBucketName(BUCKET_NAME)
            .withAccessKey(ACCESS_KEY)
            .withSecretKey(SECRET_KEY)
            .build();
    RemoteBulkWriterParam bulkWriterParam = RemoteBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withRemotePath("/")
            .withChunkSize(1024 * 1024 * 1024)
            .withConnectParam(connectParam)
            .withFileType(BulkFileType.PARQUET)
            .build();
    return new RemoteBulkWriter(bulkWriterParam);
}

private static List<List<String>> uploadData() throws Exception {
    CreateCollectionReq.CollectionSchema collectionSchema = createSchema();
    try (RemoteBulkWriter remoteBulkWriter = createRemoteBulkWriter(collectionSchema)) {
        for (int i = 0; i < 2000; ++i) {
            JsonObject rowObject = new JsonObject();

            rowObject.addProperty("id", i);
            rowObject.addProperty("bool", i % 3 == 0);
            rowObject.addProperty("int8", i % 128);
            rowObject.addProperty("int16", i % 1000);
            rowObject.addProperty("int32", i % 100000);
            rowObject.addProperty("int64", i);
            rowObject.addProperty("float", i / 3);
            rowObject.addProperty("double", i / 7);
            rowObject.addProperty("varchar", "varchar_" + i);
            rowObject.addProperty("json", String.format("{\"dummy\": %s, \"ok\": \"name_%s\"}", i, i));
            rowObject.add("array_str", GSON_INSTANCE.toJsonTree(genStringArray(5)));
            rowObject.add("array_int", GSON_INSTANCE.toJsonTree(genIntArray(10)));
            rowObject.add("float_vector", GSON_INSTANCE.toJsonTree(genFloatVector()));
            rowObject.add("binary_vector", GSON_INSTANCE.toJsonTree(genBinaryVector()));
            rowObject.add("float16_vector", GSON_INSTANCE.toJsonTree(genFloat16Vector()));
            rowObject.add("sparse_vector", GSON_INSTANCE.toJsonTree(genSparseVector()));
            rowObject.addProperty("dynamic", "dynamic_" + i);

            remoteBulkWriter.appendRow(rowObject);

            if ((i+1)%1000 == 0) {
                remoteBulkWriter.commit(false);
            }
        }

        List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
        System.out.println(batchFiles);
        return batchFiles;
    } catch (Exception e) {
        throw e;
    }
}

public static void main(String[] args) throws Exception {
    List<List<String>> batchFiles = uploadData();
}
```

</TabItem>
</Tabs>

writer の **append_row()** メソッドは、行辞書を受け取ります。 

行辞書には、schema で定義されたすべてのフィールドをキーとして含める必要があります。動的フィールドが許可されている場合は、未定義のフィールドも含めることができます。詳細については、[Use BulkWriter](./use-bulkwriter#dynamic-schema-support) を参照してください。

**BulkWriter** は、**commit()** メソッドを呼び出した後にのみファイルを生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
writer.commit()
```

</TabItem>

<TabItem value='java'>

```java
remoteBulkWriter.commit(false);
```

</TabItem>
</Tabs>

ここまでで、**BulkWriter** は指定されたリモートバケット内にソースデータを準備しました。

生成されたファイルを確認するには、writer の **data_path** プロパティを出力して実際の出力パスを取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
print(writer.data_path)

# /5868ba87-743e-4d9e-8fa6-e07b39229425
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
System.out.println(batchFiles);

// [["/5868ba87-743e-4d9e-8fa6-e07b39229425/1.parquet"]]
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

**BulkWriter** は UUID を生成し、指定された出力ディレクトリ内にその UUID を使用したサブフォルダを作成し、生成されたすべてのファイルをそのサブフォルダに配置します。

</Admonition>

詳細については、[Use BulkWriter](./use-bulkwriter#verify-the-result) を参照してください。

## 準備したデータをインポートする\{#import-prepared-data}

この手順の前に、準備したデータが目的のバケットにすでにアップロードされていることを確認してください。

### インポートを開始する\{#start-importing}

準備したソースデータをインポートするには、以下のように **bulk_import()** 関数を呼び出す必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# Publicly accessible URL for the prepared data in the remote bucket
object_url = "s3://{0}/{1}/".format(BUCKET_NAME, str(writer.data_path)[1:])
# Change `s3` to `gs` for Google Cloud Storage

resp = bulk_import(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,
    collection_name=COLLECTION_NAME,
    object_url=object_url,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

job_id = resp.json()['data']['jobId']
print(job_id)

# job-0103f039ccdq9aip1xd4rf
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.import_.CloudImportRequest;
import io.milvus.bulkwriter.BulkImport;

// Insert the data into the collection
String prefix = batchFiles.get(0).get(0).split("/")[0];
String OBJECT_URL = String.format("s3://%s/%s/", BUCKET_NAME, prefix);

CloudImportRequest cloudImportRequest = CloudImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .collectionName(COLLECTION_NAME)
        .objectUrl(OBJECT_URL)
        .accessKey(ACCESS_KEY)
        .secretKey(SECRET_KEY)
        .build();
String bulkImportResult = BulkImport.bulkImport(CLOUD_API_ENDPOINT, cloudImportRequest);

JsonObject bulkImportObject = new Gson().fromJson(bulkImportResult, JsonObject.class);
String jobId = bulkImportObject.getAsJsonObject("data").get("jobId").getAsString();
System.out.println(jobId);
// job-0103f039ccdq9aip1xd4rf
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

**object_url** は、リモートバケット内のファイルまたはフォルダを指す有効な URL である必要があります。提供されているコードでは、**format()** メソッドを使用してバケット名と writer が返したデータパスを結合し、有効な object URL を作成しています。

データと対象の collection が AWS でホストされている場合、object URL は **s3://remote-bucket/file-path** のようになります。writer が返したデータパスの前に付ける適切な URI については、[Storage Options](./data-import-storage-options) を参照してください。

</Admonition>

### タスクの進行状況を確認する\{#check-task-progress}

以下のコードは、5 秒ごとに bulk-import の進行状況を確認し、進捗をパーセンテージで出力します。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import time
from pymilvus import get_import_progress

job_id = res.json()['data']['jobId']

res = get_import_progress(
    api_key=API_KEY,
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID,  # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
    job_id=job_id,
)

print(res.json()["data"]["progress"])

# check the bulk-import progress
while res.json()["data"]["progress"] < 100:
    time.sleep(5)

    res = get_import_progress(
        # highlight-next-line
        url=CLOUD_API_ENDPOINT,
        api_key=API_KEY,
        job_id=job_id,
        cluster_id=CLUSTER_ID
    )
    
    print(res.json()["data"]["progress"])

# 0   -- import progress 0%
# 49  -- import progress 49%
# 100 -- import finished
```

</TabItem>

<TabItem value='java'>

```java
while (true) {
    System.out.println("Wait 5 second to check bulkInsert job state...");
    TimeUnit.SECONDS.sleep(5);
    
    CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID)
        .jobId(jobId)
        .build();
    String getImportProgressResult = BulkImport.getImportProgress(CLOUD_API_ENDPOINT, request);
    JsonObject getImportProgressObject = GSON_INSTANCE.fromJson(getImportProgressResult, JsonObject.class);
    String importProgressState = getImportProgressObject.getAsJsonObject("data").get("state").getAsString();
    String progress = getImportProgressObject.getAsJsonObject("data").get("progress").getAsString();

    if ("Failed".equals(importProgressState)) {
        String reason = getImportProgressObject.getAsJsonObject("data").get("reason").getAsString();
        System.out.printf("The job %s failed, reason: %s%n", jobId, reason);
        break;
    } else if ("Completed".equals(importProgressState)) {
        System.out.printf("The job %s completed%n", jobId);
        break;
    } else {
        System.out.printf("The job %s is running, state:%s progress:%s%n", jobId, importProgressState, progress);
    }
}

// The job job-01f36d8fd67u94avjfnxi0 is running, state:Importing progress:0
// The job job-01f36d8fd67u94avjfnxi0 is running, state:Importing progress:49
// The job 0f7fe853-d93e-4681-99f2-4719c63585cc completed.
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

**get_import_progress()** の **url** は、対象 collection のクラウドリージョンに対応するものに置き換えてください。

</Admonition>

以下のように、すべての bulk-import ジョブを一覧表示できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import list_import_jobs

res = list_import_jobs(
    api_key=API_KEY,
    # highlight-next-line
    url=CLOUD_API_ENDPOINT,
    cluster_id=CLUSTER_ID  # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
)

print(res.json())

# {
#     "code": 0,
#     "data": {
#         "records": [
#             {
#                 "collectionName": "zero_to_hero",
#                 "jobId": "job-01f36d8fd67u94avjfnxi0",
#                 "state": "Completed"
#             }
#         ],
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10
#     }
# }
```

</TabItem>

<TabItem value='java'>

```java
CloudListImportJobsRequest listImportJobsRequest = CloudListImportJobsRequest.builder()
        .apiKey(API_KEY)
        .clusterId(CLUSTER_ID) // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
        .build();
String listImportJobsResult = BulkImport.listImportJobs(CLOUD_API_ENDPOINT, listImportJobsRequest);
System.out.println(listImportJobsResult);
```

</TabItem>
</Tabs>

## まとめ\{#recaps}

このコースでは、データをインポートする一連のプロセス全体を扱いました。以下に振り返りのポイントを示します。

- データを確認して、対象 collection の schema を設計します。

- **BulkWriter** を使用する際は、次の点に注意してください。

    - 追加する各行に、schema で定義されたすべてのフィールドをキーとして含めます。動的フィールドが許可されている場合は、該当する未定義フィールドも含めます。

    - すべての行を追加した後に **commit()** を呼び出すのを忘れないでください。

- **bulk_import()** を使用する際は、準備済みデータをホストしているクラウドプロバイダの endpoint と、writer が返したデータパスを連結して object URL を構築します。


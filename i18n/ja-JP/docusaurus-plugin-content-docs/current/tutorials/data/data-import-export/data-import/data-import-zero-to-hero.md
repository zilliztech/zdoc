---
title: "データインポートハンズオン | Cloud"
slug: /data-import-zero-to-hero
sidebar_label: "データインポートハンズオン"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudへのデータのインポートを、データの準備や収集の設定から実際のデータインポートの過程まで、迅速に開始するためのファストトラックコースです。このチュートリアルでは、以下のことを学びます | Cloud"
type: origin
token: VY2Iw7ZFLihNwekvTL0c2VNhnRh
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データインポートハンズオン

Zilliz Cloudへのデータのインポートを、データの準備や収集の設定から実際のデータインポートの過程まで、迅速に開始するためのファストトラックコースです。このチュートリアルでは、以下のことを学びます:

- スキーマを定義し、ターゲットコレクションを設定する方法

- BulkWriterを使用してソースデータ**を**準備し、リモートストレージバケットに書き込む方法

- バルクインポートAPIを呼び出してデータをインポートする方法

## 始める前に{#before-you-start}

スムーズな体験を確保するために、以下の設定を完了していることを確認してください。

### Zilliz Cloudクラスタのセットアップ{#set-up-your-zilliz-cloud-cluster}

- まだ作成していない場合は、[クラスタを作成し](./create-cluster)ます。

- これらの詳細を収集してください:**クラスターエンドポイント**、**APIキー**、**クラスターID**。

### 依存関係のインストール{#install-dependencies}

現在、PythonまたはJavaでデータインポート関連APIを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

Python APIを使用するには、ターミナルで次のコマンドを実行して、**pymilvus**と**minio**をインストールするか、最新バージョンにアップグレードしてください。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Mavenの場合、**pom. xml**の依存関係に以下を追加してください:

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>
```

- Gradle/Grailsの場合、以下を実行してください。

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
```

</TabItem>

</Tabs>

### リモートストレージバケットの設定{#configure-your-remote-storage-bucket}

- リモートバケットを設定するには、AWSS 3、Google GCS、またはAzureBlobを使用します。

- メモしてください

    - **S 3互換ブロックストレージサービスのアクセスキー**、**シークレットキー**、および**バケット名**。

    - **AccountName**、**AccountKey**、および**ContainerName**Microsoft Azure BLOBストレージサービス。

    これらの詳細は、バケットがホストされているクラウドプロバイダのコンソールで確認できます。

サンプルコードの使用を強化するために、構成の詳細を格納するために変数を使用することをお勧めします

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

## ターゲットコレクションスキーマを設定する{#set-up-target-collection-schema}

上記の出力に基づいて、ターゲットコレクションのスキーマを作成できます。

次のデモでは、事前に定義されたスキーマに最初の4つのフィールドを含め、他の4つを動的フィールドとして使用します。

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

上記のコードのパラメータは次のように説明されています

- フィールド:

    - `id`はプライマリフィールドです。

    - `float_vector`は浮動小数点ベクトル場です。

    - `binary_vector`はバイナリベクトル場です。

    - `float 16_vector`は、半精度の浮動小数点ベクトルフィールドです。

    - `sparse_vector`は疎ベクトル場です。

    - 残りのフィールドはスカラーフィールドです。

- `auto_id=Falseの場合`

    これがデフォルト値です。**True**に設定すると、**BulkWriter**はプライマリフィールドを生成ファイルに含めません。

- `Enable_Dynamicフィールドを有効にする`

    値のデフォルトは**False**です。これを**True**に設定すると、**BulkWriter**は未定義のフィールドと生成されたファイルの値をキーと値のペアとして含め、予約済みのJSONフィールド**$meta**に配置します。

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

- [`id`]項目はプライマリ項目で、`with AutoID`が`false`に設定されているため、インポートするデータに`id`項目を含める必要があります。

- float`_vector`、`binary_vector`、float`16_vector`、`sparse_vector`フィールドはベクトルフィールドです。

- スキーマが`withEnableDynamicField`に`true`に設定されているため、スキーマ定義以外のフィールドをインポートするデータに含めることができます。

</TabItem>

</Tabs>

スキーマが設定されたら、次のようにターゲットコレクションを作成できます。

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

## ソースデータを準備する{#prepare-source-data}

**BulkWriter**は、データセットをJSON、Parquet、またはNumPyファイルに書き換えることができます。RemoteBulkWriterを作成し**、**これらの形式にデータを書き換えます。

### RemoteBulkWriterの作成{#create-remotebulkwriter}

スキーマが準備できたら、スキーマを使用してRemoteBulkWriterを作成できます。**RemoteBulkWriter**は、**リモート**バケットにアクセスする権限を要求します。リモートバケットにアクセスするための接続パラメータを**ConnectParam**オブジェクトで設定し、RemoteBulkWriterで参照する必要がありま**す**。

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

<Admonition type="info" icon="📘" title="ノート">

<p>エンドポイント<strong>パラメーター</strong>は、クラウドプロバイダーのストレージサービスURIを参照します。</p>
<p>S 3互換ストレージサービスの場合、使用可能なURIは次のとおりです。</p>
<ul>
<li><p><code>s3.amazonaws.com</code>AWSの場合</p></li>
<li><p><code>storage.googleapis.com</code>（GCSの）</p></li>
</ul>
<p>Azure BLOBストレージコンテナーの場合は、次のよう<a href="https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage#view-account-access-keys">な有効な接続文字列</a>を使用する必要があります。</p>
<p><code>DefaultEndpointsProtocol=https;アカウント名=&lt;アカウント名&gt;;アカウントキー=&lt;アカウントキー&gt;;エンドポイントサフィックス=core.windows.net</code></p>

</Admonition>

次に、**RemoteBulkWriter**の接続パラメーターを次のように参照できます。

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
# - BulkFileType.JSON_RB, 
# - BulkFileType.NPY, and 
# - BulkFileType.PARQUET
```

上記のライターはJSON形式のファイルを生成し、指定されたバケットのルートフォルダにアップロードします。

- `リモートパスの設定`

    これにより、リモートバケット内の生成されたファイルの出力パスが決定されます。

    リモートバケットのルートフォルダに生成されたファイルを`"/"`に設定すると、**RemoteBulkWriter**がリモートバケットのルートフォルダに配置します。他のパスを使用する場合は、リモートバケットのルートからの相対パスに設定してください。

- `file_type=ファイルタイプ`

    生成されるファイルの種類を決定します。可能な値は以下の通りです:

    - **BulkFileType. JSON_RBファイル**

    - **バルクファイルタイプ. PARQUET**

    - **一括ファイルタイプ. NPY**

- `セグメントサイズ=1024*1024*102 4`

    これにより、**BulkWriter**が生成されたファイルをセグメント化するかどうかが決まります。デフォルト値は1024 MB（1024*1024*1024）です。データセットに多数のレコードが含まれている場合は、**sement_size**を適切な値に設定してデータをセグメント化することをお勧めします。

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

上記のライターは、Parquet形式のファイルを生成し、指定されたバケットのルートフォルダにアップロードします。

- `withRemotePath("/")を使用してください。`

    これにより、リモートバケット内の生成されたファイルの出力パスが決定されます。

    リモートバケットのルートフォルダに生成されたファイルを`"/"`に設定すると、**RemoteBulkWriter**がリモートバケットのルートフォルダに配置します。他のパスを使用する場合は、リモートバケットのルートからの相対パスに設定してください。

- `パーケット(BulkFileType. PARQUET)`

    生成されるファイルの種類を決定します。現在、**PARQUET**のみが利用可能です。

- `with ChunkSize(1024*1024*102 4)のサイズです。`

    これにより、**BulkWriter**が生成されたファイルをセグメント化するかどうかが決まります。値のデフォルトは1024 MB(1024*1024*1024)です。データセットに多数のレコードが含まれている場合は、withChunkSizeを適切な値に設定してデータをセグメント**化**することをお勧めします。

</TabItem>

</Tabs>

### ライターを使用する{#use-the-writer}

ライターには2つの方法があります。1つはソースデータセットから行を追加するためのもので、もう1つはデータをリモートファイルにコミットするためのものです。

次のようにソースデータセットから行を追加できます:

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

ライターの**append_row()**メソッドは、行の辞書を受け取ります。

行ディクショナリには、すべてのスキーマ定義フィールドをキーとして含める必要があります。動的フィールドが許可されている場合は、未定義フィールドも含めることができます。詳細は、「[BulkWriterを使う](./use-bulkwriter)」を参照してください。

**BulkWriter**は、**commit()**メソッドを呼び出した後にのみファイルを生成します。

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

今まで、**BulkWriter**は指定されたリモートバケットにソースデータを準備しています。

生成されたファイルを確認するには、ライターの**data_path**プロパティを印刷して実際の出力パスを取得できます。

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

<Admonition type="info" icon="📘" title="ノート">

<p><strong>BulkWriter</strong>はUUIDを生成し、指定された出力ディレクトリにUUIDを使用してサブフォルダを作成し、生成されたすべてのファイルをサブフォルダに配置します。</p>

</Admonition>

詳細は、「[BulkWriterを使う](./use-bulkwriter)」を参照してください。

## 準備されたデータをインポートする{#import-prepared-data}

このステップの前に、準備したデータが目的のバケットにすでにアップロードされていることを確認してください。

### インポートを開始{#start-importing}

準備したソースデータをインポートするには、次のように**bulk_import()**関数を呼び出す必要があります。

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

<Admonition type="info" icon="📘" title="ノート">

<p>object<strong>_urlは</strong>、リモートバケット内のファイルまたはフォルダへの有効なURLである必要があります。提供されたコードでは、<strong>format()</strong>メソッドを使用して、バケット名とライターによって返されたデータパスを組み合わせて、有効なオブジェクトURLを作成します。</p>
<p>データとターゲットコレクションがAWSによってホストされている場合、オブジェクトURLは<strong>s 3://remote-bucket/file-path</strong>に似ている必要があります。ライターによって返されたデータパスのプレフィックスに適用可能なURIについては、「<a href="./data-import-storage-options">ストレージオプション</a>」を参照してください。</p>

</Admonition>

### タスクの進捗を確認する{#check-task-progress}

次のコードは、5秒ごとに一括インポートの進行状況をチェックし、進行状況をパーセンテージで出力します。

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

<Admonition type="info" icon="📘" title="ノート">

<p>get<em>i mport</em>gress<strong>(</strong>)内の<strong>urlを</strong>、ターゲットコレクションのクラウドリージョンに対応するものに置き換えてください。</p>

</Admonition>

すべての一括インポートジョブを次のように一覧表示できます。

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

## まとめ{#recaps}

このコースでは、データのインポートの全過程をカバーしました。以下にまとめるアイデアをいくつか紹介します。

- ターゲットコレクションのスキーマを計算するためにデータを調べてください。

- BulkWriterを使用する場合**は**、以下の点に注意してください。

    - 各行に追加するキーとして、スキーマ定義フィールドをすべて含めます。動的フィールドが許可されている場合は、適用可能な未定義フィールドも含めます。

    - すべての行を追加した後に**commit()**を呼び出すことを忘れないでください。

- bulk_import**()**を使用する場合、準備したデータをホストするクラウドプロバイダのエンドポイントと、ライターが返すデータパスを連結してオブジェクトURLを構築します。


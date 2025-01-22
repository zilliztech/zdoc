---
title: "Data Import Hands-On | BYOC"
slug: /data-import-zero-to-hero
sidebar_label: "Zero to Hero"
beta: FALSE
notebook: FALSE
description: "This is a fast-track course to help you quickly start importing data on Zilliz Cloud, from data preparation and collection setup to the actual data import process. Throughout this tutorial, you will learn | BYOC"
type: origin
token: BjHZwBkk0iFScik49QMc1Wwjndb
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Data Import Hands-On

This is a fast-track course to help you quickly start importing data on Zilliz Cloud, from data preparation and collection setup to the actual data import process. Throughout this tutorial, you will learn:

- How to define a schema and set up a target collection

- How to prepare source data using **BulkWriter** and write it to a remote storage bucket

- How to import data by calling bulk-import APIs

## Before you start{#before-you-start}

To ensure a smooth experience, make sure you have completed the following setups:

### Set up your Zilliz Cloud cluster{#set-up-your-zilliz-cloud-cluster}

- If you have not already, [create a cluster](./create-cluster).

- Gather these details: **Cluster Endpoint**, **API Key**, **Cluster ID**.

### Install dependencies{#install-dependencies}

Currently, you can use data-import-related APIs in Python or Java.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

To use the Python API, run the following command in your terminal to install **pymilvus** and **minio** or upgrade them to the latest version.

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- For Apache Maven, append the following to the **pom.xml** dependencies:

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
```

</TabItem>

</Tabs>

### Configure your remote storage bucket{#configure-your-remote-storage-bucket}

- Set up a remote bucket using AWS S3.

- Note down

    - **Access Key**, **Secret Key**, and **Bucket Name** for S3-compatible block storage service.

    - **AccountName**, **AccountKey**, and **ContainerName** for Microsoft Azure blob storage service.

    These details are available in the console of the cloud provider where your bucket is hosted.

To enhance the usage of the example code, we recommend you use variables to store the configuration details:

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

## Set up target collection schema{#set-up-target-collection-schema}

Based on the output above, we can work out a schema for our target collection.

In the following demo, we will include the first four fields in the pre-defined schema and use the other four as dynamic fields.

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

The parameters in the above code are described as follows: 

- fields:

    - `id` is the primary field.

    - `float_vector` is a floating vector field.

    - `binary_vector` is a binary vector field.

    - `float16_vector` is a half-precision floating vector field.

    - `sparse_vector` is a sparse vector field.

    - The rest fields are scalar fields.

- `auto_id=False`

    This is the default value. Setting this to **True** prevents **BulkWriter** from including the primary field in generated files. 

- `enable_dynamic_field=True`

    The value defaults to **False**. Setting this to **True** allows **BulkWriter** to include undefined fields and their values from the generated files as key-value pairs and place them in a reserved JSON field named **$meta**. 

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

In the above code block, 

- The `id` field is the primary field that has `withAutoID` set to `false`, indicating that you should include the `id` field in the data to import.

- The `float_vector`, `binary_vector`, `float16_vector`, and `sparse_vector` fields are vector fields.

- The schema has `withEnableDynamicField` set to `true`, indicating that you can include non-schema-defined fields in the data to import.

</TabItem>

</Tabs>

Once the schema is set, you can create the target collection as follows:

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

## Prepare source data{#prepare-source-data}

**BulkWriter** can rewrite your dataset into JSON, Parquet, or NumPy files. We will create a **RemoteBulkWriter** and use the writer to rewrite your data into these formats.

### Create RemoteBulkWriter{#create-remotebulkwriter}

Once the schema is ready, you can use the schema to create a **RemoteBulkWriter**. A **RemoteBulkWriter** asks for permission to access a remote bucket. You should set up connection parameters to access the remote bucket in a **ConnectParam** object and reference it in the **RemoteBulkWriter**.

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

<p>The <strong>endpoint</strong> parameter refers to the storage service URI of your cloud provider. </p>
<p>For an S3-compatible storage service, possible URIs are as follows:</p>
<ul>
<li><p><code>s3.amazonaws.com</code>(AWS S3)</p></li>
<li><p><code>storage.googleapis.com</code> (GCS)</p></li>
</ul>
<p>For an Azure blob storage container, you should use <a href="https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage#view-account-access-keys">a valid connection string</a> similar to the following:</p>
<p><code>DefaultEndpointsProtocol=https;AccountName=&lt;accountName&gt;;AccountKey=&lt;accountKey&gt;;EndpointSuffix=core.windows.net</code></p>

</Admonition>

Then, you can reference the connection parameters in the **RemoteBulkWriter** as follows:

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

The above writer generates files in JSON format and uploads them to the root folder of the specified bucket.

- `remote_path="/"`

    This determines the output path of the generated files in the remote bucket. 

    Setting it to `"/"` makes the **RemoteBulkWriter** place the generated files in the root folder of the remote bucket. To use other paths, set it to a path relative to the remote bucket root.

- `file_type=BulkFileType.PARQUET`

    This determines the type of generated files. Possible values are as follows:

    - **BulkFileType.JSON_RB**

    - **BulkFileType.PARQUET**

    - **BulkFileType.NPY**

- `segment_size=1024*1024*1024`

    This determines whether **BulkWriter** segments the generated files. The value defaults to 1024 MB (1024 * 1024 * 1024). If your dataset contains a great number of records, you are advised to segment your data by setting **segment_size** to a proper value.

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

The above writer generates files in Parquet format and uploads them to the root folder of the specified bucket.

- `withRemotePath("/")`

    This determines the output path of the generated files in the remote bucket. 

    Setting it to `"/"` makes the **RemoteBulkWriter** place the generated files in the root folder of the remote bucket. To use other paths, set it to a path relative to the remote bucket root.

- `withFileType(BulkFileType.PARQUET)`

    This determines the type of generated files. Currently, only **PARQUET** is available.

- `withChunkSize(1024*1024*1024)`

    This determines whether **BulkWriter** segments the generated files. The value defaults to 1024 MB (1024 * 1024 * 1024). If your dataset contains a great number of records, you are advised to segment your data by setting **withChunkSize** to a proper value.

</TabItem>

</Tabs>

### Use the writer{#use-the-writer}

A writer has two methods: one is for appending rows from the source dataset, and the other is for committing data to remote files.

You can append rows from the source dataset as follows:

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

The **append_row()** method of the writer accepts a row dictionary. 

A row dictionary should contain all schema-defined fields as keys. If dynamic fields are allowed, it can also include undefined fields. For details, refer to [Use BulkWriter](./use-bulkwriter#dynamic-schema-support).

**BulkWriter** generates files only after you call its **commit()** method.

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

Till now, **BulkWriter** has prepared the source data for you in the specified remote bucket.

To check the generated files, you can get the actual output path by printing the **data_path** property of the writer.

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

<p><strong>BulkWriter</strong> generates a UUID, creates a sub-folder using the UUID in the provided output directory, and places all generated files in the sub-folder.</p>

</Admonition>

For details, refer to [Use BulkWriter](./use-bulkwriter#verify-the-result).

## Import prepared data{#import-prepared-data}

Before this step, ensure that the prepared data has already been uploaded to the desired bucket.

### Start importing{#start-importing}

To import the prepared source data, you need to call the **bulk_import()** function as follows:

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

<p>The <strong>object_url</strong> should be a valid URL to a file or folder in the remote bucket. In the code provided, the <strong>format()</strong> method is used to combine the bucket name and the data path returned by the writer to create a valid object URL.</p>
<p>If the data and target collection are hosted by AWS, the object URL should be similar to <strong>s3://remote-bucket/file-path</strong>.  For applicable URI to prefix the data path returned by the writer, please refer to <a href="./data-import-storage-options">Storage Options</a>.</p>

</Admonition>

### Check task progress{#check-task-progress}

The following code checks the bulk-import progress every 5 seconds and outputs the progress in percentage. 

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

<p>Replace <strong>url</strong> in the <strong>get<em>import</em>progress()</strong> with the one corresponding to the cloud region of the target collection.</p>

</Admonition>

You can list all bulk-import jobs as follows:

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

## Recaps{#recaps}

In this course, we have covered the entire process of importing data, and here are some ideas to recap:

- Examine your data to work out the schema of the target collection.

- When using **BulkWriter**, note the following:

    - Include all schema-defined fields as keys in each row to append. If dynamic fields are allowed, include also applicable undefined fields.

    - Do not forget to call **commit()** after appending all rows.

- When using **bulk_import()**, build the object URL by concatenating the endpoint of the cloud provider hosting the prepared data and the data path returned by the writer.


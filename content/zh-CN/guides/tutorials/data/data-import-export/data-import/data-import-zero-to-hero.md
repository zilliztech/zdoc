---
title: "数据导入指南 | Cloud"
slug: /data-import-zero-to-hero
sidebar_key: data-import-zero-to-hero
sidebar_label: "用户指南"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本小节为一个快速引导教程，旨在帮助您在 Zilliz Cloud 上快速开始包含数据准备、建立 Collection 到开始导入数据等子任务在内的全流程数据导入任务。通过本节，你将掌握： | Cloud"
type: origin
token: FXGWwcjyViaQm8kvJgScITzBnr3
sidebar_position: 5
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据导入
  - 指南

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 数据导入指南

本小节为一个快速引导教程，旨在帮助您在 Zilliz Cloud 上快速开始包含数据准备、建立 Collection 到开始导入数据等子任务在内的全流程数据导入任务。通过本节，你将掌握：

- 如何定义 Schema 及创建导入任务的目标 Collection

- 如何使用 **BulkWriter** 准备源数据并将其写入远程对象存储桶

- 如果调用批量导入 API 将准备好的源数据导入目标 Collection

## 开始之前\{#before-you-start}

为了保证整个数据导入流程的连续性，请在开始本教程前完成如下准备工作：

### 在 Zilliz Cloud 上创建集群\{#set-up-your-zilliz-cloud-cluster}

- 如果您还未创建任何集群，参考[此处创建一个集群](./create-cluster)。

- 收集如下信息：**集群 Endpoint**、**API 密钥**、**集群 ID**。

### 安装依赖\{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

在终端中运行以下命令安装 **pymilvus** 和 **minio** 或将它们升级到最新的版本。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- 如您使用 Apache Maven 管理项目, 在项目的 **pom.xml** 文件中添加如下内容：

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>
```

- 如您使用 Gradle/Grails 管理项目, 执行如下命令：

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
```

</TabItem>

</Tabs>

### 配置远程对象存储桶\{#configure-your-remote-storage-bucket}

- 在您的阿里云或腾讯云控制台上创建一个对象存储桶。

- 记录下访问该对象存储桶的 **Access Key**、**Secret Key** 以及**桶名称**。您可以在阿里云控制台中找到这些信息。

为了更好地利用本教程中的示例代码，建议您使用收集到的信息设置如下变量：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
## The value of the URL is fixed.
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn"
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
String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn";
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

## 创建目标 Collection Schema\{#set-up-target-collection-schema}

我们可以根据上表的内容设计目标 Collection 的 Schema。

为了更好地演示 Collection 的能力，我们在目标 Collection 的 Schema 中包含了前 4 个字段，并将后 4 个字段做为动态字段使用。

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

上述代码中的字段解释如下：

- `fields`:

    - `id` 是主键。

    - `title_vector` 用于存储 768 维的向量数据。

    - `title` 和 `link` 是两个标量字段。

- `auto_id=False`

    该参数默认值为 **False**，表示主键不会随数据插入自动增长。将其设置为 **True** 可阻止 **BulkWriter** 在生成的文件中包含主键。

- `enable_dynamic_field=True`

    该参数默认为 **False**，表示 Schema 中未定义的字段将会被忽略。将其设置为 **True** 将允许 **BulkWriter** 将未在 Schema 中定义的字段以键值对的形式存储到一个名为 **&#36;meta** 的预留 JSON 字段中。

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

上述代码中的字段解释如下： 

- 名为 `id` 的字段为主键，其 `withAutoID` 设置为 `false`，表明在导入数据时，待插入数据中应该包含主键。

- 名为 `title_vector` 的字段为向量字段，其 `withDimension` 设置为 768，表明待插入数据各条记录中该字段的值需为一个 768 维的向量。

- Schema 定义中的 `withEnableDynamicField` 设置为 `true`，表明您可以在待插入数据中包含 Schema 中未定义的字段。

</TabItem>

</Tabs>

在创建 Schema 后，就可以继续创建目标 Collection 了。

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

## 准备源数据\{#prepare-source-data}

**BulkWriter** 会将您提供的数据转换成 JSON、Parquet 或 NumPy 文件。在下面的示例中，我们将创建一个 **RemoteBulkWriter** 并使用该 **RemoteBulkWriter** 将您的数据转换成上述格式。

### 创建 RemoteBulkWriter\{#create-remotebulkwriter}

当 Schema 准备好后，就可以使用该 Schema 创建 **RemoteBulkWriter** 了。由于 **RemoteBulkWriter** 需要访问您的远程对象存储桶。因此，您需要先设置好连接远程对象存储桶的 **ConnectParam** 对象并在创建 **RemoteBulkWriter** 时引用该参数。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType
# Use \`from pymilvus import RemoteBulkWriter, BulkFileType\`
# if your pymilvus version is earlier than 2.4.2 

# Connections parameters to access the remote bucket
conn = RemoteBulkWriter.S3ConnectParam(
    # 腾讯云请使用 "cos.ap-beijing-1.myqcloud.com"
    endpoint="oss-cn-hangzhou.aliyuncs.com",
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    bucket_name=BUCKET_NAME, 
    secure=True
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;

// 创建一个 RemoteBulkWriter.
StorageConnectParam storageConnectParam = S3ConnectParam.newBuilder()
        // 腾讯云请使用 "cos.ap-beijing-1.myqcloud.com"
        .withEndpoint("oss-cn-hangzhou.aliyuncs.com") 
        .withBucketName(BUCKET_NAME)
        .withAccessKey(ACCESS_KEY)
        .withSecretKey(SECRET_KEY)
        .build();
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

参数 **endpoint** 决定了生成文件的输出路径。请务必确保您的目标 Collection 所在地域与您的远程对象存储桶所在地域一致。

关于阿里云下 OSS Region 和 Endpoint 对照关系，可[参考此文](https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints)。

关于腾讯云下 OSS Region 和 Endpoint 对照关系，可[参考此文](https://cloud.tencent.com/document/product/436/6224)。

</Admonition>

然后，在创建 **RemoteBulkWriter** 时需要引用上述 **ConnectParam** 对象。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

```python
writer = RemoteBulkWriter(
    schema=schema, # 目标 Collection 的 Schema
    remote_path="/", # 相对于远程对象存储桶根目录的输出路径
    segment_size=512*1024*1024, # 原始数据分段大小
    connect_param=conn, # 远程对象存储桶的连接参数
    file_type=BulkFileType.PARQUET # 输出文件类型.
)

# 支持的输出文件类型:
# - BulkFileType.JSON, 
# - BulkFileType.NPY, and 
# - BulkFileType.PARQUET
```

上述代码将生成 JSON 格式的文件并将其上传到指定桶的根目录下。

- `remote_path="/"`

    此参数决定了生成文件在远程对象存储桶中的输出路径。

    将其设置为 `"/"` 会使 **RemoteBulkWriter** 将生成的文件放入远程对象存储桶的根目录下。若需放入其它路径，请使用相对于桶根目录的相对路径。

- `file_type=BulkFileType.PARQUET`

    此参数决定了生成文件的文件类型。可选值如下：

    - **BulkFileType.JSON**

    - **BulkFileType.PARQUET**

    - **BulkFileType.NPY**

- `segment_size=512*1024*1024`

    此参数决定了 **BulkWriter** 如何对原始数据进行分段。该参数默认值为 512 MB (512 * 1024 * 1024)。如果您的数据集包含数据量较大时，可以考虑使用该参数对数据进行合理分段。

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;

RemoteBulkWriterParam remoteBulkWriterParam = RemoteBulkWriterParam.newBuilder()
        .withCollectionSchema(schema)
        .withRemotePath("/")
        .withChunkSize(512 * 1024 * 1024)
        .withConnectParam(storageConnectParam)
        .withFileType(BulkFileType.PARQUET)
        .build();
        
@SuppressWarnings("resource")
RemoteBulkWriter remoteBulkWriter = new RemoteBulkWriter(remoteBulkWriterParam);

// Possible file types:
// - BulkFileType.PARQUET
```

上述代码将生成 JSON 格式的文件并将其上传到指定桶的根目录下。

- `withRemotePath("/")`

    此参数决定了生成文件在远程对象存储桶中的输出路径。

    将其设置为 `"/"` 会使 **RemoteBulkWriter** 将生成的文件放入远程对象存储桶的根目录下。若需放入其它路径，请使用相对于桶根目录的相对路径。

- `withFileType(BulkFileType.PARQUET)`

    此参数决定了生成文件的文件类型。当前 **PARQUET** 为唯一支持的格式。

- `withChunkSize(512*1024*1024)`

    此参数决定了 **BulkWriter** 如何对原始数据进行分段。该参数默认值为 512 MB (512 * 1024 * 1024)。如果您的数据集包含数据量较大时，可以考虑使用该方法对数据进行合理分段。

</TabItem>

</Tabs>

### 使用 Writer\{#use-the-writer}

**Writer** 对象有两个方法：一个是将原始数据以行的形式添加到缓存中，另一个则是将缓存中的数据写入到远程对象存储桶中。

您可以参考如下代码将原始数据以行的形式添加到缓存中。

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

如上述代码所示，**accept_row()** 方法接收一个字典。该字典以键值对的形式表示一条数据。

需要注意的是，该字典需要包含所有在 Schema 中定义了的字段。如果 Schema 中还开启了动态字段，该字典还允许携带 Schema 中未定义的字段。具体内容，可参考[使用 BulkWriter](./use-bulkwriter)。

您还需要调用 **commit()** 方法才能将缓存中的数据写入到远程对象存储桶中。

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

至此，BulkWriter 将原始数据按您的要求转换成 Zilliz Cloud 可识别的格式并将其存放到指定的远程对象存储桶中。您可以运行如下指令查看输入路径。

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

<Admonition type="info" icon="📘" title="说明">

**BulkWriter** 生成一个 UUID，并使用该 UUID 在指定的输入路径下创建一个子路径，然后将生成的文件放在创建的子路径下。

</Admonition>

更多内容，可参考[使用 BulkWriter](./use-bulkwriter)。

## 导入源数据\{#import-prepared-data}

在此步骤之前，请再次确认您准备的数据已经正确上传到您的存储桶中。

### 创建批量导入任务\{#start-importing}

您可以使用 bulk_import() 函数导入准备好的源数据。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# Publicly accessible URL for the prepared data in the remote bucket
object_url = "s3://{0}/{1}/".format(BUCKET_NAME, str(writer.data_path)[1:])
# Change \`s3\` to \`gs\` for Google Cloud Storage

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

参数 **object_url** 需为远程对象存储桶中一个合法的文件或目录。在上述代码中，我们使用了 **format()** 方法将桶名称和 Writer 返回的路径拼接成一个合法的目录路径。

如需了解更多信息，可参考 [OSS 访问域名使用规则](https://help.aliyun.com/zh/oss/user-guide/oss-domain-names) （阿里云）或[地域和访问域名](https://cloud.tencent.com/document/product/436/6224)（腾讯云）。

</Admonition>

### 检查任务进度\{#check-task-progress}

如下代码每 5 秒钟检查一次任务进度，并打印进度信息。

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

<Admonition type="info" icon="📘" title="说明">

上述代码中，参数 **url** 为 Zilliz Cloud RESTful API 的服务器路径，其取值须与目标 Collection 所在云地域保持一致。

</Admonition>

您还可以列出所有批量导入任务。

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

## 小结\{#recaps}

本教程涵盖了数据导入的全流程。下面是一些在进行数据导入时需要遵循的一些原则：

- 仔细分析您的原始数据，以便更好地完成目标 Collection 的 Schema 设计。

- 在导入数据前，请确保 Zilliz Cloud 集群和 BulkWriter 的输出路径所在对象存储桶由同一家云服务提供商托管。

- 在使用 **BulkWriter** 时，请注意：

    - 在 **append_row()** 中，务必确保参数字典中包含所有 Schema 中定义的字段。如果 Schema 还允许动态字段，您还可以在该字典中包含未在 Schema 中定义的字段。

    - 在将所有数据添加到缓存中后，还需要调用 **commit()** 方法才能将转换好的数据上传到指定的远程对象存储桶中。

- 在使用 **bulk_import()** 函数时，您需要将桶名称、桶中文件或目录的外部访问域名，以及 Writer 返回的路径拼接在一起合成一个合法的 **object_url**。


---
title: "使用 BulkWriter | BYOC"
slug: /use-bulkwriter
sidebar_label: "使用 BulkWriter"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "如果您的数据格式不满足支持的数据格式中列出的各项要求，您可以使用 PyMivus 和 Milvus Java SDK 自带的 BulkWriter 对您的数据进行转换。 | BYOC"
type: origin
token: B9IdwtZhLi0tB8kb6czce8KXnvb
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - bulkwriter

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 使用 BulkWriter

如果您的数据格式不满足[支持的数据格式](./data-import-format-options)中列出的各项要求，您可以使用 PyMivus 和 Milvus Java SDK 自带的 **BulkWriter** 对您的数据进行转换。

## 概述\{#overview}

**BulkWriter** 用于将原始数据转换成可以批量导入到目标 Collection 的格式，并在 Zilliz Cloud 控制台、Milvus SDK 的 **BulkInsert** 接口，以及 RESTful API 的 Import 接口中使用。目前，有如下两种 **BulkWriter**。

- **LocalBulkWriter** 读取指定数据集并将其转换为适用的格式。

- **RemoteBulkWriter** 完成 **LocalBulkWriter** 的所有工作，并将转换后的文件上传到指定的远程对象存储桶中。

## 使用步骤\{#procedure}

### 安装 PyMilvus\{#set-up-pymilvus}

在终端中运行如下命令，安装 PyMilvus 或将其升级到最新版本。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

```python
python3 -m pip install --upgrade pymilvus
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

### 创建 Collection Schema\{#set-up-a-collection-schema}

确定需要导入数据的目标 Collection 的 Schema。在此步骤中，您需要确定哪些字段需要被包含在 Schema 中。

下述代码在创建 Schema 时使用了所有可能的数据类型。另外，Schema 中还关闭了 **AutoID** 并开启了动态字段支持。

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
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.FieldType;
import io.milvus.grpc.DataType;

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

private static byte[] genBinaryVector() {
    Random ran = new Random();
    int byteCount = DIM / 8;
    ByteBuffer vector = ByteBuffer.allocate(byteCount);
    for (int i = 0; i < byteCount; ++i) {
        vector.put((byte) ran.nextInt(Byte.MAX_VALUE));
    }
    return vector.array();
}
```

</TabItem>
</Tabs>

### 创建 BulkWriter\{#create-a-bulkwriter}

PyMilvus 中有两种 BulkWriter。在本小节中，我们将了解如何创建这两种 BulkWriter。

- **LocalBulkWriter**

    **LocalBulkWriter** 将原始数据按行添加到缓存中，然后将缓存中的数据存入一个指定格式的本地文件中。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType
    # 如果您的集群和 Milvus 2.4.2 及之后版本兼容
    # 需使用 `from pymilvus import LocalBulkWriter, BulkFileType` 
    
    writer = LocalBulkWriter(
        schema=schema,
        local_path='.',
        segment_size=512 * 1024 * 1024, # default value
        file_type=BulkFileType.PARQUET
    )
    ```

    在创建 **LocalBulkWriter** 时，您应该：

    - 在 **schema** 参数中引用之前创建好的 CollectionSchema 对象。

    - 在 **local_path** 中指定本地输出路径。

    - 在 **file_type** 中指定输出文件格式。

    - 如果原始数据中包含大量的数据记录，可以考虑设置 **segment_size** 来调整原始数据分段大小。

    关于参数设置，可以参考 SDK Reference 中关于 **LocalBulkWriter** 的介绍。

    <Admonition type="info" icon="📘" title="说明">

    <p>使用 LocalBulkWriter 生成的 JSON 文件和 Parquet 文件可以直接在 Zilliz Cloud 控制台上导入。</p>
    <p>如需导入其它格式的文件，需要先将它们上传到和您的对象存储桶中。建议您使用与您的集群同地域的对象存储桶。</p>

    </Admonition>

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.LocalBulkWriter;
    import io.milvus.bulkwriter.LocalBulkWriterParam;
    import io.milvus.bulkwriter.common.clientenum.BulkFileType;
    
    LocalBulkWriterParam bulkWriterParam = LocalBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withLocalPath(".")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(512 * 1024 * 1024) // 默认值
            .build();
            
    LocalBulkWriter localBulkWriter = new LocalBulkWriter(bulkWriterParam)
    ```

    在创建 **LocalBulkWriter** 时，您应该： 

    - 在 **withCollectionSchema()** 中引用之前创建好的 CollectionSchema 对象。

    - 在 **withLocalPath()** 中指定本地输出路径。

    - 在 **withFileType()** 中设置输出文件类型为 **BulkFileType.PARQUET。**

    - 如果原始数据中包含大量的数据记录，可以考虑在 **withChunkSize()** 中设置原始数据分段大小。

    <Admonition type="info" icon="📘" title="说明">

    <p>Milvus Java SDK 的 BulkWriter 使用 Apache Parquet 作为唯一支持的数据输出格式。</p>

    </Admonition>

    </TabItem>

    </Tabs>

- **RemoteBulkWriter**

    和 **LocalBulkWriter** 不同的是，**RemoteBulkWriter** 将缓存中的数据写入一个远程对象存储桶中。因此，您需要先设置好用于连接该存储桶的 **ConnectParam** 对象，并在创建 RemoteBulkWriter 时引用该 **ConnectParam** 对象。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import RemoteBulkWriter
    # Use `from pymilvus import RemoteBulkWriter` 
    # when you use pymilvus earlier than 2.4.2 
    
    # Third-party constants
    ACCESS_KEY="bucket-ak"
    SECRET_KEY="bucket-sk"
    BUCKET_NAME="a-bucket"
    REGION_NAME="region-name"
    
    # Connections parameters to access the remote bucket
    conn = RemoteBulkWriter.S3ConnectParam(
        endpoint="oss-cn-beijing.aliyuncs.com",
        access_key=ACCESS_KEY,
        secret_key=SECRET_KEY,
        bucket_name=BUCKET_NAME,
        secure=True,
        region=REGION_NAME
    )
    
    from pymilvus.bulk_writer import BulkFileType
    # Use `from pymilvus import BulkFileType` 
    # when you use pymilvus earlier than 2.4.2 
    
    writer = RemoteBulkWriter(
        schema=schema,
        remote_path="/",
        connect_param=conn,
        file_type=BulkFileType.PARQUET
    )
    
    print('bulk writer created.')
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.connect.S3ConnectParam;
    import io.milvus.bulkwriter.connect.StorageConnectParam;
    
    // Configs for remote bucket
    String ACCESS_KEY = "";
    String SECRET_KEY = "";
    String BUCKET_NAME = "";

    // Enumeration can refer to CloudStorage
    String CLOUD_NAME = "";
    String REGION_NAME = "";
    
    // Create a remote bucket writer.
    StorageConnectParam storageConnectParam = S3ConnectParam.newBuilder()
            .withEndpoint("oss-cn-beijing.aliyuncs.com")
            .withBucketName(BUCKET_NAME)
            .withAccessKey(ACCESS_KEY)
            .withSecretKey(SECRET_KEY)
            .withCloudName(CLOUD_NAME)
            .withRegion(REGION_NAME)
            .build();
    
    ```

    </TabItem>
    </Tabs>

    值得注意的是，endpoint 参数的取值根据对象存储桶所在地域的不同可能会发生变化。具体可以参考[支持的对象存储](./data-import-storage-options)。在连接参数准备就绪后，就可以在 RemoteBulkWriter 中引用了。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import RemoteBulkWriter
    # Use `from pymilvus import RemoteBulkWriter` 
    # when you use pymilvus earlier than 2.4.2 
    
    writer = RemoteBulkWriter(
        schema=schema,
        remote_path="/",
        connect_param=conn,
        file_type=BulkFileType.PARQUET
    )
    ```

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
            
    RemoteBulkWriter remoteBulkWriter = new RemoteBulkWriter(remoteBulkWriterParam);
    ```

    </TabItem>
    </Tabs>

除了 **connect_param** 参数外，RemoteBulkWriter 的参数与 LocalBulkWriter 基本相同。更多关于参数设置的信息，可以参考 SDK Reference 中关于 **RemoteBulkWriter** 的介绍。

### 开始转换\{#start-writing}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

**BulkWriter** 对象提供两个方法：**append_row()** 将原始数据按行添加到缓存中，**commit()** 将缓存中的数据写入一个本地文件或远程对象存储桶中。

为了方便演示，下述代码向缓存中添加随机生成的数据。

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

for i in range(10000):
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
```

</TabItem>

<TabItem value='java'>

一个 **BulkWriter** 有两个方法，分别为用于添加源数据的 **appendRow()** 以及用于写入本地文件或远程桶的 **commit()**。

出于演示目的，如下代码将插入随机生成的数据。

<Tabs groupId="java" defaultValue='java' values={[{"label":"主程序","value":"java"},{"label":"随机数据生成器","value":"java_1"}]}>
<TabItem value='java'>

```java

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.common.utils.Float16Utils;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.TimeUnit;

private static List<List<String>> uploadData() throws Exception {
    CreateCollectionReq.CollectionSchema collectionSchema = createSchema();
    try (RemoteBulkWriter remoteBulkWriter = createRemoteBulkWriter(collectionSchema)) {
        for (int i = 0; i < 10000; ++i) {
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

```

</TabItem>
<TabItem value='java_1'>

```java
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
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

<p>在上述代码中 <code>vector</code> 和 <code>scalar_1</code> 字段的值由两个名为 <code>generateFloatVectors()</code> 和 <code>generateString()</code> 的私有方法生成。具体请参考<strong>随机数据生成器</strong>页签。</p>

</Admonition>

</TabItem>

</Tabs>

## 动态字段支持\{#dynamic-schema-support}

在上一节中，我们创建 **BulkWriter** 时引用了一个启用了动态字段的 Schema。因此，我们可以在使用 **BulkWriter** 向缓存中添加数据时携带 Schema 中未定义的字段。

为了方便演示，下述代码向缓存中添加随机生成的数据。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import random
import string

def generate_random_string(length=5):
    letters = string.ascii_uppercase
    digits = string.digits
    
    return ''.join(random.choices(letters + digits, k=length))

for i in range(10000):
    writer.append_row({
        "id": i, 
        "vector":[random.uniform(-1, 1) for _ in range(768)],
        "dynamic_field_1": random.choice([True, False]),
        "dynamic_field_2": random.randint(0, 100)
    })
    
writer.commit()
```

</TabItem>

<TabItem value='java'>

<Tabs groupId="java" defaultValue='java' values={[{"label":"主程序","value":"java"},{"label":"随机数据生成器","value":"java_1"}]}>
<TabItem value='java'>

```java

import java.util.Random

List<JSONObject> data = new ArrayList<>();

for (int i=0; i<10000; i++) {
    Random rand = new Random();
    JSONObject row = new JSONObject();
    
    row.put("id", Long.valueOf(i));
    row.put("vector", generateFloatVectors(768);
    row.put("dynamic_field_1", rand.nextBoolean());
    row.put("dynamic_field_2", rand.nextInt(100));
    remoteBulkWriter.appendRow(row);
}

remoteBulkWriter.commit()

```

</TabItem>
<TabItem value='java_1'>

```java
private static List<float> generateFloatVectors(int dimension) {
    List<float> vector = new ArrayList();
    
    for (int i=0; i< dimension; i++) {
        Random rand = new Random();
        vector.add(rand.nextFloat())
    }
    
    return vector
}

private static String generateString(length) {
    byte[] array = new byte[length];
    new Random().nextBytes(array);
    
    return new String(array, Charset.forName("UTF-8"));
}
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

## 验证结果\{#verify-the-result}

您可以通过打印 **BulkWriter** 的 **data_path** 属性来获取实际输出路径。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
print(writer.data_path)

# LocalBulkWriter
# 'folder/45ae1139-1d87-4aff-85f5-0039111f9e6b'

# RemoteBulkWriter
# '/folder/5868ba87-743e-4d9e-8fa6-e07b39229425'
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

**BulkWriter** 生成一个 UUID，并使用该 UUID 在指定的输入路径下创建一个子路径，然后将生成的文件放在创建的子路径下。您也可以[单击此处](https://assets.zilliz.com/bulk_writer.zip)下载根据上述部署生成的示例数据文件。

生成的数据目录结构如下所示：

- 如果待转换数据大小未超过创建 BulkWriter 时指定的分段大小。

    ```python
    # JSON
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       └── 1.json 
    
    # Parquet
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       └── 1.parquet 
    
    # Numpy
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── id.npy
    │       ├── vector.npy
    │       ├── scalar_1.npy
    │       ├── scalar_2.npy
    │       └── $meta.npy 
    ```

    则对应的导入文件路径如下：

    <table>
       <tr>
         <th><p><strong>文件类型</strong></p></th>
         <th><p>合法的文件导入路径</p></th>
       </tr>
       <tr>
         <td><p><strong>JSON</strong></p></td>
         <td><ul><li><p><em><i>http</i>s://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/</em></p></li><li><p><em>https://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.json</em></p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>Parquet</strong></p></td>
         <td><ul><li><p><em><i>http</i>s://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/</em></p></li><li><p><em>https://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.parquet</em></p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>NumPy</strong></p></td>
         <td><ul><li><p><em><i>http</i>s://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/</em></p></li><li><p><em>https://remote_bucket.oss-cn-hangzhou.aliyuncs.com/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/&ast;.npy</em></p></li></ul></td>
       </tr>
    </table>

    
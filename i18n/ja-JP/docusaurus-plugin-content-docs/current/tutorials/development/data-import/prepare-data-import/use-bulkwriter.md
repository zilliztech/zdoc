---
title: "BulkWriter を使用する | Cloud"
slug: /use-bulkwriter
sidebar_label: "BulkWriter を使用する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ形式が要件を満たしていない場合は、pymilvus および Milvus の Java SDK に含まれるデータ処理ツール BulkWriter を使用してデータを準備できます。 | Cloud"
type: origin
token: QyjpwAaKuihAeJkNBUJcdFesn9e
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BulkWriter を使用する

データ形式が要件を満たしていない場合は、pymilvus および Milvus の Java SDK に含まれるデータ処理ツール **BulkWriter** を使用してデータを準備できます。

## 概要\{#overview}

**BulkWriter** は、生のデータセットを、Zilliz Cloud コンソール、Milvus SDK の **BulkInsert** API、または RESTful 形式の **Import** API など、さまざまな方法でインポートするのに適した形式へ変換するためのスクリプトです。2 種類の writer を提供します。

- **LocalBulkWriter**: 指定されたデータセットを読み取り、使いやすい形式に変換します。

- **RemoteBulkWriter**: **LocalBulkWriter** と同じ処理を行いますが、変換後のデータファイルを指定したリモート object storage bucket に転送する点が異なります。

## 手順\{#procedure}

### 依存関係をセットアップする\{#set-up-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

以下のコマンドをシェルで実行して、pymilvus をインストールするか、pymilvus を最新バージョンにアップグレードします。

```bash
pip install --upgrade pymilvus
```

</TabItem>

<TabItem value='java'>

Apache Maven の場合は、以下を **pom.xml** の dependencies に追加します。

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.4.8</version>
</dependency>
```

- Gradle/Grails の場合は、以下を実行します

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
```

</TabItem>

</Tabs>

### collection schema をセットアップする\{#set-up-a-collection-schema}

データセットをインポートしたい collection の schema を決定します。これには、データセットからどの field を含めるかを選択する作業が含まれます。

以下のコードは、使用可能なすべてのデータ型を含む collection schema を作成します。さらに、この schema では primary field の自動増分を無効にし、dynamic field を有効にしています。

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

### BulkWriter を作成する\{#create-a-bulkwriter}

利用可能な **BulkWriter** には 2 種類あります。

- **LocalBulkWriter**

    **LocalBulkWriter** は、ソースデータセットから行を追加し、指定された形式のローカルファイルにコミットします。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType
    # Use `from pymilvus import LocalBulkWriter, BulkFileType` 
    # when you use pymilvus earlier than 2.4.2 
    
    writer = LocalBulkWriter(
        schema=schema,
        local_path='.',
        chunk_size=1024 * 1024 * 1024,
        file_type=BulkFileType.PARQUET
    )
    ```

    **LocalBulkWriter** を作成する際は、以下を行ってください。

    - **schema** で作成した schema を参照します。

    - **local_path** に出力ディレクトリを設定します。

    - **file_type** に出力ファイル形式を設定します。

    - データセットに多数のレコードが含まれている場合は、**segment_size** に適切な値を設定してデータを分割することを推奨します。

    パラメータ設定の詳細については、SDK リファレンスの **LocalBulkWriter** を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    **LocalBulkWriter** を使用して生成した JSON ファイルおよび Parquet ファイルは、Zilliz Cloud コンソール上で直接 Zilliz Cloud にインポートできます。
    
    その他の形式のファイルについては、インポート前にいずれかの bucket へアップロードしてください。ファイルは、対象の cluster と同じ cloud region にある bucket へアップロードすることを推奨します。

    </Admonition>

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.LocalBulkWriter;
    import io.milvus.bulkwriter.LocalBulkWriterParam;
    import io.milvus.bulkwriter.common.clientenum.BulkFileType;
    
    LocalBulkWriterParam localBulkWriterParam = LocalBulkWriterParam.newBuilder()
        .withCollectionSchema(schema)
        .withLocalPath(".")
        .withChunkSize(1024 * 1024 * 1024)
        .withFileType(BulkFileType.PARQUET)
        .build();
    
    LocalBulkWriter localBulkWriter = new LocalBulkWriter(localBulkWriterParam);
    ```

    **LocalBulkWriter** を作成する際は、以下を行ってください。 

    - **withCollectionSchema()** で作成した schema を参照します。

    - **withLocalPath()** で出力ディレクトリを設定します。

    - **withFileType()** で出力ファイル形式として **BulkFileType.PARQUET** を設定します。

    - データセットに多数のレコードが含まれている場合は、**withChunkSize()** に適切な値を設定してデータを分割することを推奨します。

    <Admonition type="info" icon="📘" title="注意">

    Java SDK の BulkWriter は、現在 Apache Parquet のみを有効な出力ファイル形式として使用します。

    </Admonition>

    </TabItem>

    </Tabs>

- **RemoteBulkWriter**

    **RemoteBulkWriter** は、追加されたデータをローカルファイルにコミットする代わりに、リモート bucket にコミットします。そのため、**RemoteBulkWriter** を作成する前に **ConnectParam** オブジェクトをセットアップする必要があります。

    <Tabs groupId="provider" defaultValue='aws' values={[{"label":"AWS S3/GCS","value":"aws"},{"label":"Microsoft Azure","value":"azure"}]}>

    <TabItem value="aws">

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
        endpoint="s3.amazonaws.com", # use 'storage.googleapis.com' for Google Cloud Storage
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
            .withEndpoint("storage.googleapis.com")
            .withBucketName(BUCKET_NAME)
            .withAccessKey(ACCESS_KEY)
            .withSecretKey(SECRET_KEY)
            .withCloudName(CLOUD_NAME)
            .withRegion(REGION_NAME)
            .build();
    ```

    </TabItem>
    </Tabs>

    </TabItem>

    <TabItem value="azure">

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import RemoteBulkWriter
    # Use `from pymilvus import RemoteBulkWriter` 
    # when you use pymilvus earlier than 2.4.2 
    
    # Third-party constants
    AZURE_CONNECT_STRING = ""
    
    conn = RemoteBulkWriter.AzureConnectParam(
        conn_str=AZURE_CONNECT_STRING,
        container_name=BUCKET_NAME
    )
    
    # or
    
    # Third-party constants
    AZURE_ACCOUNT_URL = ""
    AZURE_CREDENTIAL = ""
    
    conn = RemoteBulkWriter.AzureConnectParam(
        account_url=AZURE_ACCOUNT_URL,
        credential=AZURE_CREDENTIAL,
        container_name=BUCKET_NAME
    )
    ```

    </TabItem>

    <TabItem value='java'>

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

    接続パラメータの準備ができたら、以下のように **RemoteBulkWriter** で参照できます。

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

    **RemoteBulkWriter** を作成するためのパラメータは、**connect_param** を除けば **LocalBulkWriter** のものとほぼ同じです。パラメータ設定の詳細については、SDK リファレンスの **RemoteBulkWriter** および **ConnectParam** を参照してください。

### 書き込みを開始する\{#start-writing}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

**BulkWriter** には 2 つのメソッドがあります。**append_row()** はソースデータセットから 1 行を追加し、**commit()** は追加された行をローカルファイルまたはリモート bucket にコミットします。

デモ用として、以下のコードではランダムに生成したデータを追加します。

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

**BulkWriter** には 2 つのメソッドがあります。**appendRow()** はソースデータセットから 1 行を追加し、**commit()** は追加された行をローカルファイルまたはリモート bucket にコミットします。

デモ用として、以下のコードではランダムに生成したデータを追加します。

<Tabs groupId="java" defaultValue='java' values={[{"label":"Main","value":"java"},{"label":"Random data generators","value":"java_1"}]}>
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

<Admonition type="info" icon="📘" title="注意">

上記のコードブロックでは、`vector` フィールドと `scalar_1` フィールドの値は、それぞれ `generateFloatVectors()` と `generateString()` という 2 つの private 関数によって生成されます。詳細については、**Random data generator** タブ内のコードを参照してください。

</Admonition>

</TabItem>

</Tabs>

## Dynamic schema のサポート\{#dynamic-schema-support}

[前のセクション](./use-bulkwriter#set-up-a-collection-schema)では、writer 内で dynamic field を許可する schema を参照しました。これにより、行を追加する際に未定義の field を含めることができます。

デモ用として、以下のコードではランダムに生成したデータを追加します。

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

<Tabs groupId="java" defaultValue='java' values={[{"label":"Main","value":"java"},{"label":"Random data generators","value":"java_1"}]}>
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

## 結果を確認する\{#verify-the-result}

結果を確認するには、writer の **data_path** プロパティを出力して実際の出力パスを取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
print(writer.batch_files)

# PosixPath('/folder/5868ba87-743e-4d9e-8fa6-e07b39229425')
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

BulkWriter は UUID を生成し、指定された出力ディレクトリ内にその UUID を使ったサブフォルダを作成して、生成されたすべてのファイルをそのサブフォルダに配置します。[準備済みのサンプルデータのダウンロードはこちら](https://assets.zilliz.com/bulk_writer.zip)。

考えられるフォルダ構成は以下のとおりです。

- 生成されたファイルが指定された segment size を超えない場合

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

    | **File Type** | **Valid Import Paths** |
    | --- | --- |
    | **JSON** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>*s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.json* |
    | **Parquet** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>*s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.parquet* |
    | **NumPy** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>*s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/&ast;.npy* |

- 生成されたファイルが指定された segment size を超える場合

    ```python
    # The following assumes that two segments are generated.
    
    # JSON
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1.json
    │       └── 2.json 
    
    # Parquet
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1.parquet
    │       └── 2.parquet 
    
    # Numpy
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1
    │       │   ├── id.npy
    │       │   ├── vector.npy
    │       │   ├── scalar_1.npy
    │       │   ├── scalar_2.npy
    │       │   └── $meta.npy 
    │       └── 2
    │           ├── id.npy
    │           ├── vector.npy
    │           ├── scalar_1.npy
    │           ├── scalar_2.npy
    │           └── $meta.npy  
    ```

    | **File Type** | **Valid Import Paths** |
    | --- | --- |
    | **JSON** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/* |
    | **Parquet** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/* |
    | **NumPy** | *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>*s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/&ast;.npy* |

## 関連トピック\{#related-topics}

- [Web UI でデータをインポートする](./import-data-on-web-ui)

- [RESTful API 経由でデータをインポートする](./import-data-via-restful-api)

- [SDK 経由でデータをインポートする](./import-data-via-sdks)


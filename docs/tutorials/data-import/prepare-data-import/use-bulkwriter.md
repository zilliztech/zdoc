---
slug: /use-bulkwriter
beta: FALSE
notebook: 06_use_remote-bulk-writer.ipynb
type: origin
token: QyjpwAaKuihAeJkNBUJcdFesn9e
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use BulkWriter

If your data format does not meet the requirements on [Prepare Source Data](./prepare-source-data), you can use __BulkWriter__, a data processing tool in pymilvus, to prepare your data.

## Overview{#overview}

__BulkWriter__ in PyMilvus is a script designed to convert raw datasets into a format suitable for importing via various methods such as the Zilliz Cloud console, the __BulkInsert__ APIs of Milvus SDKs, or the __Import__ API in RESTful flavor. It offers two types of writers:

- __LocalBulkWriter__: Reads the designated dataset and transforms it into an easy-to-use format.

- __RemoteBulkWriter__: Performs the same task as the __LocalBulkWriter__ but additionally transfers the converted data files to a specified remote object storage bucket.

## Procedure{#procedure}

### Set up dependencies{#set-up-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

Run the following command in the shell to install pymilvus or upgrade your pymilvus to the latest version.

```bash
pip install --upgrade pymilvus
```

</TabItem>

<TabItem value='java'>

For Apache Maven, append the following to the __pom.xml__ dependencies:

```java
<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java</artifactId>
  <version>2.3.5</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
compile 'io.milvus:milvus-sdk-java:2.3.5'
```

</TabItem>

</Tabs>

### Set up a collection schema{#set-up-a-collection-schema}

Decide on the schema for the collection you wish to import your dataset into. This involves selecting which fields to include from the dataset.

The following code creates a collection schema with four fields: __id__, __vector__, __scalar_1__, __and scalar_2__. The first one is the primary field, the second one is the vector field to store 768-dimensional vector embeddings, and the rest two are scalar fields.

In addition, the schema disables the primary field from automatically incrementing and enables dynamic fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# You need to work out a collection schema out of your dataset.
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="scalar_1", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="scalar_2", datatype=DataType.INT64)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.FieldType;
import io.milvus.grpc.DataType;

// Define schema for the target collection
FieldType id = FieldType.newBuilder()
        .withName("id")
        .withDataType(DataType.Int64)
        .withPrimaryKey(true)
        .withAutoID(false)
        .build();

FieldType vector = FieldType.newBuilder()
        .withName("vector")
        .withDataType(DataType.FloatVector)
        .withDimension(768)
        .build();

FieldType scalar1 = FieldType.newBuilder()
        .withName("scalar_1")
        .withDataType(DataType.VarChar)
        .withMaxLength(512)
        .build();

FieldType scalar2 = FieldType.newBuilder()
        .withName("scalar_2")
        .withDataType(DataType.Int64)
        .build();

CollectionSchemaParam schema = CollectionSchemaParam.newBuilder()
        .withEnableDynamicField(true)
        .addFieldType(id)
        .addFieldType(vector)
        .addFieldType(scalar1)
        .addFieldType(scalar2)
        .build();
```

</TabItem>
</Tabs>

### Create a BulkWriter{#create-a-bulkwriter}

There are two types of __BulkWriter__s available.

- __LocalBulkWriter__

    A __LocalBulkWriter__ appends rows from the source dataset and commits them to a local file of the specified format.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

    <TabItem value='python'>

    ```python
    from pymilvus import LocalBulkWriter, BulkFileType
    
    writer = LocalBulkWriter(
        schema=schema,
        local_path='./tmp',
        segment_size=1 * 1024 * 1024,
        file_type=BulkFileType.NPY
    )
    ```

    When creating a __LocalBulkWriter__, you should:

    - Reference the created schema in __schema__.

    - Set __local_path __to the output directory.

    - Set __file_type __to the output file type.

    - If your dataset contains a large number of records, you are advised to segment your data by setting __segment_size__ to a proper value.

    For details on parameter settings, refer to __LocalBulkWriter__ in the SDK reference.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Only JSON files generated using <strong>LocalBulkWriter</strong> can be directly imported into Zilliz Cloud. </p>
    <p>For files of other types, upload them to one of your buckets in the same cloud region as that of your target cluster before the import.</p>

    </Admonition>

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.bulkwriter.LocalBulkWriter;
    import io.milvus.bulkwriter.LocalBulkWriterParam;
    import io.milvus.bulkwriter.common.clientenum.BulkFileType;
    
    LocalBulkWriterParam bulkWriterParam = LocalBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withLocalPath("./tmp")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(1 * 1024 * 1024)
            .build();
            
    LocalBulkWriter localBulkWriter = new LocalBulkWriter(bulkWriterParam)
    ```

    When creating a __LocalBulkWriter__, you should: 

    - Reference the created schema in __withCollectionSchema()__.

    - Set the output directory in __withLocalPath()__.

    - Set the output file type to __BulkFileType.PARQUET__ in __withFileType()__.

    - If your dataset contains a large number of records, you are advised to segment your data by setting a proper value in __withChunkSize()__.

    <Admonition type="info" icon="📘" title="Notes">

    <p>BulkWriter in the Java SDK currently uses Apache Parquet as the only valid output file type.</p>

    </Admonition>

    </TabItem>

    </Tabs>

- __RemoteBulkWriter__

    Instead of committing appended data to a local file, a __RemoteBulkWriter__ commits them to a remote bucket. Therefore, you should set up a __ConnectParam__ object before creating a __RemoteBulkWriter__.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    <Tabs groupId="python" defaultValue='python' values={[{"label":"AWS S3/GCS","value":"python"},{"label":"Azure Blog Storage","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    
    from pymilvus import RemoteBulkWriter
    
    # Third-party constants
    ACCESS_KEY="YOUR_ACCESS_KEY"
    SECRET_KEY="YOUR_SECRET_KEY"
    BUCKET_NAME="YOUR_BUCKET_NAME"
    
    # Connections parameters to access the remote bucket
    conn = RemoteBulkWriter.S3ConnectParam(
        endpoint="storage.googleapis.com", # Use "s3.amazonaws.com" for AWS S3
        access_key=ACCESS_KEY,
        secret_key=SECRET_KEY,
        bucket_name=BUCKET_NAME, # Use a bucket hosted in the same cloud as the target cluster
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
    </Tabs>
    </TabItem>

    <TabItem value='java'>

    <Tabs groupId="java" defaultValue='java' values={[{"label":"AWS S3/GCS","value":"java"},{"label":"Microsoft Azure","value":"java_1"}]}>
    <TabItem value='java'>

    ```java
    
    import io.milvus.bulkwriter.connect.S3ConnectParam;
    import io.milvus.bulkwriter.connect.StorageConnectParam;
    
    // Configs for remote bucket
    String ACCESS_KEY = "";
    String SECRET_KEY = "";
    String BUCKET_NAME = "";
    
    // Create a remote bucket writer.
    StorageConnectParam storageConnectParam = S3ConnectParam.newBuilder()
            .withEndpoint("storage.googleapis.com")
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

    Once the connection parameters are ready, you can reference it in the __RemoteBulkWriter__ as follows:

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import BulkFileType
    
    writer = RemoteBulkWriter(
        schema=schema,
        remote_path="/",
        connect_param=conn,
        file_type=BulkFileType.NPY
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
            .withChunkSize(512 * 1024 * 1024)
            .withConnectParam(storageConnectParam)
            .withFileType(BulkFileType.PARQUET)
            .build();
            
    @SuppressWarnings("resource")
    RemoteBulkWriter remoteBulkWriter = new RemoteBulkWriter(remoteBulkWriterParam);
    ```

    </TabItem>
    </Tabs>

    The parameters for creating a __RemoteBulkWriter__ are barely the same as those for a __LocalBulkWriter__, except __connect_param__.  For details on parameter settings, refer to __RemoteBulkWriter__ and __ConnectParam__ in the SDK reference.

### Start writing {#start-writing}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

A __BulkWriter__ has two methods: __append_row()__ adds a row from a source dataset, and __commit()__ commits added rows to a local file or a remote bucket.

For demonstration purposes, the following code appends randomly generated data.

```python
import random
import string

def generate_random_str(length=5):
    letters = string.ascii_uppercase
    digits = string.digits
    
    return ''.join(random.choices(letters + digits, k=length))

for i in range(10000):
    writer.append_row({
        "id": i, 
        "vector":[random.uniform(-1, 1) for _ in range(768)]
        "scalar_1": generate_random_str(random.randint(1, 20)),
        "scalar_2": random.randint(100),
    })
    
writer.commit()
```

</TabItem>

<TabItem value='java'>

A __BulkWriter__ has two methods: __appendRow()__ adds a row from a source dataset, and __commit()__ commits added rows to a local file or a remote bucket.

For demonstration purposes, the following code appends randomly generated data.

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
    row.put("scalar_1", generateString(10);
    row.put("scalar_2", rand.nextInt(100));
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

<Admonition type="info" icon="📘" title="Notes">

<p>In the above code block, the value of the <code>vector</code> and <code>scalar_1</code> fields are generated by two private functions named <code>generateFloatVectors()</code> and <code>generateString()</code>, respectively. For details, refer to the codes in the <strong>Random data generator</strong> tab.</p>

</Admonition>

</TabItem>

</Tabs>

## Dynamic schema support{#dynamic-schema-support}

In [the previous section](./use-bulkwriter#set-up-a-collection-schema), we referenced a schema that permits dynamic fields in the writer, allowing undefined fields to be included when appending rows.

For demonstration purposes, the following code appends randomly generated data.

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
        "scalar_1": generate_random_string(),
        "scalar_2": random.randint(100),
        "dynamic_field_1": random.choice([True, False]),
        "dynamic_field_2": random.randint(100)
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
    row.put("scalar_1", generateString(10);
    row.put("scalar_2", rand.nextInt(100));
    row.put("dynamic_field_1", rand.nextBoolean());
    row.put("dynamic_field_1", rand.nextInt(100));
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

## Verify the result{#verify-the-result}

To check the results, you can get the actual output path by printing the __data_path__ property of the writer.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
print(writer.data_path)

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

BulkWriter generates a UUID, creates a sub-folder using the UUID in the provided output directory, and places all generated files in the sub-folder. [Click here to download the prepared sample data](https://assets.zilliz.com/bulk_writer.zip).

Possible folder structures are as follows:

- If the generated file does not exceed the specified segment size

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

    |  __File Type__ |  __Valid Import Paths__                                                                                                                                           |
    | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  __JSON__      |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/> - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.json_<br/>    |
    |  __Parquet__   |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/> - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.parquet_<br/> |
    |  __NumPy__     |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/> - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/\*.npy_<br/>    |

- If the generated file exceeds the specified segment size

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

    |  __File Type__ |  __Valid Import Paths__                                                                                                                                        |
    | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  __JSON__      |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/>                                                                                   |
    |  __Parquet__   |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/>                                                                                   |
    |  __NumPy__     |  - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/_<br/> - _s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/\*.npy_<br/> |

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)


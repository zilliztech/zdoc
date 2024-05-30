---
slug: /data-import-zero-to-hero
sidebar_label: Zero to Hero
beta: FALSE
notebook: FALSE
type: origin
token: BjHZwBkk0iFScik49QMc1Wwjndb
sidebar_position: 1

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# User Guide: Data Import from Zero to Hero

This is a fast-track course to help you quickly start importing data on Zilliz Cloud, from data preparation and collection setup to the actual data import process. Throughout this tutorial, you will learn:

- How to define a schema and set up a target collection

- How to prepare source data using **BulkWriter** and write it to a remote storage bucket

- How to import data by calling bulk-import APIs

## Before you start{#before-you-start}

To ensure a smooth experience, make sure you have completed the following setups:

### Set up your Zilliz Cloud cluster{#set-up-your-zilliz-cloud-cluster}

- If you have not already, [create a cluster](./create-cluster).

- Gather these details: **Cluster Endpoint**, **API Key**, **Cluster ID**, and **Cloud Region**. You can find these cluster values on the [Zilliz Cloud console](./on-zilliz-cloud-console).

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
  <version>2.3.5</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
compile 'io.milvus:milvus-sdk-java:2.3.5'
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
# Configs for Zilliz Cloud cluster
CLUSTER_ENDPOINT=""
API_KEY=""
TOKEN=""
CLUSTER_ID="" # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
CLOUD_REGION=""
CLOUD_API_ENDPOINT="controller.api.{0}.zillizcloud.com".format(CLOUD_REGION)
COLLECTION_NAME=""

# Configs for remote bucket
ACCESS_KEY=""
SECRET_KEY=""
BUCKET_NAME=""
```

</TabItem>

<TabItem value='java'>

```java
// Configs for Zilliz Cloud cluster
String CLUSTER_ENDPOINT = "";
String TOKEN = "";
String API_KEY = "";
String CLUSTER_ID = ""; // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
String CLOUD_REGION = "";
String CLOUD_API_ENDPOINT = String.format("controller.api.%s.zillizcloud.com", CLOUD_REGION);
String COLLECTION_NAME = "";

// Configs for remote bucket
String ACCESS_KEY = "";
String SECRET_KEY = "";
String BUCKET_NAME = "";
```

</TabItem>
</Tabs>

## Download example dataset{#download-example-dataset}

Run the following command in your terminal to download the example CSV file.

```shell
curl https://assets.zilliz.com/doc-assets/medium_articles_partial_a13e0f2a.csv \
        --output medium_articles_partial.csv
```

The output is similar to the following. If you prefer to download from the browser, [click here](https://assets.zilliz.com/medium_articles_partial.csv).

```python
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 5133k  100 5133k    0     0   430k      0  0:00:11  0:00:11 --:--:--  599k0
```

 The following table lists the data structure of the data and the values in the first row.

<table>
   <tr>
     <th><p><strong>Field Name</strong></p></th>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Attributes</strong></p></th>
     <th><p><strong>Sample Value</strong></p></th>
   </tr>
   <tr>
     <td><p>id</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
     <td><p>0</p></td>
   </tr>
   <tr>
     <td><p>title_vector</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>Dimension: 768</p></td>
     <td><p>[0.041732933, 0.013779674, -0.027564144, -0.01…</p></td>
   </tr>
   <tr>
     <td><p>title</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
     <td><p>The Reported Mortality Rate of Coronavirus Is …</p></td>
   </tr>
   <tr>
     <td><p>link</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
     <td><p>https://medium.com/swlh/the-reported-mortality…</p></td>
   </tr>
   <tr>
     <td><p>reading_time</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
     <td><p>13</p></td>
   </tr>
   <tr>
     <td><p>publication</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>Max length: 512</p></td>
     <td><p>The Startup</p></td>
   </tr>
   <tr>
     <td><p>claps</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
     <td><p>1100</p></td>
   </tr>
   <tr>
     <td><p>responses</p></td>
     <td><p>INT64</p></td>
     <td><p>N/A</p></td>
     <td><p>18</p></td>
   </tr>
</table>

The example dataset comprises details of over 5,000 articles from medium.com. Learn about this dataset from its [introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset). 

## Set up target collection{#set-up-target-collection}

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

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="title_vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="link", datatype=DataType.VARCHAR, max_length=512)
```

The parameters in the above code are described as follows: 

- `fields`:

    - `id` is the primary field.

    - `title_vector` is a vector field that holds 768-dimensional vector embeddings.

    - `title` and `link` are two scalar fields.

- `auto_id=False`

    This is the default value. Setting this to **True** prevents **BulkWriter** from including the primary field in generated files. 

- `enable_dynamic_field=True`

    The value defaults to **False**. Setting this to **True** allows **BulkWriter** to include undefined fields and their values from the generated files as key-value pairs and place them in a reserved JSON field named **$meta**. 

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

FieldType titleVector = FieldType.newBuilder()
        .withName("title_vector")
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

CollectionSchemaParam schema = CollectionSchemaParam.newBuilder()
        .withEnableDynamicField(true)
        .addFieldType(id)
        .addFieldType(titleVector)
        .addFieldType(title)
        .addFieldType(link)
        .build();
```

In the above code block, 

- The `id` field is the primary field that has `withAutoID` set to `false`, indicating that you should include the `id` field in the data to import.

- The `title_vector` is the vector field that has `withDimension` set to `768`, indicating that you should set the value of this field in each entity to a 768-dimensional vector embeddings.

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
    token=TOKEN
)

# 2. Set index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="title_vector",
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
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;
import io.milvus.param.IndexType;
import io.milvus.param.MetricType;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.LoadCollectionParam;
import io.milvus.param.index.CreateIndexParam;

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
        .withMetricType(MetricType.IP)
        .build();

milvusClient.createIndex(indexParam);

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
        .withCollectionName(COLLECTION_NAME)
        .build();

milvusClient.loadCollection(loadCollectionParam);
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

from pymilvus.bulk_import import RemoteBulkWriter, BulkFileType
# Use `from pymilvus import RemoteBulkWriter, BulkFileType`
# if your pymilvus version is earlier than 2.4.2 

# Connections parameters to access the remote bucket
conn = RemoteBulkWriter.S3ConnectParam(
    endpoint="storage.googleapis.com", # Use "s3.amazonaws.com" for AWS S3
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
        .withEndpoint("storage.googleapis.com") // Use "s3.amazonaws.com" for AWS S3
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
    segment_size=512*1024*1024, # Maximum segment size when segmenting the raw data
    connect_param=conn, # Connection parameters defined above
    file_type=BulkFileType.JSON_RB # Type of the generated file.
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

- `segment_size=512*1024*1024`

    This determines whether **BulkWriter** segments the generated files. The value defaults to 512 MB (512 * 1024 * 1024). If your dataset contains a great number of records, you are advised to segment your data by setting **segment_size** to a proper value.

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

The above writer generates files in Parquet format and uploads them to the root folder of the specified bucket.

- `withRemotePath("/")`

    This determines the output path of the generated files in the remote bucket. 

    Setting it to `"/"` makes the **RemoteBulkWriter** place the generated files in the root folder of the remote bucket. To use other paths, set it to a path relative to the remote bucket root.

- `withFileType(BulkFileType.PARQUET)`

    This determines the type of generated files. Currently, only **PARQUET** is available.

- `withChunkSize(512*1024*1024)`

    This determines whether **BulkWriter** segments the generated files. The value defaults to 512 MB (512 * 1024 * 1024). If your dataset contains a great number of records, you are advised to segment your data by setting **withChunkSize** to a proper value.

</TabItem>

</Tabs>

### Use the writer{#use-the-writer}

A writer has two methods: one is for appending rows from the source dataset, and the other is for committing data to remote files.

You can append rows from the source dataset as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import pandas as pd

df = pd.read_csv("path/to/medium_articles_partial.csv") # Use the actual file path to the dataset

for i in range(len(df)):
    row = df.iloc[i].to_dict()
    row["title_vector"] = [float(x) for x in row["title_vector"][1:-1].split(",")]
    writer.append_row(row)
```

</TabItem>

<TabItem value='java'>

<Tabs groupId="java" defaultValue='java' values={[{"label":"Main","value":"java"},{"label":"CsvDataObject","value":"java_1"}]}>
<TabItem value='java'>

```java

import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.alibaba.fastjson.JSONObject;

import java.util.Iterator;

CsvMapper csvMapper = new CsvMapper();
File csvFile = new File("medium_articles_partial.csv");

CsvSchema csvSchema = CsvSchema.builder().setUseHeader(true).build();
Iterator<CsvDataObject> iterator = csvMapper
        .readerFor(CsvDataObject.class)
        .with(csvSchema)
        .readValues(csvFile);
        
while (iterator.hasNext()) {
    CsvDataObject data = iterator.next();
    JSONObject row = new JSONObject();

    row.put("id", data.getId());
    row.put("title_vector", data.toFloatArray());
    row.put("title", data.getTitle());
    row.put("link", data.getLink());

    remoteBulkWriter.appendRow(row);
}
        
```

</TabItem>
<TabItem value='java_1'>

```java
// This object should match your data structure (a.k.a schema)

import com.google.gson.Gson;

private static class CsvDataObject {
    @JsonProperty
    private long id;
    @JsonProperty
    private String title_vector;
    @JsonProperty
    private String title;
    @JsonProperty
    private String link;

    public long getId() {
        return id;
    }

    @SuppressWarnings("unused")
    public String getTitleVector() {
        return title_vector;
    }

    public String getTitle() {
        return title;
    }

    public String getLink() {
        return link;
    }

    public List<Float> toFloatArray() {
        return new Gson().fromJson(title_vector, new TypeToken<List<Float>>(){}.getType());
    }
} 
```

</TabItem>
</Tabs>
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
from pymilvus import bulk_import

# Publicly accessible URL for the prepared data in the remote bucket
object_url = "gs://{0}/{1}/".format(BUCKET_NAME, str(writer.data_path)[1:])
# Change `gs` to `s3` for AWS S3

# Start bulk-import
res = bulk_import(
    # Parameters for Zilliz Cloud access
    # highlight-next-line
    url=CLOUD_API_ENDPOINT,
    api_key=API_KEY,
    cluster_id=CLUSTER_ID, # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
    collection_name=COLLECTION_NAME,
    # Parameters for bucket access
    object_url=object_url,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,

)

print(res.json())

# {'code': 200, 'data': {'jobId': '0f7fe853-d93e-4681-99f2-4719c63585cc'}}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.response.BulkImportResponse;

// Insert the data into the collection
String prefix = batchFiles.get(0).get(0).split("/")[0];
String OBJECT_URL = String.format("https://storage.googleapis.com/%s/%s", BUCKET_NAME, prefix);

BulkImportResponse bulkImportResponse = CloudImport.bulkImport(
    CLUSTER_ENDPOINT,
    API_KEY,
    CLUSTER_ID, // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
    COLLECTION_NAME,
    OBJECT_URL,
    ACCESS_KEY,
    SECRET_KEY
);

// Get import job ID
String jobId = bulkImportResponse.getJobId();

System.out.println(jobId);

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>The <strong>object_url</strong> should be a valid URL to a file or folder in the remote bucket. In the code provided, the <strong>format()</strong> method is used to combine the bucket name and the data path returned by the writer to create a valid object URL.</p>
<p>If the data and target collection are hosted by Google Cloud, the object URL should be similar to <strong>gs://remote-bucket/file-path</strong>.  For applicable URI to prefix the data path returned by the writer, please refer to <a href="./prepare-source-data">Prepare Source Data</a>.</p>

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
    # highlight-next-line
    url=CLOUD_API_ENDPOINT,
    api_key=API_KEY,
    job_id=job_id,
    cluster_id=CLUSTER_ID # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
)

print(res.json()["data"]["readyPercentage"])

# check the bulk-import progress
while res.json()["data"]["readyPercentage"] < 1:
    time.sleep(5)

    res = get_import_progress(
        # highlight-next-line
        url=CLOUD_API_ENDPOINT,
        api_key=API_KEY,
        job_id=job_id,
        cluster_id=CLUSTER_ID
    )
    
    print(res.json()["data"]["readyPercentage"])

# 0.01   -- import progress 1%
# 0.5    -- import progress 50%
# 0.5
# 1      -- finished
```

</TabItem>

<TabItem value='java'>

```java
while (true) {
    System.out.println("Wait 5 second to check bulkInsert job state...");
    TimeUnit.SECONDS.sleep(5);

    GetImportProgressResponse getImportProgressResponse = CloudImport.getImportProgress(
        CLUSTER_ENDPOINT,
        API_KEY,
        CLUSTER_ID, // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
        jobId
    );

    if (getImportProgressResponse.getReadyPercentage().intValue() == 1) {
        System.err.printf("The job %s completed%n", jobId);
        break;
    } else if (StringUtils.isNotEmpty(getImportProgressResponse.getErrorMessage())) {
        System.err.printf("The job %s failed, reason: %s%n", jobId, getImportProgressResponse.getErrorMessage());
        break;
    } else {
        System.err.printf("The job %s is running, progress:%s%n", jobId, getImportProgressResponse.getReadyPercentage());
    }
}

// The job 0f7fe853-d93e-4681-99f2-4719c63585cc is running, progress: 0.01
// The job 0f7fe853-d93e-4681-99f2-4719c63585cc is running, progress: 0.5
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
    # highlight-next-line
    url=CLOUD_API_ENDPOINT,
    api_key=API_KEY,
    cluster_id=CLUSTER_ID, # Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
    page_size=10,
    current_page=1,
)

print(res.json())

# {
#    "code":200,
#    "data":{
#       "tasks":[
#          {
#             "collectionName":"medium_aritlces",
#             "jobId":"0f7fe853-d93e-4681-99f2-4719c63585cc",
#             "state":"ImportCompleted"
#          }
#       ],
#       "count":1,
#       "currentPage":1,
#       "pageSize":10
#    }
# }
```

</TabItem>

<TabItem value='java'>

```java
ListImportJobsResponse listImportJobsResponse = CloudImport.listImportJobs(
    CLUSTER_ENDPOINT,
    API_KEY,
    CLUSTER_ID, // Zilliz Cloud cluster ID, like "in01-xxxxxxxxxxxxxxx"
    10,
    1
);

System.out.println(listImportJobsResponse);
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


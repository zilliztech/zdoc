---
slug: /import-data-via-sdks
sidebar_label: SDKs
beta: FALSE
notebook: FALSE
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Import Data (SDK)

This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-import APIs.

Alternatively, you can also refer to [our fast-track end-to-end course](./data-import-zero-to-hero) which covers both data preparations and data import to Zilliz Cloud collections.

## Install dependencies{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

Run the following command in your terminal to install **pymilvus** and **minio** or upgrade them to the latest version.

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
  <version>2.4.0</version>
</dependency>

<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.9</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
compile 'io.milvus:milvus-sdk-java:2.4.0'
compile 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## Check prepared data{#check-prepared-data}

Once you have prepared your data using [the BulkWriter tool](./use-bulkwriter) and got the path to the prepared files. You are ready to import them to a Zilliz Cloud collection. To check whether they are ready, do as follows:

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

## Create collection{#create-collection}

Once your data files are ready, connect to a Zilliz Cloud cluster, create a collection out of the schema, and import the data from the files in the storage bucket.

For details on required information, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console).

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

In the code snippet above, fill in `CLUSTER_ENDPOINT`, `TOKEN`, `API_KEY`, `CLUSTER_ID` and `CLOUD_REGION` with your data, respectively. 

You can obtain `CLOUD_REGION` and `CLUSTER_ID` from your cluster's public endpoint. For instance, in the public endpoint `https://in03-3bf3c31f4248e22.api.aws-us-east1.zillizcloud.com`, `CLOUD_REGION_ID` is `aws-us-east1` and `CLUSTER_ID` is `in03-3bf3c31f4248e22`. To find your cluster endpoint on the Zilliz Cloud console, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console).

## Import data{#import-data}

Once your data and collection are ready, you can start the import process as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import bulk_import
# Use `from pymilvus.bulk

# Bulk-import your data from the prepared data files

res = bulk_import(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    object_url=OBJECT_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    cluster_id=CLUSTER_ID, # Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
    collection_name=COLLECTION_NAME
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a"
#     }
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.response.BulkImportResponse;

BulkImportResponse bulkImportResponse = CloudImport.bulkImport(
    CLUSTER_ENDPOINT,
    API_KEY,
    CLUSTER_ID, // Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
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

<p>For successful data import, ensure the target collection has less than 10 running or pending import jobs.</p>

</Admonition>

### Check import progress{#check-import-progress}

You can check the progress of a specified bulk-import job.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import get_import_progress

job_id = res.json()['data']['jobId']
res = get_import_progress(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    job_id=job_id,
    cluster_id=CLUSTER_ID # Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
)

# check the bulk-import progress

while res.json()["data"]["readyPercentage"] < 1:
    time.sleep(5)

    res = get_import_progress(
        url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
        api_key=API_KEY,
        job_id=job_id,
        cluster_id=CLUSTER_ID
    )

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "collectionName": "medium_articles",
#         "fileName": "folder/1/",
#         "fileSize": 26571700,
#         "readyPercentage": 1,
#         "completeTime": "2023-10-28T06:51:49Z",
#         "errorMessage": null,
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#         "details": [
#             {
#                 "fileName": "folder/1/",
#                 "fileSize": 26571700,
#                 "readyPercentage": 1,
#                 "completeTime": "2023-10-28T06:51:49Z",
#                 "errorMessage": null
#             }
#         ]
#     }
# }
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
        CLUSTER_ID, // Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
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

### List all import jobs{#list-all-import-jobs}

If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import list_import_jobs

# list bulk-import jobs

res = list_import_jobs(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    cluster_id=CLUSTER_ID, # Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
    page_size=10,
    current_page=1,
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "tasks": [
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "53632e6c-c078-4476-b840-10c4793d9c08",
#                 "state": "ImportCompleted"
#             },
#         ],
#         "count": 2,
#         "currentPage": 1,
#         "pageSize": 10
#     }
# }
```

</TabItem>

<TabItem value='java'>

```java
ListImportJobsResponse listImportJobsResponse = CloudImport.listImportJobs(
    CLUSTER_ENDPOINT,
    API_KEY,
    CLUSTER_ID, // Zilliz Cloud Cluster ID, as `in01-xxxxxxxxxxxxxxx`
    10,
    1
);

System.out.println(listImportJobsResponse);
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Prepare Source Data](./prepare-source-data)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 


---
title: "Import Data (SDK) | BYOC"
slug: /import-data-via-sdks
sidebar_label: "SDKs"
beta: FALSE
notebook: FALSE
description: "This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-import APIs. | BYOC"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - sdk

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
  <version>2.4.8</version>
</dependency>

<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.9</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
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

## Import data{#import-data}

Once your data and collection are ready, you can start the import process as follows:

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

<Admonition type="info" icon="📘" title="Notes">

<p>For successful data import, ensure the target collection has less than 10,000 running or pending import jobs.</p>

</Admonition>

### Check import progress{#check-import-progress}

You can check the progress of a specified bulk-import job.

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

### List all import jobs{#list-all-import-jobs}

If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

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

## Related topics{#related-topics}

- [Storage Options](./data-import-storage-options)

- [Format Options](./data-import-format-options)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 


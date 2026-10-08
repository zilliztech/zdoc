---
title: "Import Data (SDK) | Cloud"
slug: /import-data-via-sdks
sidebar_label: "SDKs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-import APIs. | Cloud"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Import Data (SDK)

This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-import APIs.

Alternatively, you can also refer to [our fast-track end-to-end course](./data-import-zero-to-hero) which covers both data preparations and data import to Zilliz Cloud collections.

<Admonition type="info" title="Notes">

Zilliz Cloud now allows you to import data from any object storage service to any Zilliz Cloud cluster, regardless of the cloud provider hosting the clusters. For instance, you can import data from an AWS S3 bucket to a Zilliz Cloud cluster deployed on GCP.

You are advised to use a bucket or a blob container from the same provider and in the same region as the target cluster to ensure a low-latency, stable experience.

</Admonition>

## Install dependencies\{#install-dependencies}

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
  <version>3.0.10</version>
</dependency>

<dependency>
  <groupId>io.milvus</groupId>
  <artifactId>milvus-sdk-java-bulkwriter</artifactId>
  <version>3.0.10</version>
</dependency>

<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.9</version>
</dependency>
```

- For Gradle/Grails, run the following

```shell
implementation 'io.milvus:milvus-sdk-java:3.0.10'
implementation 'io.milvus:milvus-sdk-java-bulkwriter:3.0.10'
implementation 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## Check prepared data\{#check-prepared-data}

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
import io.minio.ListObjectsArgs;
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
    ListObjectsArgs.builder().bucket(BUCKET_NAME).prefix(REMOTE_PATH).build()
);

for (Result<Item> result : results) {
    System.out.println(result.get().objectName());
}

// Output
// [[1.parquet]]
```

</TabItem>
</Tabs>

## Import data\{#import-data}

Once your data and collection are ready, you can import your data into a specific collection either via a volume or via an external storage, such as an object storage bucket and a block storage blob container.

### Import data via volume\{#import-data-via-volume}

To import data from a volume, first create a [managed or external volume](./managed-volume). For a managed volume, upload your data files to the volume. For an external volume, ensure the data files are in the mapped cloud storage bucket. Then import the data as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

def cloud_bulkinsert():
    # The value of the URL is fixed.
    url = "https://api.cloud.zilliz.com"
    api_key = ""
    cluster_id = "inxx-xxxxxxxxxxxxxxx"
    volume_name = "my-first-volume"
    data_path = "dataPath"

    print(f"\n===================== import files to cloud vectordb ====================")

    resp = bulk_import(
        url=url,
        api_key=api_key,
        cluster_id=cluster_id,
        collection_name='medium_articles',
        volume_name=volume_name,
        data_paths=[[data_path]]
    )
    print(resp.json())

if __name__ == '__main__':
    # # to call cloud bulkinsert api, you need to apply a cloud service from Zilliz Cloud(https://zilliz.com/cloud)
    cloud_bulkinsert()
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
    String VOLUME_NAME = "my-first-volume";
    List<String> DATA_PATH = Lists.newArrayList("dataPath");
    VolumeImportRequest volumeImportRequest = VolumeImportRequest.builder()
            .apiKey(API_KEY)
            .clusterId(CLUSTER_ID).collectionName("medium_articles")
            .volumeName(VOLUME_NAME)
            .dataPaths(Lists.newArrayList(Collections.singleton(DATA_PATH)))
            .build();
    String bulkImportResult = BulkImportUtils.bulkImport(CLOUD_API_ENDPOINT, volumeImportRequest);
    System.out.println(bulkImportResult);
    JsonObject bulkImportObject = new Gson().fromJson(bulkImportResult, JsonObject.class);
    String jobId = bulkImportObject.getAsJsonObject("data").get("jobId").getAsString();
    System.out.println("Create a bulkImport task, job id: " + jobId);
    return jobId;
}

public static void main(String[] args) throws Exception {
    String jobId = bulkImport();
}

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>

<TabItem value='go'>

```go
// Note: Cloud volume import (volumeName + dataPaths) is not supported in milvus-sdk-go as of v3.0.0.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // The value of the URL is fixed.
    let config = BulkImportConfig::new()
        .url("https://api.cloud.zilliz.com")
        .api_key("YOUR_API_KEY");
    let bulk_import = BulkImport::new(&config)?;

    let request = BulkImportRequest::builder()
        .collection_name("medium_articles")
        .cluster_id("inxx-xxxxxxxxxxxxxxx")
        .volume_name("my-first-volume")
        .data_paths([["dataPath"]])
        .build()?;

    let resp = bulk_import.bulk_import(request).await?;
    println!("{:?}", resp.job_id());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus::BulkImport::CreateImportJobs() implements the import REST API,
// but as of v3.0.3 it does not accept the cloud volume-import parameters
// (volumeName/dataPaths/clusterId) used in this section.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: Cloud volume import is not supported in milvus-sdk-node as of v3.0.6.
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "collectionName": "medium_articles",
    "volumeName": "my-first-volume",
    "dataPaths": [
        [
            "dataPath"
        ]
    ]
}'
```

</TabItem>
</Tabs>

### Import data via external storage\{#import-data-via-external-storage}

If you prefer to import data via external storage, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    collection_name="medium_articles",
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
            .collectionName("medium_articles")
            .objectUrl(STORAGE_URL)
            .accessKey(ACCESS_KEY)
            .secretKey(SECRET_KEY)
            .build();
    String bulkImportResult = BulkImportUtils.bulkImport(CLOUD_API_ENDPOINT, cloudImportRequest);
    System.out.println(bulkImportResult);
    JsonObject bulkImportObject = new Gson().fromJson(bulkImportResult, JsonObject.class);
    String jobId = bulkImportObject.getAsJsonObject("data").get("jobId").getAsString();
    System.out.println("Create a bulkImport task, job id: " + jobId);
    return jobId;
}

public static void main(String[] args) throws Exception {
    String jobId = bulkImport();
}

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/bulkwriter"
)

func main() {
    ctx := context.Background()

    opt := bulkwriter.NewCloudBulkImportOption(
        "https://api.cloud.zilliz.com",
        "medium_articles",
        "YOUR_API_KEY",
        "YOUR_OBJECT_URL",
        "inxx-xxxxxxxxxxxxxxx",
        "YOUR_ACCESS_KEY",
        "YOUR_SECRET_KEY",
    )
    resp, err := bulkwriter.BulkImport(ctx, opt)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(resp.Data.JobID)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // The value of the URL is fixed.
    let config = BulkImportConfig::new()
        .url("https://api.cloud.zilliz.com")
        .api_key("YOUR_API_KEY");
    let bulk_import = BulkImport::new(&config)?;

    let request = BulkImportRequest::builder()
        .collection_name("medium_articles")
        .cluster_id("inxx-xxxxxxxxxxxxxxx")
        .object_url("YOUR_OBJECT_URL")
        .access_key("YOUR_ACCESS_KEY")
        .secret_key("YOUR_SECRET_KEY")
        .build()?;

    let resp = bulk_import.bulk_import(request).await?;
    println!("{:?}", resp.job_id());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus::BulkImport::CreateImportJobs() implements the import REST API,
// but as of v3.0.3 it does not accept the cloud object-storage parameters
// (objectUrl/accessKey/secretKey/clusterId) used in this section.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: Cloud object-storage import is not supported in milvus-sdk-node as of v3.0.6.
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "objectUrl": "YOUR_OBJECT_URL",
        "accessKey": "YOUR_ACCESS_KEY",
        "secretKey": "YOUR_SECRET_KEY"
    }'
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

For successful data import, ensure the target collection has less than 10,000 running or pending import jobs.

</Admonition>

### Check import progress\{#check-import-progress}

You can check the progress of a specified bulk-import job.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    String getImportProgressResult = BulkImportUtils.getImportProgress(CLOUD_API_ENDPOINT, request);
    System.out.println("Get import progress, result: " + getImportProgressResult);
}

public static void main(String[] args) throws Exception {
    getImportProgress("job-xxxx");
}
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/bulkwriter"
)

func main() {
    ctx := context.Background()

    opt := bulkwriter.NewCloudGetImportProgressOption(
        "https://api.cloud.zilliz.com",
        "job-01fa0e5d42cjxudhpuehyp",
        "YOUR_API_KEY",
        "inxx-xxxxxxxxxxxxxxx",
    )
    resp, err := bulkwriter.GetImportProgress(ctx, opt)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%+v\n", resp.Data)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // The value of the URL is fixed.
    let config = BulkImportConfig::new()
        .url("https://api.cloud.zilliz.com")
        .api_key("YOUR_API_KEY");
    let bulk_import = BulkImport::new(&config)?;

    let request = GetImportProgressRequest::builder()
        .job_id("job-01fa0e5d42cjxudhpuehyp")
        .cluster_id("inxx-xxxxxxxxxxxxxxx")
        .build()?;

    let resp = bulk_import.get_import_progress(request).await?;
    println!("{:?}", resp);
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus::BulkImport::GetImportJobProgress() implements the progress API,
// but as of v3.0.3 it does not send the cloud clusterId used in this section.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: Cloud import progress is not supported in milvus-sdk-node as of v3.0.6.
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/get_progress" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-01fa0e5d42cjxudhpuehyp"
    }'
```

</TabItem>
</Tabs>

### List all import jobs\{#list-all-import-jobs}

If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    String listImportJobsResult = BulkImportUtils.listImportJobs(CLOUD_API_ENDPOINT, listImportJobsRequest);
    System.out.println(listImportJobsResult);
}

public static void main(String[] args) throws Exception {
    listImportJobs();
}
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/bulkwriter"
)

func main() {
    ctx := context.Background()

    opt := bulkwriter.NewListImportJobsOption("https://api.cloud.zilliz.com", "")
    opt.APIKey = "YOUR_API_KEY"
    opt.ClusterID = "inxx-xxxxxxxxxxxxxxx"

    resp, err := bulkwriter.ListImportJobs(ctx, opt)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(resp.Data.Records)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    // The value of the URL is fixed.
    let config = BulkImportConfig::new()
        .url("https://api.cloud.zilliz.com")
        .api_key("YOUR_API_KEY");
    let bulk_import = BulkImport::new(&config)?;

    let request = ListImportJobsRequest::builder()
        .cluster_id("inxx-xxxxxxxxxxxxxxx")
        .build()?;

    let resp = bulk_import.list_import_jobs(request).await?;
    println!("{:?}", resp);
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
// Note: milvus::BulkImport::ListImportJobs() implements the list-jobs API,
// but as of v3.0.3 it does not send the cloud clusterId used in this section.
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Note: Cloud import-jobs listing is not supported in milvus-sdk-node as of v3.0.6.
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/list" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx"
    }'
```

</TabItem>
</Tabs>

## FAQ\{#faq}

**What is the difference between an external volume and importing directly from external storage?**

Both allow you to import data from your own S3 or GCS bucket. The key differences are:

- External volume requires you to integrate an [AWS S3 bucket](./integrate-with-aws-s3), a [Google Cloud Storage bucket](./integrate-with-gcp), or a [Microsoft Azure blob storage container](./integrate-with-azure-blob-storage) with Zilliz Cloud for credential management. Credentials are set up once and reused across multiple volumes and operations. Data engineers do not need direct access to cloud storage keys.

- Direct [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) requires you to provide credentials (access key and secret key) with each import request. This is simpler for one-time imports but does not offer credential separation or reusability.

## Related topics\{#related-topics}

- [Storage Options](./data-import-storage-options)

- [Format Options](./data-import-format-options)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 


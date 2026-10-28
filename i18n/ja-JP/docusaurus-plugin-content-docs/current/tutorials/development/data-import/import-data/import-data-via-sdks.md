---
title: "データのインポート（SDK） | Cloud"
slug: /import-data-via-sdks
sidebar_label: "SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、bulk-writer API と bulk-import API を使用して、当社の SDK でコレクションにデータをインポートする方法について説明します。 | Cloud"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート（SDK）

このガイドでは、bulk-writer API と bulk-import API を使用して、当社の SDK でコレクションにデータをインポートする方法について説明します。

または、データの準備と Zilliz Cloud コレクションへのデータのインポートの両方を扱う [当社の短期集中エンドツーエンドコース](./data-import-zero-to-hero) も参照してください。

<Admonition type="info" title="Notes">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできます。たとえば、AWS S3 バケットから GCP にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシーで安定したエクスペリエンスを確保するには、ターゲットクラスターと同じプロバイダーおよび同じリージョンにあるバケットまたは BLOB コンテナーを使用することをお勧めします。

</Admonition>

## 依存関係をインストールする\{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

ターミナルで次のコマンドを実行して、**pymilvus** と **minio** をインストールするか、最新バージョンにアップグレードします。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Maven の場合は、**pom.xml** の依存関係に以下を追加します。

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

- Gradle/Grails, を使用する場合、次を実行します。

```shell
implementation 'io.milvus:milvus-sdk-java:3.0.10'
implementation 'io.milvus:milvus-sdk-java-bulkwriter:3.0.10'
implementation 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## 準備済みデータを確認する\{#check-prepared-data}

データを [BulkWriter ツール](./use-bulkwriter) で準備し、準備済みファイルのパスを取得したら、それらを Zilliz Cloud コレクションにインポートする準備が整います。準備ができているかどうかを確認するには、次のようにします：

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

## データをインポートする\{#import-data}

データとコレクションの準備ができたら、ボリュームまたは外部ストレージ（オブジェクトストレージバケットやブロックストレージ BLOB コンテナーなど）を介して、特定のコレクションにデータをインポートできます。

### ボリューム経由でデータをインポートする\{#import-data-via-volume}

ボリュームからデータをインポートするには、まず [マネージドボリュームまたは外部ボリューム](./managed-volume) を作成します。マネージドボリュームの場合は、データファイルをボリュームにアップロードします。外部ボリュームの場合は、データファイルがマップされたクラウドストレージバケットにあることを確認します。その後、次のようにデータをインポートします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

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
```

</TabItem>

<TabItem value='java'>

```java
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

using Milvus.Client.V2.Requests.Utility;

// The value of the URL is fixed.
string CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
string CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
string API_KEY = "";
string VOLUME_NAME = "my-first-volume";
string DATA_PATH = "dataPath";

using var bulkImport = new BulkImport(new BulkImportConfig
{
    Url = CLOUD_API_ENDPOINT,
    ApiKey = API_KEY
});

var resp = await bulkImport.BulkImportAsync(new BulkImportRequest
{
    CollectionName = "medium_articles",
    ClusterId = CLUSTER_ID,
    VolumeName = VOLUME_NAME,
    DataPaths = new[] { new[] { DATA_PATH } }
});

Console.WriteLine(resp);
// 0f7fe853-d93e-4681-99f2-4719c63585cc
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

### 外部ストレージ経由でデータをインポートする\{#import-data-via-external-storage}

外部ストレージを介してデータをインポートする場合は、次のようにします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

using Milvus.Client.V2.Requests.Utility;

// Bulk-import your data from the prepared data files
string CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
string CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
string API_KEY = "";
string STORAGE_URL = "";
string ACCESS_KEY = "";
string SECRET_KEY = "";

using var bulkImport = new BulkImport(new BulkImportConfig
{
    Url = CLOUD_API_ENDPOINT,
    ApiKey = API_KEY
});

var resp = await bulkImport.BulkImportAsync(new BulkImportRequest
{
    CollectionName = "medium_articles",
    ClusterId = CLUSTER_ID,
    ObjectUrl = STORAGE_URL,
    AccessKey = ACCESS_KEY,
    SecretKey = SECRET_KEY
});

Console.WriteLine(resp);
// {"code":0,"data":{"jobId":"9d0bc230-6b99-4739-a872-0b91cfe2515a"}}
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

データのインポートを成功させるには、ターゲットコレクションの実行中または保留中のインポートジョブが 10,000 件未満であることを確認してください。

</Admonition>

### インポートの進行状況を確認する\{#check-import-progress}

指定した bulk-import ジョブの進行状況を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
/**
 * The value of the URL is fixed.
 */
String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
String CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
String API_KEY = "";
String jobId = "job-xxxx";
CloudDescribeImportRequest request = CloudDescribeImportRequest.builder()
    .apiKey(API_KEY)
    .clusterId(CLUSTER_ID)
    .jobId(jobId)
    .build();
String getImportProgressResult = BulkImportUtils.getImportProgress(CLOUD_API_ENDPOINT, request);
System.out.println("Get import progress, result: " + getImportProgressResult);
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
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

using Milvus.Client.V2.Requests.Utility;

// Zilliz Cloud constants
string CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
string CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
string API_KEY = "";

using var bulkImport = new BulkImport(new BulkImportConfig
{
    Url = CLOUD_API_ENDPOINT,
    ApiKey = API_KEY
});

// Get bulk-insert job progress
var resp = await bulkImport.GetImportProgressAsync(new GetImportProgressRequest
{
    JobId = "job-01fa0e5d42cjxudhpuehyp",
    ClusterId = CLUSTER_ID
});

Console.WriteLine(resp.Data);
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

### すべてのインポートジョブを一覧表示する\{#list-all-import-jobs}

すべての bulk-import タスクについても知りたい場合は、次のように list-import-jobs API を呼び出せます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

ctx := context.Background()

opt := bulkwriter.NewListImportJobsOption("https://api.cloud.zilliz.com", "")
opt.APIKey = "YOUR_API_KEY"
opt.ClusterID = "inxx-xxxxxxxxxxxxxxx"

resp, err := bulkwriter.ListImportJobs(ctx, opt)
if err != nil {
    log.Fatal(err)
}
fmt.Println(resp.Data.Records)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

using Milvus.Client.V2.Requests.Utility;

// Zilliz Cloud constants
string CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com";
string CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx";
string API_KEY = "";

using var bulkImport = new BulkImport(new BulkImportConfig
{
    Url = CLOUD_API_ENDPOINT,
    ApiKey = API_KEY
});

// List bulk-insert jobs
var resp = await bulkImport.ListImportJobsAsync(new ListImportJobsRequest
{
    ClusterId = CLUSTER_ID
});

Console.WriteLine(resp.Data);
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

**外部ボリュームと、外部ストレージから直接インポートする場合の違いは何ですか？**

どちらも、所有する S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです：

- 外部ボリュームでは、認証情報の管理のために [AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure BLOB ストレージコンテナー](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すると、複数のボリュームと操作で再利用されます。データエンジニアがクラウドストレージのキーに直接アクセスする必要はありません。

- 直接の [外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、インポートリクエストごとに認証情報（アクセスキーとシークレットキー）を指定する必要があります。これは 1 回限りのインポートには簡単ですが、認証情報の分離や再利用性は提供されません。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API 経由でデータをインポートする](./import-data-via-restful-api)

- [ゼロから学ぶデータインポート](./data-import-zero-to-hero) 

---
title: "通过 SDK 导入 | BYOC"
slug: /import-data-via-sdks
sidebar_label: "SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本节将帮助你了解如何使用 SDK 的 BulkWriter 和 BulkImport API 向 Collection 中导入数据。 | BYOC"
type: origin
token: Xv4awWJZpiKoJjkPTlic98Mindc
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 导入
  - sdk

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 通过 SDK 导入

本节将帮助你了解如何使用 SDK 的 BulkWriter 和 BulkImport API 向 Collection 中导入数据。

另外，您还可以参考我们的[数据导入指南](./data-import-zero-to-hero)。其中包含了数据准备和数据导入两个部分的内容。

## 安装依赖\{#install-denpendencies}

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

### 检查已准备数据\{#check-prepared-data}

在您[使用 BulkWriter](./use-bulkwriter) 完成数据准备工作后，你会获得一个路径，指向准备好的数据文件。您可以使用如下代码来检查这些数据文件。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from minio import Minio

# Third-party constants
YOUR_ACCESS_KEY = "YOUR_ACCESS_KEY"
YOUR_SECRET_KEY = "YOUR_SECRET_KEY"
YOUR_BUCKET_NAME = "YOUR_BUCKET_NAME"
YOUR_REMOTE_PATH = "YOUR_REMOTE_PATH"

client = Minio(
    endpoint="oss-cn-hangzhou.aliyuncs.com", 
    # 腾讯云请使用 "cos.ap-beijing-1.myqcloud.com"
    access_key=YOUR_ACCESS_KEY,
    secret_key=YOUR_SECRET_KEY,
    secure=True,
    region='cn-hangzhou'
    # 腾讯云请使用 region='ap-xxx'
)

objects = client.list_objects(
    bucket_name=YOUR_BUCKET_NAME,
    prefix=YOUR_REMOTE_PATH,
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
        .withEndpoint("oss-cn-hangzhou.aliyuncs.com") 
        // 腾讯云请使用 "cos.ap-beijing-1.myqcloud.com"
        .credentials(ACCESS_KEY, SECRET_KEY)
        .region('cn-hangzhou') // 腾讯云请使用 ap-xxx
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

## 导入数据\{#import-data}

一旦您的数据和 Collection 准备就绪，您可以通过外部存储（如对象存储桶和块存储 Blob 容器）将数据导入到特定集合中。

### 从外部存储中导入数据\{#import-data-via-external-storage}

在待导入数据和 Collection 都准备就绪后，可以使用如下脚本将数据从外部存储导入到指定 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# Bulk-import your data from the prepared data files
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""
STORAGE_URL = ""
ACCESS_KEY = ""
SECRET_KEY = ""

res = bulk_import(
    url="api.cloud.zilliz.com.cn",
    api_key=API_KEY,
    object_url=OBJECT_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    cluster_id=CLUSTER_ID, # Zilliz Cloud 集群 ID，如 "in01-xxxxxxxxxxxxxxx"
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

private static String bulkImport() throws InterruptedException {
    /**
     * The value of the URL is fixed.
     */
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn";
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

<Admonition type="info" icon="📘" title="说明">

<p>为了保证数据导入成功，请确认当前 Collection 下正在运行或待运行的任务数量不大于 10,000 条。</p>

</Admonition>

### 查看批量导入进度\{#check-import-progress}

可通过以下代码查看批量导入进度：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import get_import_progress

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn"
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
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn";
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

### 列出所有批量导入任务\{#list-all-import-jobs}

您还可以调用 ListImportJobs API 来了解其它批量导入任务的运行情况：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import list_import_jobs

## Zilliz Cloud constants
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn"
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
    String CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com.cn";
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

## 推荐阅读\{#related-topics}

- [支持的对象存储](./data-import-storage-options)

- [支持的数据格式](./data-import-format-options)

- [使用 BulkWriter](./use-bulkwriter)

- [通过 Web 控制台导入](./import-data-on-web-ui)

- [通过 RESTful API 导入](./import-data-via-restful-api) 


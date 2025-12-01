---
title: "データインポート（SDK） | BYOC"
slug: /import-data-via-sdks
sidebar_label: "SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、SDKを使用してバルクライターおよびバルクインポートAPIでコレクションにデータをインポートする方法を学習できます。| BYOC"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - sdk
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データインポート（SDK）

このガイドでは、SDKを使用してバルクライターおよびバルクインポートAPIでコレクションにデータをインポートする方法を学習できます。

または、[高速エンドツーエンドコース](./data-import-zero-to-hero)も参照できます。これには、データの準備とZilliz Cloudコレクションへのデータインポートの両方が含まれています。

## 依存関係のインストール\{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

端末で以下のコマンドを実行して、**pymilvus** と **minio** をインストールするか、最新バージョンにアップグレードしてください。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Mavenの場合、**pom.xml** の依存関係に以下を追加してください。

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

- Gradle/Grailsの場合、以下を実行してください。

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
compile 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## 準備されたデータの確認\{#check-prepared-data}

[バッチライターツール](./use-bulkwriter)を使用してデータを準備し、準備されたファイルへのパスを取得したら、Zilliz Cloudコレクションにそれらをインポートする準備が整っています。準備ができているかどうかを確認するには、以下のようにしてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from minio import Minio

# サードパーティの定数
ACCESS_KEY = "YOUR_ACCESS_KEY"
SECRET_KEY = "YOUR_SECRET_KEY"
BUCKET_NAME = "YOUR_BUCKET_NAME"
REMOTE_PATH = "YOUR_REMOTE_PATH"

client = Minio(
    endpoint="storage.googleapis.com", # AWS S3の場合は 's3.amazonaws.com' を使用
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

# 出力
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

// サードパーティの定数
String ACCESS_KEY = "YOUR_ACCESS_KEY";
String SECRET_KEY = "YOUR_SECRET_KEY";
String BUCKET_NAME = "YOUR_BUCKET_NAME";
String REMOTE_PATH = "YOUR_REMOTE_PATH";

MinioClient minioClient = MinioClient.builder()
        .endpoint("storage.googleapis.com") // AWS S3の場合は 's3.amazonaws.com' を使用
        .credentials(ACCESS_KEY, SECRET_KEY)
        .build();

Iterable<Result<Item>> results = minioClient.listObjects(
    ListObjectsArgs.builder().bucket(BUCKET_NAME).prefix(REMOTE_PATH).build();
);

while (results.hasNext()) {
    Result<Item> result = results.next();
    System.out.println(result.get().objectName());
}

// 出力
// [[1.parquet]]
```

</TabItem>
</Tabs>

## データのインポート\{#import-data}

データとコレクションの準備が整ったら、オブジェクトストレージバケットやブロックストレージのblobコンテナなどの外部ストレージを介して、特定のコレクションにデータをインポートできます。

### データのインポート\{#import-data}

外部ストレージを介してデータをインポートする場合は、以下のようにしてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# 準備されたデータファイルからデータをバルクインポート
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

# 出力
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
     * URLの値は固定されています。
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
    System.out.println("バルクインサートタスクを作成しました。ジョブID: " + jobId);
    return jobId;
}

public static void main(String[] args) throws Exception {
    String jobId = bulkImport();
}

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注意">

<p>データインポートが成功するように、ターゲットコレクションに実行中または保留中のインポートジョブが10,000個未満であることを確認してください。</p>

</Admonition>

### インポートの進行状況の確認\{#check-import-progress}

指定されたバルクインポートジョブの進行状況を確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import get_import_progress

## Zilliz Cloud定数
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# バルクインサートジョブの進行状況を取得
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
     * URLの値は固定されています。
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
    System.out.println("インポートの進行状況を取得、結果: " + getImportProgressResult);
}

public static void main(String[] args) throws Exception {
    getImportProgress("job-xxxx");
}
```

</TabItem>
</Tabs>

### すべてのインポートジョブのリスト\{#list-all-import-jobs}

すべてのバルクインポートタスクについても知りたい場合は、以下のようにリストインポートジョブAPIを呼び出すことができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import list_import_jobs

## Zilliz Cloud定数
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# バルクインサートジョブをリスト
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
     * URLの値は固定されています。
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

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API経由でのデータインポート](./import-data-via-restful-api)

- [ゼロからのデータインポート](./data-import-zero-to-hero)

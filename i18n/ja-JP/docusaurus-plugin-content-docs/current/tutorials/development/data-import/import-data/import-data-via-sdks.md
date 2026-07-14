---
title: "データのインポート（SDK） | Cloud"
slug: /import-data-via-sdks
sidebar_label: "SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、bulk-writer と bulk-import API を使用して SDK でコレクションにデータをインポートする方法を学べます。 | Cloud"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート（SDK）

このガイドでは、bulk-writer と bulk-import API を使用して SDK でコレクションにデータをインポートする方法を学べます。

また、データ準備と Zilliz Cloud コレクションへのデータインポートの両方を扱う[短時間で学べるエンドツーエンドコース](./data-import-zero-to-hero)も参照できます。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターへデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定したエクスペリエンスを確保するために、ターゲットクラスターと同じプロバイダーかつ同じリージョンのバケットまたは Blob コンテナーを使用することを推奨します。

</Admonition>

## 依存関係のインストール\{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

ターミナルで次のコマンドを実行して、**pymilvus** と **minio** をインストールするか、最新バージョンにアップグレードします。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Maven の場合、以下を **pom.xml** の dependencies に追加します。

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

- Gradle/Grails の場合、次を実行します。

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
compile 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## 準備済みデータの確認\{#check-prepared-data}

[BulkWriter ツール](./use-bulkwriter)を使用してデータを準備し、準備済みファイルへのパスを取得したら、それらを Zilliz Cloud コレクションにインポートする準備が整います。準備ができているか確認するには、以下のようにします。

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

## データのインポート\{#import-data}

データとコレクションの準備ができたら、ボリューム経由またはオブジェクトストレージバケットやブロックストレージ Blob コンテナーなどの外部ストレージ経由で、特定のコレクションにデータをインポートできます。

### ボリューム経由でデータをインポートする\{#import-data-via-volume}

ボリュームからデータをインポートするには、まず[マネージドボリュームまたは外部ボリューム](./managed-volume)を作成します。マネージドボリュームの場合は、データファイルをボリュームにアップロードします。外部ボリュームの場合は、データファイルがマッピングされたクラウドストレージバケット内にあることを確認します。その後、以下のようにデータをインポートします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
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
        collection_name='quick_setup',
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
            .clusterId(CLUSTER_ID).collectionName("quick_setup")
            .volumeName(VOLUME_NAME).dataPaths(Lists.newArrayList(Collections.singleton(DATA_PATH)))
            .build();
    String bulkImportResult = BulkImportUtils.bulkImport(CLOUD_API_ENDPOINT, volumeImportRequest);
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

### 外部ストレージ経由でデータをインポートする\{#import-data-via-external-storage}

外部ストレージ経由でデータをインポートしたい場合は、以下のようにします。

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

<Admonition type="info" icon="📘" title="注意">

データインポートを正常に行うには、ターゲットコレクションの実行中または保留中のインポートジョブ数が 10,000 未満であることを確認してください。

</Admonition>

### インポートの進行状況を確認する\{#check-import-progress}

指定した bulk-import ジョブの進行状況を確認できます。

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

### すべてのインポートジョブを一覧表示する\{#list-all-import-jobs}

すべての bulk-import タスクについても確認したい場合は、次のように list-import-jobs API を呼び出せます。

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

## FAQ\{#faq}

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも、自身の S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです。

- 外部ボリュームでは、認証情報管理のために [AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure Blob Storage コンテナー](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアがクラウドストレージのキーに直接アクセスする必要はありません。

- 直接の[外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)では、インポートリクエストごとに認証情報（access key と secret key）を指定する必要があります。これは一度限りのインポートには簡単ですが、認証情報の分離や再利用性は提供されません。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API を使用したデータのインポート](./import-data-via-restful-api)

- [データインポート完全ガイド](./data-import-zero-to-hero) 


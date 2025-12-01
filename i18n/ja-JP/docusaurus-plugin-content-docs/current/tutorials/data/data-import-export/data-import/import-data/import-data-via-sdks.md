---
title: "データのインポート（SDK） | Cloud"
slug: /import-data-via-sdks
sidebar_label: "SDK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、SDKを使用してバルクライターおよびバルクインポートAPIでデータをコレクションにインポートする方法を学習します。 | Cloud"
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - sdk
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート（SDK）

このガイドでは、SDKを使用してバルクライターおよびバルクインポートAPIでデータをコレクションにインポートする方法を学習します。

または、[私たちの短期集中型エンドツーエンドコース](./data-import-zero-to-hero)も参照できます。このコースでは、データの準備とZilliz Cloudコレクションへのデータインポートの両方をカバーしています。

## 依存関係をインストール\{#install-dependencies}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>

<TabItem value='python'>

ターミナルで以下のコマンドを実行して、**pymilvus**および**minio**をインストールするか、最新バージョンにアップグレードしてください。

```shell
python3 -m pip install --upgrade pymilvus minio
```

</TabItem>

<TabItem value='java'>

- Apache Mavenの場合は、**pom.xml**の依存関係に以下を追加：

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

- Gradle/Grailsの場合は、以下を実行：

```shell
compile 'io.milvus:milvus-sdk-java:2.4.8'
compile 'io.minio:minio:8.5.9'
```

</TabItem>

</Tabs>

## 準備されたデータを確認\{#check-prepared-data}

[BulkWriterツール](./use-bulkwriter)を使用してデータを準備し、準備されたファイルのパスを取得したとします。Zilliz Cloudコレクションにインポートする準備ができています。準備ができているかどうかを確認するには、以下のようにします：

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

データとコレクションの準備ができたら、ボリューム経由またはオブジェクトストレージバケットやブロックストレージblobコンテナなどの外部ストレージ経由で、特定のコレクションにデータをインポートできます。

### ボリュームを介したデータのインポート\{#import-data-via-volume}

ボリューム経由でデータをインポートするには、事前にストレージを作成し、データをボリュームにアップロードする必要があります。詳細については、[データのマージ](./merge-data)を参照してください。

ボリュームの準備ができ、ソースデータファイルが配置されたら、以下のようにボリュームからデータをインポートできます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

def cloud_bulkinsert():
    # URLの値は固定です。
    # 海外リージョンの場合は：https://api.cloud.zilliz.com
    # 中国リージョンの場合は：https://api.cloud.zilliz.com.cn
    url = "https://api.cloud.zilliz.com"
    api_key = ""
    cluster_id = "inxx-xxxxxxxxxxxxxxx"
    volume_name = "my-first-volume"
    data_path = "dataPath"

    print(f"\n===================== クラウドベクトルDBにファイルをインポート ====================")

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
    # # クラウドバルクインサートAPIを呼び出すには、Zilliz Cloud(https://zilliz.com/cloud)からクラウドサービスを申し込む必要があります
    cloud_bulkinsert()

```

</TabItem>

<TabItem value='java'>

```java
private static String bulkImport() throws InterruptedException {
    /**
     * URLの値は固定です。
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
    System.out.println("バルクインサートタスクを作成しました、ジョブID: " + jobId);
    return jobId;
}

public static void main(String[] args) throws Exception {
    String jobId = bulkImport();
}

// 0f7fe853-d93e-4681-99f2-4719c63585cc
```

</TabItem>
</Tabs>

### 外部ストレージを介したデータのインポート\{#import-data-via-external-storage}

外部ストレージ経由でデータをインポートする場合は、以下のようにします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# 準備したデータファイルからデータをバルクインポート
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
     * URLの値は固定です。
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
    System.out.println("バルクインサートタスクを作成しました、ジョブID: " + jobId);
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

<p>データインポートが成功するには、ターゲットコレクションに実行中または保留中のインポートジョブが10,000件未満であることを確認してください。</p>

</Admonition>

### インポートの進行状況を確認\{#check-import-progress}

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
     * URLの値は固定です。
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
    System.out.println("インポート進行状況を取得しました、結果: " + getImportProgressResult);
}

public static void main(String[] args) throws Exception {
    getImportProgress("job-xxxx");
}
```

</TabItem>
</Tabs>

### すべてのインポートジョブを一覧表示\{#list-all-import-jobs}

すべてのバルクインポートタスクについても知りたい場合は、以下のようにlist-import-jobs APIを呼び出すことができます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import list_import_jobs

## Zilliz Cloud定数
CLOUD_API_ENDPOINT = "https://api.cloud.zilliz.com"
CLUSTER_ID = "inxx-xxxxxxxxxxxxxxx"
API_KEY = ""

# バルクインサートジョブを一覧表示
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
     * URLの値は固定です。
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

- [RESTful APIを使用したデータのインポート](./import-data-via-restful-api)

- [データインポートゼロからヒーロー](./data-import-zero-to-hero)

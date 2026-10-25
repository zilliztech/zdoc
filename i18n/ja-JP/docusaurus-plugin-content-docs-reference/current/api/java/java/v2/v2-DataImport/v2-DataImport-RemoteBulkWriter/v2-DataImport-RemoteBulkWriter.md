---
title: "RemoteBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RemoteBulkWriter インスタンスは、生データを Milvus が解釈できる形式で AWS S3 互換バケットに書き込みます。 | Java | v2"
type: docx
token: JETLdPGdboaeksx2o7acgo8lnMc
sidebar_position: 5
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - zilliz cloud
  - クラウド
  - RemoteBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

RemoteBulkWriter インスタンスは、生データを Milvus が解釈できる形式で AWS S3 互換バケットに書き込みます。

```java
io.milvus.bulkwriter.RemoteBulkWriter
```

## コンストラクター\{#constructor}

**RemoteBulkWriter** インスタンスを、**スキーマ**、**remote_path**、**connect_param、** などの一連のパラメーターで構築します。

**RemoteBulkWriter** オブジェクトは、生データを Milvus が解釈できる形式に書き換えて、AWS S3 互換バケットまたは Microsoft Azure Blob Storage バケットに格納することを目的としています。

```java
public RemoteBulkWriter(RemoteBulkWriterParam bulkWriterParam)
```

**パラメーター:**

- **bulkWriterParam** (*RemoteBulkWriterParam*) -

    RemoteBulkWriterParam のインスタンスです。

## RemoteBulkWriterParam\{#remotebulkwriterparam}

**RemoteBulkWriterParam** を使用すると、**RemoteBulkWriter** インスタンスのプロパティを 1 か所で設定できるため、**RemoteBulkWriter** クラスをインスタンス化できます。

```java
RemoteBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withConnectParam(StorageConnectParam connectParam)
    .withRemotePath(String remotePath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .build()
```

**ビルダーメソッド:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    対象コレクションのスキーマです。CreateCollectionReq.CollectionSchema をインスタンス化して定義します。

- `withConnectParam(StorageConnectParam connectParam)`

    リモートバケットへの接続に使用するパラメーターです。StorageConnectParam をインスタンス化して定義します。

- `withRemotePath(String remotePath)`

    書き換え後のデータを格納するディレクトリのパスです。

- `withChunkSize(long chunkSize)`

    ファイルセグメントの最大サイズです。生データを書き換える際、Milvus はデータをセグメントに分割します。

    値のデフォルトは **536,870,912** バイト（**512 MB**）です。

    BulkWriter によるデータのセグメント化方法は、対象ファイルの種類によって異なります。生成されたファイルが指定したセグメントサイズを超える場合、BulkWriter は複数のファイルを作成し、各ファイルがセグメントサイズを超えないように連番を付けます。

- `withFileType(BulkFileType fileType)`

    出力ファイルの種類です。使用可能なオプションは BulkFileType に一覧されています。

- `withConfig(String key, Object val)`

    CSV ファイルを処理するためのオプション設定を指定するディクショナリーです。このパラメーターは、`withFileType()` で `fileType` を `CSV` に設定した場合にのみ適用されます。ディクショナリーには次のフィールドが含まれます:

    - **sep** (*string*) -

        CSV ファイルの区切り文字です。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`。

    - **nullkey** (*string*) -

        null 値を表す特殊な文字列です。値のデフォルトは空の文字列 `""` です。

## StorageConnectParam\{#storageconnectparam}

**StorageConnectParam** は、**AzureConnectParam** および **S3ConnectParam** で実装されています。

### AzureConnectParam\{#azureconnectparam}

**AzureConnectParam** は、Microsoft Azure Blob Storage コンテナーに接続するためのパラメーターを準備します。

```java
AzureConnectParam.newBuilder()
    .withContainerName(String containerName)
    .withConnStr(String connStr)
    .withAccountUrl(String accountUrl)
    .withCredential(TokenCrendtial credential)
    .build()
```

**ビルダーメソッド:**

- `withContainerName(String containerName)`

    接続するリモート Azure Blob Storage コンテナーの名前です。

- `withConnStr(String connStr)`

    Azure Storage アカウントへの接続文字列です。account_url と認証情報に解析できます。接続文字列を生成するには、このリンクを参照してください。

- `withAccountUrl(String accountUrl)`

    `https://<storage-account>.blob.core.windows.net` のような形式の文字列です。詳細については、このリンクを参照してください。

- `withCredential(TokenCrendtial credential)`

    アカウントのアクセスキーです。詳細については、このリンクを参照してください。

### S3ConnectParam\{#s3connectparam}

S3ConnectParam は、S3 互換のオブジェクトストレージバケットに接続するためのパラメーターを準備します。

```java
S3ConnectParam.newBuilder()
    .withCloudName(String cloudName)
    .withBucketName(String bucketName)
    .withEndpoint(String endpoint)
    .withAccessKey(String accessKey)
    .withSecretKey(String secretKey)
    .withSessionToken(String sessionToken)
    .withRegion(String region)
    .withHttpClient(OkHttpClient httpClient)
    .build()
```

**ビルダーメソッド:**

- `withCloudName(String cloudName)`

    S3 互換のオブジェクトストレージサービスを提供するクラウドプロバイダーです。使用可能なオプションは次の通りです:

    - **MINIO**（MinIO）

    - **AWS**（AWS S3）

    - **GCP**（GCP Cloud Storage）

    - **ALI**（Alibaba Cloud OSS）

    - **TC**（Tencent Cloud COS）

- `withBucketName(String bucketName)`

    接続するリモートバケットの名前です。

- `withEndpoint(String endpoint)`

    AWS S3 互換サービスの URL です。

    値には、MinIO サービスの URL または任意の AWS S3 互換パブリックサービスの URL を指定できます。

- `withAccessKey(String accessKey)`

    指定したバケットへのアクセスを認証するために使用するアクセスキー（ユーザー ID）です。

- `withSecretKey(String secretKey)`

    指定したバケットへのアクセスを認証するために使用する secret_key（パスワード）です。

- `withSessionToken(String sessionToken)`

    AWS S3 互換サービスにおけるアカウントのセッショントークンです。

- `withRegion(String region)`

    バケットが存在するリージョンの名前または ID です。

- `withHttpClient(OkHttpClient httpClient)`

    OkHttp クライアントを使用して、AWS S3 互換サービスへの安全な（TLS）接続を設定するかどうかです。

## 例\{#example}

```java
import com.google.gson.JsonObject;

import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.bulkwriter.common.clientenum.CloudStorage;
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.List;

private static List<List<String>> callRemoteWriter(CreateCollectionReq.CollectionSchema collectionSchema,
                                                   List<JsonObject> data) throws Exception {
    StorageConnectParam connectParam = S3ConnectParam.newBuilder()
                .withEndpoint(STORAGE_ENDPOINT)
                .withCloudName(CloudStorage.MINIO.getCloudName())
                .withBucketName(STORAGE_BUCKET)
                .withAccessKey(STORAGE_ACCESS_KEY)
                .withSecretKey(STORAGE_SECRET_KEY)
                .withRegion(STORAGE_REGION)
                .build();
    
    RemoteBulkWriterParam bulkWriterParam = RemoteBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withRemotePath("bulk_data")
            .withFileType(BulkFileType.CSV)
            .withChunkSize(512 * 1024 * 1024)
            .withConnectParam(connectParam)
            .withConfig("sep", "|") // only take effect for CSV file
            .build();
    
    try (RemoteBulkWriter remoteBulkWriter = new RemoteBulkWriter(bulkWriterParam)) {
        for (JsonObject rowObject : data) {
            remoteBulkWriter.appendRow(rowObject);
        }
        remoteBulkWriter.commit(false);

        return remoteBulkWriter.getBatchFiles();
    } catch (Exception e) {
        throw e;
    }
}
```

---
title: "RemoteBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "RemoteBulkWriter インスタンスは、Milvus が理解できる形式で生データを AWS S3 互換バケットに書き込みます。 | Java | v2"
type: docx
token: XAIndF6XWoQzvRxDvpLcgEE1nEb
sidebar_position: 5
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - RemoteBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

**RemoteBulkWriter** インスタンスは、Milvus が理解できる形式で生データを AWS S3 互換バケットに書き込みます。

```java
io.milvus.bulkwriter.RemoteBulkWriter
```

## Constructor\{#constructor}

**schema**、**remote_path**、**connect_param,** などのパラメータセットを使用して **RemoteBulkWriter** インスタンスを構築します。

<Admonition type="info" icon="📘" title="Notes">

**RemoteBulkWriter** オブジェクトは、生データを Milvus が理解できる形式に変換して、AWS S3 互換または Microsoft Azure Blob Storage バケットに書き込むことを目的としています。

</Admonition>

```java
public RemoteBulkWriter(RemoteBulkWriterParam bulkWriterParam)
```

**PARAMETERS:**

- **bulkWriterParam** (*RemoteBulkWriterParam*) -

    [RemoteBulkWriterParam](./v2-DataImport-RemoteBulkWriter#remotebulkwriterparam) インスタンス。

## RemoteBulkWriterParam\{#remotebulkwriterparam}

**RemoteBulkWriterParam** を使用すると、**RemoteBulkWriter** クラスをインスタンス化できるように、**RemoteBulkWriter** インスタンスのプロパティを 1 か所で設定できます。

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

**BUILDER METHODS:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    CreateCollectionReq.CollectionSchema をインスタンス化して定義される、対象 collection の schema。

- `withConnectParam(StorageConnectParam connectParam)`

    リモートバケットへの接続に使用するパラメータで、[StorageConnectParam](./v2-DataImport-RemoteBulkWriter#storageconnectparam) をインスタンス化して定義します。

- `withRemotePath(String remotePath)`

    変換後のデータを格納するディレクトリへのパス。

- `withChunkSize(long chunkSize)`

    ファイルセグメントの最大サイズ。生データの変換中に、Milvus はそれを複数のセグメントに分割します。

    デフォルト値はバイト単位で **536,870,912**、つまり **512 MB** です。

    <Admonition type="info" icon="📘" title="**BulkWriter はどのようにデータをセグメント化しますか？**">

    BulkWriter がデータをセグメント化する方法は、対象のファイルタイプによって異なります。
    
    生成されたファイルが指定されたセグメントサイズを超える場合、BulkWriter は複数のファイルを作成し、それぞれがセグメントサイズを超えないように連番で名前を付けます。

    </Admonition>

- `withFileType(BulkFileType fileType)`

    出力ファイルのタイプ。使用可能なオプションは [BulkFileType](./v2-DataImport-BulkFileType) に一覧があります。

- `withConfig(String key, Object val)`

    CSV ファイル処理用のオプション設定を指定する辞書。このパラメータは、`withFileType()` で `fileType` を `CSV` に設定した場合にのみ適用されます。辞書には次のフィールドが含まれます。

    - **sep** (*string*) -

        CSV ファイルの区切り文字。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`。

    - **nullkey** (*string*) -

        null 値を表す特別な文字列。デフォルト値は空文字列 `""` です。

## StorageConnectParam\{#storageconnectparam}

**StorageConnectParam** は **AzureConnectParam** および **S3ConnectParam** で実装されています。

### AzureConnectParam\{#azureconnectparam}

**AzureConnectParam** は、Microsoft Azure Blob Storage コンテナに接続するためのパラメータを準備します。

```java
AzureConnectParam.newBuilder()
    .withContainerName(String containerName)
    .withConnStr(String connStr)
    .withAccountUrl(String accountUrl)
    .withCredential(TokenCrendtial credential)
    .build()
```

**BUILDER METHODS:**

- `withContainerName(String containerName)`

    接続先のリモート Azure Blob Storage コンテナの名前。

- `withConnStr(String connStr)`

    Azure Storage アカウントへの接続文字列で、account_url と credential に解析できます。接続文字列の生成方法については、[このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) を参照してください。

- `withAccountUrl(String accountUrl)`

    `https://<storage-account>.blob.core.windows.net` のような形式の文字列。詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) を参照してください。

- `withCredential(TokenCrendtial credential)`

    アカウントのアクセスキー。詳細は [このリンク](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) を参照してください。

### S3ConnectParam\{#s3connectparam}

S3ConnectParam は、S3 互換オブジェクトストレージバケットに接続するためのパラメータを準備します

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

**BUILDER METHODS:**

- `withCloudName(String cloudName)`

    S3 互換オブジェクトストレージサービスを提供するクラウドプロバイダ。使用可能なオプションは次のとおりです。

    - **MINIO** (MinIO)

    - **AWS** (AWS S3)

    - **GCP** (GCP Cloud Storage)

    - **ALI** (Alibaba Cloud OSS)

    - **TC** (Tencent Cloud COS)

- `withBucketName(String bucketName)`

    接続先のリモートバケット名。

- `withEndpoint(String endpoint)`

    AWS S3 互換サービスの URL。

    値には、MinIO サービスの URL、または任意の AWS S3 互換パブリックサービスの URL を指定できます。

- `withAccessKey(String accessKey)`

    指定したバケットへのアクセス認証に使用する access key（ユーザー ID）。

- `withSecretKey(String secretKey)`

    指定したバケットへのアクセス認証に使用する secret_key（パスワード）。

- `withSessionToken(String sessionToken)`

    AWS S3 互換サービス内のアカウントのセッショントークン。

- `withRegion(String region)`

    バケットが存在するリージョンの名前または ID。

- `withHttpClient(OkHttpClient httpClient)`

    OkHttp クライアントを使用して、AWS S3 互換サービスへのセキュアな（TLS）接続を設定するかどうか。

## Example\{#example}

```java
import com.google.gson.JsonObject;

import io.milvus.bulkwriter.RemoteBulkWriter;
import io.milvus.bulkwriter.RemoteBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.bulkwriter.common.clientenum.CloudStorage;
import io.milvus.bulkwriter.connect.S3ConnectParam;
import io.milvus.bulkwriter.connect.StorageConnectParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

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

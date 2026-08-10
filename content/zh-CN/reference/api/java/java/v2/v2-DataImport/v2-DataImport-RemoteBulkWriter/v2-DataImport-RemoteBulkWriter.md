---
title: "RemoteBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "RemoteBulkWriter 实例会将您的原始数据以 Milvus 可理解的格式写入兼容 AWS S3 的存储桶中。 | Java | v2"
type: docx
token: XAIndF6XWoQzvRxDvpLcgEE1nEb
sidebar_position: 5
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - zilliz
  - zilliz cloud
  - 云
  - RemoteBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

**RemoteBulkWriter** 实例会将您的原始数据以 Milvus 可理解的格式写入兼容 AWS S3 的存储桶中。

```java
io.milvus.bulkwriter.RemoteBulkWriter
```

## 构造函数\{#constructor}

使用一组参数（例如 **Schema**、**remote_path**、**connect_param,** 等）构造一个 **RemoteBulkWriter** 实例。

<Admonition type="info" icon="📘" title="Notes">

**RemoteBulkWriter** 对象旨在将您的原始数据重写为 Milvus 可理解的格式，并写入兼容 AWS S3 或 Microsoft Azure Blob Storage 的存储桶中。

</Admonition>

```java
public RemoteBulkWriter(RemoteBulkWriterParam bulkWriterParam)
```

**参数：**

- **bulkWriterParam** (*RemoteBulkWriterParam*) -

    一个 [RemoteBulkWriterParam](./v2-DataImport-RemoteBulkWriter#remotebulkwriterparam) 实例。

## RemoteBulkWriterParam\{#remotebulkwriterparam}

**RemoteBulkWriterParam** 允许您在一个地方为 **RemoteBulkWriter** 实例配置属性，以便实例化 **RemoteBulkWriter** 类。

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

**构建器方法：**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    目标 Collection 的 Schema，通过实例化 CreateCollectionReq.CollectionSchema 定义。

- `withConnectParam(StorageConnectParam connectParam)`

    用于连接远程存储桶的参数，通过实例化 [StorageConnectParam](./v2-DataImport-RemoteBulkWriter#storageconnectparam) 定义。

- `withRemotePath(String remotePath)`

    用于存放重写后数据的目录路径。

- `withChunkSize(long chunkSize)`

    文件 Segment 的最大大小。重写原始数据时，Milvus 会将其拆分为多个 Segment。

    该值默认为 **536,870,912** 字节，即 **512 MB**。

    <Admonition type="info" icon="📘" title="**How does BulkWriter segment my data?**">

    BulkWriter 将数据划分为 Segment 的方式会因目标文件类型而异。
    
    如果生成的文件超过指定的 Segment 大小，BulkWriter 会创建多个文件，并按顺序编号命名，每个文件均不超过该 Segment 大小。

    </Admonition>

- `withFileType(BulkFileType fileType)`

    输出文件的类型。可选值列在 [BulkFileType](./v2-DataImport-BulkFileType) 中。

- `withConfig(String key, Object val)`

    一个字典，用于指定处理 CSV 文件时的可选配置。仅当您在 `withFileType()` 中将 `fileType` 设置为 `CSV` 时，此参数才适用。该字典包含以下字段：

    - **sep** (*string*) -

        CSV 文件的分隔符。该值必须是长度为 1 的字符串，默认为 `","`。不允许使用以下字符串：`"\0"`、`"\n"`、`"\r"`、`"""`。

    - **nullkey** (*string*) -

        表示空值的特殊字符串。该值默认为空字符串：`""`。

## StorageConnectParam\{#storageconnectparam}

**StorageConnectParam** 由 **AzureConnectParam** 和 **S3ConnectParam** 实现。

### AzureConnectParam\{#azureconnectparam}

**AzureConnectParam** 用于准备连接 Microsoft Azure Blob Storage 容器的参数。

```java
AzureConnectParam.newBuilder()
    .withContainerName(String containerName)
    .withConnStr(String connStr)
    .withAccountUrl(String accountUrl)
    .withCredential(TokenCrendtial credential)
    .build()
```

**构建器方法：**

- `withContainerName(String containerName)`

    要连接的远程 Azure Blob Storage 容器名称。

- `withConnStr(String connStr)`

    Azure 存储账户的连接字符串，可解析为 account_url 和 credential。要生成连接字符串，请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。

- `withAccountUrl(String accountUrl)`

    格式如 `https://<storage-account>.blob.core.windows.net` 的字符串。更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview)。

- `withCredential(TokenCrendtial credential)`

    该账户的访问密钥。更多信息请参阅[此链接](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)。

### S3ConnectParam\{#s3connectparam}

S3ConnectParam 用于准备连接兼容 S3 的对象存储桶所需的参数

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

**构建器方法：**

- `withCloudName(String cloudName)`

    提供兼容 S3 对象存储服务的云服务提供商。可选值如下：

    - **MINIO** (MinIO)

    - **AWS** (AWS S3)

    - **GCP** (GCP Cloud Storage)

    - **ALI** (Alibaba Cloud OSS)

    - **TC** (Tencent Cloud COS)

- `withBucketName(String bucketName)`

    要连接的远程存储桶名称。

- `withEndpoint(String endpoint)`

    兼容 AWS S3 的服务 URL。

    该值可以是 MinIO 服务的 URL，也可以是任何兼容 AWS S3 的公共服务的 URL。

- `withAccessKey(String accessKey)`

    用于验证对指定存储桶访问权限的 access key（用户 ID）。

- `withSecretKey(String secretKey)`

    用于验证对指定存储桶访问权限的 secret_key（密码）。

- `withSessionToken(String sessionToken)`

    您在兼容 AWS S3 服务中的账户会话令牌。

- `withRegion(String region)`

    存储桶所在区域的名称或 ID。

- `withHttpClient(OkHttpClient httpClient)`

    是否使用 OkHttp 客户端与兼容 AWS S3 的服务建立安全的（TLS）连接。

## 示例\{#example}

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

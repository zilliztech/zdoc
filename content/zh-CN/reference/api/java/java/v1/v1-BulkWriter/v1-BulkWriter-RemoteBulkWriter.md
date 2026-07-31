---
title: "RemoteBulkWriter | Java | v1"
slug: /java/v1-BulkWriter-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: NEAR DEPRECATE
notebook: FALSE
description: "RemoteBulkWriter 实例会将您的原始数据以 Milvus 可理解的格式写入兼容 AWS-S3 的 bucket。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#M3CsdIL6WoKAgrxH0XhcjzaLndc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

`RemoteBulkWriter` 实例会将您的原始数据以 Milvus 可理解的格式写入兼容 AWS-S3 的 bucket。

```java
RemoteBulkWriter(RemoteBulkWriterParam bulkWriterParam)
```

`RemoteBulkWriter` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>appendRow(JsonObject rowData)</p></td>
        <td><p>向缓冲区追加一行数据。一旦缓冲区大小超过阈值，writer 就会将缓冲区持久化到数据文件中。</p></td>
        <td><p>rowData: 用于存储一行数据的 gson.JsonObject。<br/>对于每个字段：<br/>- 如果 dataType 是 Bool/Int8/Int16/Int32/Int64/Float/Double/Varchar，使用 JsonObject.addProperty(key, value) 输入；<br/>- 如果 dataType 是 FloatVector，使用 JsonObject.add(key, gson.toJsonTree(List[Float]) 输入；<br/>- 如果 dataType 是 BinaryVector/Float16Vector/BFloat16Vector，使用 JsonObject.add(key, gson.toJsonTree(byte[])) 输入；<br/>- 如果 dataType 是 SparseFloatVector，使用 JsonObject.add(key, gson.toJsonTree(SortedMap[Long, Float])) 输入；<br/>- 如果 dataType 是 Array，使用 JsonObject.add(key, gson.toJsonTree(List of Boolean/Integer/Short/Long/Float/Double/String)) 输入；<br/>- 如果 dataType 是 JSON，使用 JsonObject.add(key, JsonElement) 输入；</p></td>
    </tr>
    <tr>
        <td><p>commit(boolean async)</p></td>
        <td><p>强制持久化数据文件并完成 writer。</p></td>
        <td><p>async: 设为 true 以等待所有数据文件都完成持久化。</p></td>
    </tr>
    <tr>
        <td><p>getBatchFiles()</p></td>
        <td><p>返回已持久化数据文件的 List\<List\<String>gt;。每个 List\<String> 都是一批文件，可作为一个作业输入到 bulkinsert 接口中。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### RemoteBulkWriterParam\{#remotebulkwriterparam}

使用 `RemoteBulkWriterParam.Builder` 构造 `RemoteBulkWriterParam` 对象。

```java
import io.milvus.bulkwriter.RemoteBulkWriterParam;
RemoteBulkWriterParam.Builder builder = RemoteBulkWriterParam.newBuilder();
```

`RemoteBulkWriterParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionSchema(CollectionSchemaParam collectionSchema)</p></td>
        <td><p>设置集合 schema。请参见 Collection.createCollection() 一节中的 CollectionSchemaParam 说明。</p></td>
        <td><p>collectionSchema: 集合 schema</p></td>
    </tr>
    <tr>
        <td><p>withConnectParam(StorageConnectParam connectParam)</p></td>
        <td><p>设置不同远程存储服务的连接参数。目前提供两个选项：S3ConnectParam 和 AzureConnectParam。</p></td>
        <td><p>connectParam: 远程存储服务的连接参数。</p></td>
    </tr>
    <tr>
        <td><p>withRemotePath(String remotePath)</p></td>
        <td><p>设置在远程存储服务上上传数据文件的路径。</p></td>
        <td><p>remotePath: 远程存储服务上的路径。</p></td>
    </tr>
    <tr>
        <td><p>withChunkSize(int chunkSize)</p></td>
        <td><p>设置数据分块的最大大小。<br/>在重写原始数据时，该工具会将原始数据拆分为多个分块。<br/>默认值为 128 MB。</p></td>
        <td><p>chunkSize: 数据分块的最大大小。</p></td>
    </tr>
    <tr>
        <td><p>withFileType(BulkFileType fileType)</p></td>
        <td><p>输出文件的类型。目前仅支持 PARQUET。</p></td>
        <td><p>fileType: 输出文件类型。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 LocalBulkWriterParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### AzureConnectParam\{#azureconnectparam}

使用 `AzureConnectParam.Builder` 构造 `AzureConnectParam` 对象。

```java
import io.milvus.bulkwriter.connect.AzureConnectParam;
AzureConnectParam.Builder builder = AzureConnectParam.newBuilder();
```

`AzureConnectParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withContainerName(String containerName)</p></td>
        <td><p>设置 Azure container 名称。</p></td>
        <td><p>containerName: 目标 container 名称。</p></td>
    </tr>
    <tr>
        <td><p>withConnStr(String connStr)</p></td>
        <td><p>设置连接字符串。</p></td>
        <td><p>connStr: Azure Storage account 的连接字符串，可解析为 account_url 和 credential。要生成连接字符串，请参阅 <a href="https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string">Azure Storage connection string configuration</a>。</p></td>
    </tr>
    <tr>
        <td><p>withAccountUrl(String accountUrl)</p></td>
        <td><p>设置 account url。</p></td>
        <td><p>accountUrl: 格式如 https://\<storage-account>.blob.core.windows.net 的字符串。更多信息请参阅 <a href="https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview">Azure Storage account overview</a>。</p></td>
    </tr>
    <tr>
        <td><p>withCredential(TokenCredential credential)</p></td>
        <td><p>设置 credential。</p></td>
        <td><p>credential: 该 account 的访问密钥。更多信息请参阅 <a href="https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys">Azure Storage account access keys</a>。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 AzureConnectParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### S3ConnectParam\{#s3connectparam}

使用 `S3ConnectParam.Builder` 构造 `S3ConnectParam` 对象。

```java
import io.milvus.bulkwriter.connect.S3ConnectParam;
S3ConnectParam.Builder builder = S3ConnectParam.newBuilder();
```

`S3ConnectParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCloudName(String cloudName)</p></td>
        <td><p>设置 S3 的云名称。</p></td>
        <td><p>cloudName: 云名称。</p></td>
    </tr>
    <tr>
        <td><p>withBucketName(String bucketName)</p></td>
        <td><p>设置 bucket 名称。</p></td>
        <td><p>bucketName: bucket 名称。</p></td>
    </tr>
    <tr>
        <td><p>withEndpoint(String endpoint)</p></td>
        <td><p>设置 endpoint。</p></td>
        <td><p>endpoint: endpoint。</p></td>
    </tr>
    <tr>
        <td><p>withAccessKey(String accessKey)</p></td>
        <td><p>设置 access key。</p></td>
        <td><p>accessKey: access key。</p></td>
    </tr>
    <tr>
        <td><p>withSecretKey(String secretKey)</p></td>
        <td><p>设置 secret key。</p></td>
        <td><p>secretKey: secret key。</p></td>
    </tr>
    <tr>
        <td><p>withSessionToken(String sessionToken)</p></td>
        <td><p>设置 session token。</p></td>
        <td><p>sessionToken: session token。</p></td>
    </tr>
    <tr>
        <td><p>withRegion(String region)</p></td>
        <td><p>设置 region 名称。</p></td>
        <td><p>region: region 名称。</p></td>
    </tr>
    <tr>
        <td><p>withHttpClient(OkHttpClient httpClient)</p></td>
        <td><p>在必要时设置 http client。</p></td>
        <td><p>httpClient: http client。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造 S3ConnectParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.bulkwriter.*;
import io.milvus.bulkwriter.connect.StorageConnectParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.param.collection.CollectionSchemaParam;

CollectionSchemaParam collectionSchema = CollectionSchemaParam.newBuilder()
        .addFieldType(FieldType.newBuilder()
                .withName("id")
                .withDataType(DataType.Int64)
                .withPrimaryKey(true)
                .withAutoID(false)
                .build())
        .addFieldType(FieldType.newBuilder()
                .withName("vector")
                .withDataType(DataType.FloatVector)
                .withDimension(DIM)
                .build())
        .build();

StorageConnectParam connectParam = S3ConnectParam.newBuilder()
        .withEndpoint(STORAGE_ENDPOINT)
        .withCloudName(CLOUD_NAME)
        .withBucketName(STORAGE_BUCKET)
        .withAccessKey(STORAGE_ACCESS_KEY)
        .withSecretKey(STORAGE_SECRET_KEY)
        .withRegion(STORAGE_REGION)
        .build();
        
RemoteBulkWriterParam bulkWriterParam = RemoteBulkWriterParam.newBuilder()
        .withCollectionSchema(collectionSchema)
        .withRemotePath("bulk_data")
        .withFileType(BulkFileType.PARQUET)
        .withChunkSize(512 * 1024 * 1024)
        .withConnectParam(connectParam)
        .build();
        
try (RemoteBulkWriter remoteBulkWriter = RemoteBulkWriter(bulkWriterParam)) {
    Gson gson = new Gson();
    for (int i = 0; i < 10000; ++i) {
        JsonObject row = new JsonObject();
        row.addProperty("id", i);
        row.add("vector", gson.toJsonTree(CommonUtils.generateFloatVector(DIM)));

        remoteBulkWriter.appendRow(row);
    }
    System.out.printf("%s rows appends%n", remoteBulkWriter.getTotalRowCount());
    System.out.printf("%s rows in buffer not flushed%n", remoteBulkWriter.getBufferRowCount());
    System.out.println("Generate data files...");
    remoteBulkWriter.commit(false);

    List<List<String>> batchFiles = remoteBulkWriter.getBatchFiles();
    System.out.printf("Data files have been uploaded: %s%n", batchFiles);
    
    for (List<String> files : batchFiles) {
        R<ImportResponse> response = milvusClient.bulkInsert(BulkInsertParam.newBuilder()
            .withCollectionName(COLLECTION_NAME)
            .withFiles(files)
            .build());
    }
} catch (Exception e) {
    System.out.println("allTypesRemoteWriter catch exception: " + e);
    throw e;
}
```

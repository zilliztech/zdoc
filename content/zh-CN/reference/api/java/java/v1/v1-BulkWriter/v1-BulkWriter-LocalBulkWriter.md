---
title: "LocalBulkWriter | Java | v1"
slug: /java/v1-BulkWriter-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: NEAR DEPRECATE
notebook: FALSE
description: "LocalBulkWriter 实例会在本地将您的原始数据重写为 Milvus 可理解的格式。 | Java | v1"
type: origin
token: D0cfwvTqMiyhSrkCUv4c1a2Fnjd#H8hMd76S8oBYqoxCJ5Kcp7U5njc
sidebar_position: 1
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

`LocalBulkWriter` 实例会在本地将您的原始数据重写为 Milvus 可理解的格式。

```java
LocalBulkWriter(LocalBulkWriterParam bulkWriterParam)
```

`LocalBulkWriter` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>appendRow(JsonObject rowData)</p></td>
        <td><p>向缓冲区追加一行数据。一旦缓冲区大小超过阈值，写入器将把缓冲区持久化到数据文件中。</p></td>
        <td><p>rowData: 用于存储一行数据的 gson.JsonObject。<br/>对于每个字段：<br/>- 如果 dataType 为 Bool/Int8/Int16/Int32/Int64/Float/Double/Varchar，使用 JsonObject.addProperty(key, value) 输入；<br/>- 如果 dataType 为 FloatVector，使用 JsonObject.add(key, gson.toJsonTree(List[Float]) 输入；<br/>- 如果 dataType 为 BinaryVector/Float16Vector/BFloat16Vector，使用 JsonObject.add(key, gson.toJsonTree(byte[])) 输入；<br/>- 如果 dataType 为 SparseFloatVector，使用 JsonObject.add(key, gson.toJsonTree(SortedMap[Long, Float])) 输入；<br/>- 如果 dataType 为 Array，使用 JsonObject.add(key, gson.toJsonTree(List of Boolean/Integer/Short/Long/Float/Double/String)) 输入；<br/>- 如果 dataType 为 JSON，使用 JsonObject.add(key, JsonElement) 输入；</p></td>
    </tr>
    <tr>
        <td><p>commit(boolean async)</p></td>
        <td><p>强制持久化数据文件并完成写入器。</p></td>
        <td><p>async: 设置为 true 以等待所有数据文件都完成持久化。</p></td>
    </tr>
    <tr>
        <td><p>getBatchFiles()</p></td>
        <td><p>返回一个 List\<List\<String>gt;，其中包含已持久化的数据文件。每个 List\<String> 都是一批可作为作业输入到 bulkinsert 接口的文件。</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### LocalBulkWriterParam\{#localbulkwriterparam}

使用 `LocalBulkWriterParam.Builder` 构造 `LocalBulkWriterParam` 对象。

```java
import io.milvus.bulkwriter.LocalBulkWriterParam;
LocalBulkWriterParam.Builder builder = LocalBulkWriterParam.newBuilder();
```

`LocalBulkWriterParam.Builder` 的方法：

<table>
    <tr>
        <th><p>方法</p></th>
        <th><p>说明</p></th>
        <th><p>参数</p></th>
    </tr>
    <tr>
        <td><p>withCollectionSchema(CollectionSchemaParam collectionSchema)</p></td>
        <td><p>设置集合 schema。请参见 Collection.createCollection() 小节中的 CollectionSchemaParam 说明。</p></td>
        <td><p>collectionSchema: collection schema</p></td>
    </tr>
    <tr>
        <td><p>withLocalPath(tring localPath)</p></td>
        <td><p>设置输出数据文件的本地路径。</p></td>
        <td><p>localPath: 本地路径。</p></td>
    </tr>
    <tr>
        <td><p>withChunkSize(int chunkSize)</p></td>
        <td><p>设置数据分块的最大大小。<br/>在重写原始数据时，此工具会将原始数据拆分为多个分块。<br/>默认值为 128 MB。</p></td>
        <td><p>chunkSize: 数据分块的最大大小。</p></td>
    </tr>
    <tr>
        <td><p>withFileType(BulkFileType fileType)</p></td>
        <td><p>输出文件的类型。目前仅支持 PARQUET。</p></td>
        <td><p>fileType: 输出文件类型。</p></td>
    </tr>
    <tr>
        <td><p>build()</p></td>
        <td><p>构造一个 LocalBulkWriterParam 对象</p></td>
        <td><p>N/A</p></td>
    </tr>
</table>

#### 示例\{#example}

```java
import io.milvus.bulkwriter.*;
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
        
LocalBulkWriterParam bulkWriterParam = LocalBulkWriterParam.newBuilder()
        .withCollectionSchema(collectionSchema)
        .withLocalPath("/tmp/bulk_writer")
        .withFileType(fileType)
        .withChunkSize(512 * 1024 * 1024)
        .build();

try (LocalBulkWriter localBulkWriter = new LocalBulkWriter(bulkWriterParam)) {
    Gson gson = new Gson();
    for (int i = 0; i < 100000; i++) {
        JsonObject row = new JsonObject();
        row.addProperty("id", i);
        row.add("vector", gson.toJsonTree(GeneratorUtils.genFloatVector(DIM)));

        localBulkWriter.appendRow(row);
    }

    localBulkWriter.commit(false);
    List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
    System.out.printf("Local writer done! output local files: %s%n", batchFiles);
} catch (Exception e) {
    System.out.println("Local writer catch exception: " + e);
    throw e;
}
```

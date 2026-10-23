---
title: "LocalBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LocalBulkWriter 实例会在本地将您的原始数据重写为 Milvus 可识别的格式。 | Java | v2"
type: docx
token: N9dldTSNMopDzfxXCTmcKSGynvd
sidebar_position: 5
keywords: 
  - 什么是向量 Database
  - vectordb
  - 多模态向量 Database 检索
  - 检索增强生成
  - Zilliz
  - Zilliz Cloud
  - cloud
  - LocalBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

LocalBulkWriter 实例会在本地将您的原始数据重写为 Milvus 可识别的格式。

```java
io.milvus.bulkwriter.LocalBulkWriter
```

## 构造函数\{#constructor}

基于 Schema、输出路径、Segment 大小和文件类型构造 LocalBulkWriter 实例。

LocalBulkWriter 对象会在本地将您的原始数据重写为 Milvus 可识别的格式。

```java
LocalBulkWriter(LocalBulkWriterParam bulkWriterParam)
```

**参数：**

- **bulkWriterParam** (*LocalBulkWriterParam*) -

    一个 LocalBulkWriterParam 实例。

## LocalBulkWriterParam\{#localbulkwriterparam}

**LocalBulkWriterParam** 允许您在一处为 **LocalBulkWriter** 实例配置属性，以便实例化 **LocalBulkWriter** 类。

```java
LocalBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .build()
```

**构建器方法：**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    通过实例化 **CreateCollectionReq.CollectionSchema** 所定义的目标 Collection 的 Schema。

- `withLocalPath(String localPath)`

    用于存放重写后数据的目录路径。

- `withChunkSize(long chunkSize)`

    文件 Segment 的最大大小。在重写您的原始数据时，Milvus 会将其拆分为多个 Segment。

    该值默认为 536,870,912 字节，即 512 MB。

    BulkWriter 将数据划分为 Segment 的方式因目标文件类型而异。如果生成的文件超过指定的 Segment 大小，BulkWriter 会创建多个文件，并按顺序编号命名，每个文件都不大于该 Segment 大小。

- `withFileType(BulkFileType fileType)`

    输出文件的类型。可选项列在 BulkFileType 中。

- `withConfig(String key, Object val)`

    一个字典，用于指定处理 CSV 文件时的可选配置。仅当您在 `withFileType()` 中将 `fileType` 设置为 `CSV` 时，此参数才适用。该字典包含以下字段：

    - **sep** (*string*) -

        CSV 文件的分隔符。该值必须是长度为 1 的字符串，默认值为 ","。不允许使用以下字符串："\0"、"\n"、"\r"、"""。

    - **nullkey** (*string*) -

        表示 null 值的特殊字符串。该值默认为空字符串：""。

## 示例\{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.LocalBulkWriter;
import io.milvus.bulkwriter.LocalBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.List;

private static void localWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws Exception {
    LocalBulkWriterParam bulkWriterParam = LocalBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withLocalPath("/tmp/bulk_writer")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(128 * 1024 * 1024)
            .build();

    try (LocalBulkWriter localBulkWriter = new LocalBulkWriter(bulkWriterParam)) {
        // append rows
        Gson GSON_INSTANCE = new Gson();
        for (int i = 0; i < 10000; i++) {
            JsonObject row = new JsonObject();
            row.addProperty("path", "path_" + i);
            row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
            row.addProperty("label", "label_" + i);

            localBulkWriter.appendRow(row);
        }

        localBulkWriter.commit(false);
        List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
        System.out.printf("Local writer done! output local files: %s%n", batchFiles);
    } catch (Exception e) {
        System.out.println("Local writer catch exception: " + e);
        throw e;
    }
}
```

---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter 实例会将原始数据重写到 Zilliz Cloud Volume，并采用 Milvus 可理解的格式。 | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

**VolumeBulkWriter** 实例会将原始数据重写到 Zilliz Cloud Volume，并采用 Milvus 可理解的格式。

```java
io.milvus.bulkwriter.VolumeBulkWriter
```

## Constructor\{#constructor}

通过 schema、输出路径、分段大小和文件类型构造一个 **VolumeBulkWriter** 实例。

<Admonition type="info" icon="📘" title="Notes">

**VolumeBulkWriter** 对象旨在将原始数据重写到 Zilliz Cloud Volume，并采用 Milvus 可理解的格式。

</Admonition>

```java
VolumeBulkWriter(VolumeBulkWriterParam bulkWriterParam)
```

**参数：**

- **bulkWriterParam** (*VolumeBulkWriterParam*) -

    一个 [VolumeBulkWriterParam](./v2-DataImport-VolumeBulkWriter#volumebulkwriterparam) 实例。

## VolumeBulkWriterParam\{#volumebulkwriterparam}

**VolumeBulkWriterParam** 允许你在一个地方为 **VolumeBulkWriter** 实例配置属性，以便实例化 **VolumeBulkWriter** 类。

```java
VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .withCloudEndpoint(string cloudEndpoint)
    .withApiKey(string apiKey)
    .withVolumeName(string volumeName)
    .build()
```

**构建器方法：**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    目标集合的 schema，通过实例化 **CreateCollectionReq.CollectionSchema** 定义。

- `withLocalPath(String localPath)`

    用于存放重写后数据的目录路径。

- `withChunkSize(long chunkSize)`

    文件分段的最大大小。重写原始数据时，Milvus 会将其拆分为多个分段。

    默认值为 **536,870,912** 字节，即 **512 MB**。

    <Admonition type="info" icon="📘" title="**BulkWriter 如何对数据分段？**">

    BulkWriter 对数据进行分段的方式会因目标文件类型而异。
    
    如果生成的文件超过指定的分段大小，BulkWriter 会创建多个文件，并按顺序编号命名，每个文件都不会大于分段大小。

    </Admonition>

- `withFileType(BulkFileType fileType)`

    输出文件的类型。可选项列在 [BulkFileType](./v2-DataImport-BulkFileType) 中。

- `withConfig(String key, Object val)`

    一个字典，用于指定处理 CSV 文件的可选配置。仅当你在 `withFileType()` 中将 `fileType` 设置为 `CSV` 时，此参数才适用。该字典包含以下字段：

    - **sep** (*string*) -

        CSV 文件的分隔符。该值必须是长度为 1 的字符串，默认值为 `","`。不允许使用以下字符串：`"\0"`, `"\n"`, `"\r"`, `"""`。

    - **nullkey** (*string*) -

        表示 null 值的特殊字符串。默认值为空字符串：`""`。

- `withCloudEndpoint(string cloudEndpoint)`

    Zilliz Cloud 公共端点始终为 `https:*//*api.cloud.zilliz.com`。

- `withApiKey(string apiKey)`

    有效的 Zilliz Cloud API key，并且具有执行此操作相关资源所需的足够权限。

- `withVolumeName(string volumeName)`

    有效的 volume 名称。请确保指定名称的 volume 已存在。

## 示例\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.VolumeBulkWriter;
import io.milvus.bulkwriter.VolumeBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

private static void volumeWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws Exception {
    VolumeBulkWriterParam bulkWriterParam = VolumeBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withRemotePath("/tmp/bulk_writer")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(128 * 1024 * 1024)
            .withCloudEndpoint("https://api.cloud.zilliz.com")
            .withApiKey("YOUR_API_KEY")
            .withVolumeName("my_volume")
            .build();

    try (VolumeBulkWriter volumeBulkWriter = new VolumeBulkWriter(bulkWriterParam)) {
        // append rows
        Gson GSON_INSTANCE = new Gson();
        for (int i = 0; i < 10000; i++) {
            JsonObject row = new JsonObject();
            row.addProperty("path", "path_" + i);
            row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
            row.addProperty("label", "label_" + i);

            volumeBulkWriter.appendRow(row);
        }

        volumeBulkWriter.commit(false);
        UploadFilesResult uploadResult = volumeBulkWriter.getVolumeUploadResult();
        System.out.printf("Data files have been uploaded: %s%n", uploadResult);
    } catch (Exception e) {
        System.out.println("Local writer catch exception: " + e);
        throw e;
    }
}
```


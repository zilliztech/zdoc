---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "配置 VolumeBulkWriter，包括其集合模式、输出路径和 Volume 连接。 | Java | v2"
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

配置 VolumeBulkWriter，包括其集合模式、输出路径和 Volume 连接。

```java
public class VolumeBulkWriter
```

<Admonition type="info" icon="📘" title="说明">

**VolumeBulkWriter** 对象用于将原始数据重写到 Zilliz Cloud Volume 中，并转换为 Milvus 可识别的格式。

</Admonition>

**构建器方法：**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    目标集合的模式，使用 `CollectionSchemaParam` 定义。构建器会在内部将其转换为 v2 集合模式。

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    目标集合的模式，使用 [`CreateCollectionReq.CollectionSchema`](./v2-Collections-CollectionSchema) 定义。

- `withRemotePath(String remotePath)`

    在目标 Volume 中用于存储重写后数据文件的路径。

- `withChunkSize(long chunkSize)`

    每个生成文件分片的最大大小，单位为字节。默认值为 **134,217,728** 字节（**128 MB**）。

- `withFileType(BulkFileType fileType)`

    输出文件格式。可用值请参见 [`BulkFileType`](./v2-DataImport-BulkFileType)。

- `withConfig(String key, Object value)`

    用于输出文件处理的可选键值配置。对于 `CSV` 输出，可使用 `sep` 设置分隔符，使用 `nullkey` 设置表示 null 值的字符串。

- `withCloudEndpoint(String cloudEndpoint)`

    Zilliz Cloud 公共 API 端点。请将此值设置为 `https://api.cloud.zilliz.com`。

- `withApiKey(String apiKey)`

    用于对请求进行身份验证的 Zilliz Cloud API key。

- `withVolumeName(String volumeName)`

    目标 Zilliz Cloud Volume 的名称。

- `withConnectType(ConnectType connectType)`

    用于访问 Volume 的连接策略。默认值为 `ConnectType.AUTO`。

## 示例\{#example}

配置 VolumeBulkWriter，包括其集合模式、输出路径和 Volume 连接。

```java
VolumeBulkWriterParam params = VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(collectionSchema)
    .withRemotePath("imports/books")
    .withCloudEndpoint(CLOUD_ENDPOINT)
    .withApiKey(API_KEY)
    .withVolumeName("bulk-data")
    .build();
VolumeBulkWriter writer = new VolumeBulkWriter(params);
```

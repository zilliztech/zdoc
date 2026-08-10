---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "配置 VolumeBulkWriter，包括其 Collection Schema、输出路径和 volume 连接。 | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

配置 VolumeBulkWriter，包括其 Collection Schema、输出路径和 volume 连接。

```java
public class VolumeBulkWriter
```

<Admonition type="info" icon="📘" title="Notes">

**VolumeBulkWriter** 对象旨在将您的原始数据重写到 Zilliz Cloud Volume 中，采用 Milvus 可理解的格式。

</Admonition>

**构建器方法：**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    目标 Collection 的 Schema，使用 `CollectionSchemaParam` 定义。构建器会在内部将其转换为 v2 Collection Schema。

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    目标 Collection 的 Schema，使用 [`CreateCollectionReq.CollectionSchema`](./v2-Collections-CollectionSchema) 定义。

- `withRemotePath(String remotePath)`

    目标 volume 中用于存储重写后数据文件的路径。

- `withChunkSize(long chunkSize)`

    每个生成文件 Segment 的最大大小，单位为字节。默认值为 **134,217,728** 字节（**128 MB**）。

- `withFileType(BulkFileType fileType)`

    输出文件格式。可用值请参见 [`BulkFileType`](./v2-DataImport-BulkFileType)。

- `withConfig(String key, Object value)`

    用于输出文件处理的可选键值配置。对于 `CSV` 输出，使用 `sep` 设置分隔符，使用 `nullkey` 设置表示 null 值的字符串。

- `withCloudEndpoint(String cloudEndpoint)`

    Zilliz Cloud 公共 API Endpoint。请将此值设置为 `https://api.cloud.zilliz.com`。

- `withApiKey(String apiKey)`

    用于对请求进行身份验证的 Zilliz Cloud API 密钥。

- `withVolumeName(String volumeName)`

    目标 Zilliz Cloud volume 的名称。

- `withConnectType(ConnectType connectType)`

    用于访问该 volume 的连接策略。默认值为 `ConnectType.AUTO`。

## 示例\{#example}

配置 VolumeBulkWriter，包括其 Collection Schema、输出路径和 volume 连接。

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

---
title: "pinSnapshotData() | Java | v2"
slug: /java/java/v2-Snapshots-pinSnapshotData
sidebar_label: "pinSnapshotData()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在有限时间内固定快照数据，以便在复制或检查期间不会被垃圾回收。 | Java | v2"
type: docx
token: BBYgdwIV5onkWxxowAhcCl5rnzc
sidebar_position: 7
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - pinSnapshotData()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# pinSnapshotData()

此操作会在有限时间内固定快照数据，以便在复制或检查期间不会被垃圾回收。

```java
public PinSnapshotDataResp pinSnapshotData(PinSnapshotDataReq request)
```

## 请求语法\{#request-syntax}

```java
pinSnapshotData(PinSnapshotDataReq.builder()
    .snapshotName(String snapshotName)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .ttlSeconds(Long ttlSeconds)
    .build()
)
```

**构建器方法：**

- `snapshotName(String snapshotName)`

    快照的名称。

- `databaseName(String databaseName)`

    包含该集合的数据库名称。如果省略，则使用当前数据库。

- `collectionName(String collectionName)`

    与快照操作关联的集合名称。

- `ttlSeconds(Long ttlSeconds)`

    快照数据固定的存活时间（以秒为单位）。使用 `0L` 将采用服务器默认行为。

**返回：**

*PinSnapshotDataResp*

包含已固定快照数据的 pin ID 的响应。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.PinSnapshotDataReq;
import io.milvus.v2.service.snapshot.response.PinSnapshotDataResp;

PinSnapshotDataReq request = PinSnapshotDataReq.builder()
    .snapshotName("book_chunks_backup")
    .databaseName("default")
    .collectionName("book_chunks")
    .ttlSeconds(3600L)
    .build();

PinSnapshotDataResp response = client.pinSnapshotData(request);
```

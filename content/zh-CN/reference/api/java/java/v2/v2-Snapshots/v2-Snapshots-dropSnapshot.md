---
title: "dropSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从集合中永久删除一个快照。 | Java | v2"
type: docx
token: EeWldhw4AoT5WqxO8GgcSfjEnpb
sidebar_position: 3
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - dropSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropSnapshot()

此操作会从集合中永久删除一个快照。

```java
public void dropSnapshot(DropSnapshotReq request)
```

## 请求语法\{#request-syntax}

```java
dropSnapshot(DropSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    包含该集合的数据库名称。如果省略，则使用当前数据库。

- `collectionName(String collectionName)`

    与快照操作关联的集合名称。

- `snapshotName(String snapshotName)`

    快照的名称。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或者服务器为此操作返回错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.DropSnapshotReq;

DropSnapshotReq request = DropSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

client.dropSnapshot(request);
```

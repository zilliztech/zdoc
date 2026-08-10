---
title: "dropSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-dropSnapshot
sidebar_label: "dropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Collection 中永久删除快照。 | Java | v2"
type: docx
token: EeWldhw4AoT5WqxO8GgcSfjEnpb
sidebar_position: 3
keywords: 
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus 对比
  - zilliz
  - zilliz cloud
  - 云
  - dropSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropSnapshot()

此操作会从 Collection 中永久删除快照。

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

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database 名称。如省略，则使用当前 Database。

- `collectionName(String collectionName)`

    与该快照操作关联的 Collection 名称。

- `snapshotName(String snapshotName)`

    快照名称。

**返回：**

*void*

**异常：**

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

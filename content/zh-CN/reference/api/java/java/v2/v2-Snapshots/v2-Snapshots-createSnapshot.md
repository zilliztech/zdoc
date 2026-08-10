---
title: "createSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为 Collection 创建快照。 | Java | v2"
type: docx
token: JhCEdppKrowJIqxFusBc2TXsnSg
sidebar_position: 1
keywords: 
  - hnsw 算法
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - zilliz
  - zilliz cloud
  - 云
  - createSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createSnapshot()

此操作为 Collection 创建快照。

```java
public void createSnapshot(CreateSnapshotReq request)
```

## 请求语法\{#request-syntax}

```java
createSnapshot(CreateSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .description(String description)
    .compactionProtectionSeconds(Long compactionProtectionSeconds)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database 名称。如果省略，则使用当前 Database。

- `collectionName(String collectionName)`

    与该快照操作关联的 Collection 名称。

- `snapshotName(String snapshotName)`

    快照名称。

- `description(String description)`

    快照的人类可读描述。

- `compactionProtectionSeconds(Long compactionProtectionSeconds)`

    用于保护快照免受 Compaction 影响的秒数。当不需要保护窗口时，使用 `0L`。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围或服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.CreateSnapshotReq;

CreateSnapshotReq request = CreateSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .description("Backup before schema migration")
    .compactionProtectionSeconds(3600L)
    .build();

client.createSnapshot(request);
```

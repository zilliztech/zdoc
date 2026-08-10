---
title: "describeSnapshot() | Java | v2"
slug: /java/java/v2-Snapshots-describeSnapshot
sidebar_label: "describeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作获取快照的详细元数据。 | Java | v2"
type: docx
token: CJEzd0riyoJkcUxdYvjcKPoWn3c
sidebar_position: 2
keywords: 
  - 相似性搜索
  - multimodal RAG
  - LLM 幻觉
  - 混合搜索
  - zilliz
  - zilliz cloud
  - cloud
  - describeSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeSnapshot()

此操作获取快照的详细元数据。

```java
public DescribeSnapshotResp describeSnapshot(DescribeSnapshotReq request)
```

## 请求语法\{#request-syntax}

```java
describeSnapshot(DescribeSnapshotReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .snapshotName(String snapshotName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database 名称。如果省略，则使用当前 Database。

- `collectionName(String collectionName)`

    与快照操作关联的 Collection 名称。

- `snapshotName(String snapshotName)`

    快照名称。

**返回：**

*DescribeSnapshotResp*

返回包含快照元数据的响应，包括快照名称、描述、Collection 名称、Partition 名称、创建时间戳和存储位置。

**异常：**

- **MilvusClientException**

    当必需参数缺失、数值参数超出范围，或者服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.DescribeSnapshotReq;
import io.milvus.v2.service.snapshot.response.DescribeSnapshotResp;

DescribeSnapshotReq request = DescribeSnapshotReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .snapshotName("book_chunks_backup")
    .build();

DescribeSnapshotResp response = client.describeSnapshot(request);
```

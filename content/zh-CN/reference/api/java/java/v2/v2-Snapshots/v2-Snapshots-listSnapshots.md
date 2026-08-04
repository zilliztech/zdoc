---
title: "listSnapshots() | Java | v2"
slug: /java/java/v2-Snapshots-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出快照，可选择限定到某个数据库和集合。 | Java | v2"
type: docx
token: ZhiOdVH0uoMI0axpcYMcfhQXnkf
sidebar_position: 6
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listSnapshots()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listSnapshots()

此操作列出快照，可选择限定到某个数据库和集合。

```java
public ListSnapshotsResp listSnapshots(ListSnapshotsReq request)
```

## 请求语法\{#request-syntax}

```java
listSnapshots(ListSnapshotsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该集合的数据库名称。如果省略，则使用当前数据库。

- `collectionName(String collectionName)`

    与快照操作关联的集合名称。

**返回：**

*ListSnapshotsResp*

包含与请求筛选条件匹配的快照名称的响应。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListSnapshotsReq;
import io.milvus.v2.service.snapshot.response.ListSnapshotsResp;

ListSnapshotsReq request = ListSnapshotsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListSnapshotsResp response = client.listSnapshots(request);
```

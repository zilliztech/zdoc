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
  - 相似度搜索
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - describeSnapshot()
  - javaV230
displayed_sidebar: javaSidebar

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

    快照的名称。

**返回类型：**

*DescribeSnapshotResp*

**返回：**

包含快照元数据的响应，包括快照名称、描述、Collection 名称、Partition 名称、创建时间戳和存储位置。

**参数：**

- **name**（String） -

    快照的名称。

- **description**（String） -

    快照的描述。

- **collectionName**（String） -

    该快照创建时所基于的 Collection 名称。

- **partitionNames**（List&lt;String&gt;） -

    快照中包含的 Partition 名称。

- **createTs**（Long） -

    快照的创建时间戳。

- **s3Location**（String） -

    存储快照数据的 S3 位置。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围，或者服务器针对此操作返回错误时，会引发此异常。

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

---
title: "listRestoreSnapshotJobs() | Java | v2"
slug: /java/java/v2-Snapshots-listRestoreSnapshotJobs
sidebar_label: "listRestoreSnapshotJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出恢复快照作业，可选择将范围限定为特定 Database 和 Collection。 | Java | v2"
type: docx
token: I98vddTeco48kYxHEkOccG9ynYe
sidebar_position: 5
keywords: 
  - llm 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - listRestoreSnapshotJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRestoreSnapshotJobs()

此操作列出恢复快照作业，可选择将范围限定为特定 Database 和 Collection。

```java
public ListRestoreSnapshotJobsResp listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq request)
```

## 请求语法\{#request-syntax}

```java
listRestoreSnapshotJobs(ListRestoreSnapshotJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    包含该 Collection 的 Database 名称。如果省略，则使用当前 Database。

- `collectionName(String collectionName)`

    与快照操作关联的 Collection 名称。

**返回：**

*ListRestoreSnapshotJobsResp*

包含与请求筛选条件匹配的恢复快照作业的响应。

**异常：**

- **MilvusClientException**

    当缺少必需参数、数值参数超出范围或服务器为此操作返回错误时，会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.snapshot.request.ListRestoreSnapshotJobsReq;
import io.milvus.v2.service.snapshot.response.ListRestoreSnapshotJobsResp;

ListRestoreSnapshotJobsReq request = ListRestoreSnapshotJobsReq.builder()
    .databaseName("default")
    .collectionName("book_chunks")
    .build();

ListRestoreSnapshotJobsResp response = client.listRestoreSnapshotJobs(request);
```

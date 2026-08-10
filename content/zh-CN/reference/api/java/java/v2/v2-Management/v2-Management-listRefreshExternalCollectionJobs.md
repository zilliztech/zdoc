---
title: "listRefreshExternalCollectionJobs() | Java | v2"
slug: /java/java/v2-Management-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有外部 Collection 刷新作业，并可按 Collection 名称进行筛选。 | Java | v2"
type: docx
token: P9MFdEHMKoAfshxQhamcWrGknWg
sidebar_position: 30
keywords: 
  - 检索增强生成
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - zilliz
  - zilliz cloud
  - 云
  - listRefreshExternalCollectionJobs()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listRefreshExternalCollectionJobs()

此操作列出所有外部 Collection 刷新作业，并可按 Collection 名称进行筛选。

```java
public ListRefreshExternalCollectionJobsResp listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq request)
```

## 请求语法\{#request-syntax}

```java
listRefreshExternalCollectionJobs(ListRefreshExternalCollectionJobsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionName(String collectionName)` -

    用于筛选的 Collection 名称。如果为空，则返回该 Database 中所有 Collection 的作业。

**返回：**

*ListRefreshExternalCollectionJobsResp*

响应封装了可通过 `getJobs()` 访问的 `List<RefreshExternalCollectionJobInfo>`。每个作业信息条目公开 `jobId`、`collectionName`、`state`、`progress`、`reason`、`externalSource`、`startTime` 和 `endTime`，其结构与 `getRefreshExternalCollectionProgress()` 返回的条目相同。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.utility.request.ListRefreshExternalCollectionJobsReq;
import io.milvus.v2.service.utility.response.ListRefreshExternalCollectionJobsResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;

ListRefreshExternalCollectionJobsResp resp = client.listRefreshExternalCollectionJobs(
    ListRefreshExternalCollectionJobsReq.builder()
        .collectionName("my_collection")
        .build()
);
for (RefreshExternalCollectionJobInfo job : resp.getJobs()) {
    System.out.println(job.getJobId() + " " + job.getState());
}
```

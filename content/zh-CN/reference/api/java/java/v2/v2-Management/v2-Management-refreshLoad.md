---
title: "refreshLoad() | Java | v2"
slug: /java/java/v2-Management-refreshLoad
sidebar_label: "refreshLoad()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "当 bulkImport 请求生成新的 Segment 时，此操作主要用于强制将新的 Segment 加载到内存中。 | Java | v2"
type: docx
token: TCw7d7brCovAUpxA5D8cjOIGn1b
sidebar_position: 15
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - refreshLoad()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# refreshLoad()

当 bulkImport 请求生成新的 Segment 时，此操作主要用于强制将新的 Segment 加载到内存中。 

```java
public void refreshLoad(RefreshLoadReq request)
```

## 请求语法\{#request-syntax}

```java
refreshLoad(RefreshLoadReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .async(Boolean async)
    .sync(Boolean sync)
    .timeout(Long timeout)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认使用当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `async(Boolean async)` -

    是否异步运行该操作。默认为 `Boolean.TRUE`。

- `sync(Boolean sync)` -

    是否同步等待，直到操作完成。默认为 `Boolean.TRUE`。

- `timeout(Long timeout)` -

    超时时长（以毫秒为单位）。默认为 `60000L`。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.RefreshLoadReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Refresh the load status of the collection `test`
RefreshLoadReq refreshLoadReq = RefreshLoadReq.builder()
        .collectionName("test")
        .build();
client.refreshLoad(refreshLoadReq);
```

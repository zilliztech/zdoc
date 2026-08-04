---
title: "flush() | Java | v2"
slug: /java/java/v2-Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将流式数据刷新到磁盘并封存当前 segment。 | Java | v2"
type: docx
token: N4R0dHR6MoiW2Rx9ClGc9MSlnOe
sidebar_position: 7
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# flush()

此操作会将流式数据刷新到磁盘并封存当前 segment。

```java
public void flush(FlushReq request)
```

## 请求语法\{#request-syntax}

```java
flush(FlushReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    数据库名称。若未指定，则默认使用当前数据库。

- `collectionNames(List<String> collectionNames)` -

    collection 名称列表。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)` -

    等待 flush 完成的超时时间，单位为毫秒。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Compact a collection
client.flush(FlushReq.builder()
    .collectionNames(Collections.singletonList("my_collection"))
    .build();
);
```

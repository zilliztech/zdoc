---
title: "flush() | Java | v2"
slug: /java/java/v2-Management-flush
sidebar_label: "flush()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将流式数据刷新到磁盘，并封存当前 Segment。 | Java | v2"
type: docx
token: SfTCdUemEoNBDbxvn7PcHguFnPn
sidebar_position: 7
keywords: 
  - ANNS
  - 向量搜索
  - kNN 算法
  - HNSW
  - Zilliz
  - Zilliz Cloud
  - 云
  - flush()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# flush()

此操作会将流式数据刷新到磁盘，并封存当前 Segment。

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

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionNames(List<String> collectionNames)` -

    Collection 名称列表。

- `waitFlushedTimeoutMs(Long waitFlushedTimeoutMs)` -

    等待 flush 完成的超时时间，单位为毫秒。

**异常：**

- **MilvusClientException**

    如果此操作过程中发生任何错误，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.FlushReq;
import java.util.Collections;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Flush a collection
client.flush(FlushReq.builder()
    .collectionNames(Collections.singletonList("my_collection"))
    .build());
```

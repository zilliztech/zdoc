---
title: "getFlushAllState() | Java | v2"
slug: /java/java/v2-Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查先前的全量 flush 操作是否已完成。当你以异步方式调用 `flushAll` 并需要轮询完成状态时，可使用此操作。 | Java | v2"
type: docx
token: U55Vd0IR9oz8m9xS76scr4KDnNh
sidebar_position: 24
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getFlushAllState()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFlushAllState()

此操作用于检查先前的全量 flush 操作是否已完成。当你以异步方式调用 `flushAll` 并需要轮询完成状态时，可使用此操作。

```java
public GetFlushAllStateResp getFlushAllState(GetFlushAllStateReq request)
```

## 请求语法\{#request-syntax}

```java
getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName(String databaseName)
    .flushAllTs(Long flushAllTs)
    .build());
```

**构建器方法：**

- `databaseName(String databaseName)`

    调用 `flushAll` 时所使用的数据库。

- `flushAllTs(Long flushAllTs)`

    `flushAll` 返回的全量 flush 时间戳。

**返回：**

*GetFlushAllStateResp*

**异常：**

- **MilvusClientException**

    当校验失败或服务器针对该操作返回错误时，将引发此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

FlushAllResp flush = client.flushAll(FlushAllReq.builder()
    .databaseName("default")
    .build());
GetFlushAllStateResp state = client.getFlushAllState(GetFlushAllStateReq.builder()
    .databaseName("default")
    .flushAllTs(flush.getFlushAllTs())
    .build());
System.out.println(state.getFlushed());
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}

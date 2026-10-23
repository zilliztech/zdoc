---
title: "WaitForDropCollection() | Java | v2"
slug: /java/java/v2-Collections-WaitForDropCollection
sidebar_label: "WaitForDropCollection()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "此操作会阻塞进程，直到 Collection 被删除。您可以使用此方法封装删除 Collection 的请求，确保删除完全完成后，再继续执行后续操作。 | Java | v2"
type: docx
token: K9E6dtYlJojtOCxTG0EcGBVnnKe
sidebar_position: 20
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - WaitForDropCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# WaitForDropCollection()

此操作会阻塞进程，直到 Collection 被删除。您可以使用此方法封装删除 Collection 的请求，确保删除完全完成后，再继续执行后续操作。

```java
private void WaitForDropCollection(DropCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
WaitForDropCollection(DropCollectionReq.builder()
    .collectionName(String collectionName)
    .async(Boolean async)
    .timeout(Long timeout)
    .build()
)
```

**构建器方法：**

- `collectionName(String collectionName)`

    Collection 的名称。

- `async(Boolean async)`

    此操作是否为异步操作。

    该值默认为 `Boolean.True`，表示立即返回，同时该过程可能仍在后台运行。

- `timeout(Long timeout)`

    进程的超时时长。指定时长到期后，进程将终止。

    该值默认为 `60000L`，表示超时时长为一分钟。

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
// drop a collection: test
DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("test")
        .build();
client.dropCollection(dropCollectionReq);
client.WaitForDropCollection(dropCollectionReq);
```

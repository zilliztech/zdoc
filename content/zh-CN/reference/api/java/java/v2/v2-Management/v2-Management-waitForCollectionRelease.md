---
title: "waitForCollectionRelease() | Java | v2"
slug: /java/java/v2-Management-waitForCollectionRelease
sidebar_label: "waitForCollectionRelease()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "此操作会暂停进程，直到 Collection 释放完成。您可以使用此方法封装释放 Collection 的请求，确保在继续执行后续操作之前，释放已完全完成。 | Java | v2"
type: docx
token: HRicdDwU4oUDWEx6DrlcARGrn1c
sidebar_position: 17
keywords: 
  - 信息检索
  - 降维
  - HNSW 算法
  - 向量相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - waitForCollectionRelease()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# waitForCollectionRelease()

此操作会暂停进程，直到 Collection 释放完成。您可以使用此方法封装释放 Collection 的请求，确保在继续执行后续操作之前，释放已完全完成。

```java
public void waitForCollectionRelease(ReleaseCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
waitForCollectionRelease(ReleaseCollectionReq.builder()
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

    此操作是否异步。

    该值默认为 `Boolean.True`，表示立即返回，而进程可能仍在后台运行。

- `timeout(Long timeout)`

    进程的超时时长。指定的时长到期后，进程将终止。

    该值默认为 `60000L`，表示超时时长为 1 分钟。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
// release collection "test"
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
        .collectionName("test")
        .build();
        
client.releaseCollection(releaseCollectionReq);
client.waitForCollectionRelease(releaseCollectionReq);
```

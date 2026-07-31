---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会从集合中删除一个现有函数。 | Java | v2"
type: docx
token: A6dgdXJdRoxwKAxGB1hctKXvnZg
sidebar_position: 33
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

此操作会从集合中删除一个现有函数。

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## 请求语法\{#request-syntax}

```java
dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .functionName(String functionName)
    .build()
);
```

**构建器方法：**

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    集合的名称。

- `databaseName(String databaseName)` -

    数据库名称。若未指定，则默认使用当前数据库。

- `functionName(String functionName)` -

    **[REQUIRED]**

    要删除的函数名称。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.service.collection.request.DropCollectionFunctionReq;

client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("my_collection")
    .functionName("bm25")
    .build());
```

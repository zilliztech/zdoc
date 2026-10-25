---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作除返回 Entity 数量外，还会返回完整的 Collection 统计信息映射。 | Java | v2"
type: docx
token: RSNDdgCQ2oRIMWxeVafcNf8LnAc
sidebar_position: 15
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - nlp 搜索
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStats()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getCollectionStats()

此操作除返回 Entity 数量外，还会返回完整的 Collection 统计信息映射。

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## 请求语法\{#request-syntax}

```java
GetCollectionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .build();
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

**返回类型：**

*GetCollectionStatsResp*

**返回：**

一个 **GetCollectionStatsResp** 对象，其中包含指定 Collection 的 Entity 数量和完整统计信息映射。

**参数：**

- **numOfEntities** (*Long*) -

    Collection 中的 Entity 数量。

- **stats** (*Map&lt;String, String&gt;*) -

    Collection 的完整统计信息映射，由 Milvus 以键值对形式返回。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以了解确切的失败原因。

## 示例\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```

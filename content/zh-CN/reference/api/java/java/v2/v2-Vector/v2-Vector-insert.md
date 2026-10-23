---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向 Collection 中插入行。 | Java | v2"
type: docx
token: DKs7dzHI5oaJvlxezuAcuMVzn9c
sidebar_position: 4
keywords: 
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - zilliz
  - Zilliz Cloud
  - 云
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

此操作会向 Collection 中插入行。

```java
public InsertResp insert(InsertReq request)
```

## 请求语法\{#request-syntax}

```java
InsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**构建器方法：**

- `data(List<JsonObject> data)`

    要插入的行。字段名称和值必须符合 Collection Schema。

- `databaseName(String databaseName)`

    Database 的名称。省略时默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionName(String partitionName)`

    目标 Partition 的名称。

**返回类型：**

*InsertResp*

**返回：**

包含已插入的 Entity 数量、在适用情况下生成的主键，以及操作的时间成本（`getCost()`）。

**参数：**

- **insertCnt**（*long*） -

    已插入的 Entity 数量。

- **primaryKeys**（*List&lt;Object&gt;*） -

    已插入 Entity 的主键。

- **cost**（*Long*） -

    操作的时间成本。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

演示经审查的 v3.0.x API 中的 insert()。

```java
InsertResp response = client.insert(InsertReq.builder()
    .collectionName("books")
    .data(rows)
    .build());
```

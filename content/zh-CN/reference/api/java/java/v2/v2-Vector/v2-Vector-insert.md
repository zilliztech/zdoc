---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "统一自动 ID 字段、函数输出字段、动态字段和 Struct 值的插入行校验。 | Java | v2"
type: docx
token: DKs7dzHI5oaJvlxezuAcuMVzn9c
sidebar_position: 4
keywords: 
  - Chroma 与 Milvus
  - Annoy 向量搜索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

统一自动 ID 字段、函数输出字段、动态字段和 Struct 值的插入行校验。

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

    Database 的名称。省略时默认使用当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionName(String partitionName)`

    目标 Partition 的名称。

**返回：**

*InsertResp*

包含已插入的 Entity 数量，以及在适用时生成的主键。

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

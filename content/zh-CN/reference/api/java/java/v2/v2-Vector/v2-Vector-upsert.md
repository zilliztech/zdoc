---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "将行 upsert 到集合中。部分更新可应用字段操作，并且每一行都会根据集合 schema 进行校验。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

将行 upsert 到集合中。部分更新可应用字段操作，并且每一行都会根据集合 schema 进行校验。

```java
public UpsertResp upsert(UpsertReq request)
```

## 请求语法\{#request-syntax}

```java
UpsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .partialUpdate(partialUpdate)
    .fieldOps(fieldOps)
    .build();
```

**构建器方法：**

- `data(List<JsonObject> data)`

    要插入或更新的行。每个部分更新的行都必须包含其主键。

- `databaseName(String databaseName)`

    数据库名称。省略时默认使用当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `partitionName(String partitionName)`

    目标分区的名称。

- `partialUpdate(boolean partialUpdate)`

    是否在省略非主键字段时保持其值不变。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    字段级操作。`ARRAY_APPEND` 和 `ARRAY_REMOVE` 隐含部分更新语义。

**返回：**

*UpsertResp*

包含已插入或已更新实体的数量。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务端执行失败时抛出。请查看异常消息以获取确切的失败原因。

## 示例\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```

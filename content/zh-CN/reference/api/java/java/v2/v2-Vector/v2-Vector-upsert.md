---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "将行插入或更新到 Collection 中。部分更新可应用字段操作，并且每一行都会根据 Collection Schema 进行验证。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

将行插入或更新到 Collection 中。部分更新可应用字段操作，并且每一行都会根据 Collection Schema 进行验证。

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

    要插入或更新的行。每个部分更新行都必须包含其主键。

- `databaseName(String databaseName)`

    Database 名称。省略时默认使用当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionName(String partitionName)`

    目标 Partition 的名称。

- `partialUpdate(boolean partialUpdate)`

    是否保持被省略的非主键字段不变。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    字段级操作。`ARRAY_APPEND` 和 `ARRAY_REMOVE` 表示部分更新语义。

**返回：**

*UpsertResp*

包含已插入或更新的 Entity 数量。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```

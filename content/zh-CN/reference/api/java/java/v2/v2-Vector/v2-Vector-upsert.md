---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将行 upsert 到 Collection 中。部分更新可应用字段操作，且每一行都会依据 Collection 的 Schema 进行校验。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - Zilliz
  - Zilliz Cloud
  - 云
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# upsert()

此操作会将行 upsert 到 Collection 中。部分更新可应用字段操作，且每一行都会依据 Collection 的 Schema 进行校验。

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

    Database 的名称。省略时，该值默认为当前 Database。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `partitionName(String partitionName)`

    目标 Partition 的名称。

- `partialUpdate(boolean partialUpdate)`

    省略的非主键字段是否应保持不变。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    字段级操作。`ARRAY_APPEND` 和 `ARRAY_REMOVE` 意味着部分更新语义。

**返回类型：**

*UpsertResp*

**返回：**

包含插入或更新的 Entity 数量以及操作成本（`getCost()`）。

**参数：**

- **upsertCnt** （*long*） -

    已 upsert 的 Entity 数量。

- **primaryKeys** （*List&lt;Object&gt;*） -

    已 upsert 的 Entity 的主键。

- **cost** （*Long*） -

    操作的时间成本。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时抛出。请检查异常消息，以获取确切的失败原因。

## 示例\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```

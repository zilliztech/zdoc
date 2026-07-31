---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "(占位符) | Java | v2"
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

# upsert()\{#upsert}

此操作会向集合中插入新行，或在主键已存在时更新现有行。您还可以使用部分更新和字段级操作来更新选定字段。

```java
public UpsertResp upsert(UpsertReq request)
```

## 请求语法\{#request-syntax}

```java
upsert(UpsertReq.builder()
    .data(List<JsonObject> data)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .partialUpdate(boolean partialUpdate)
    .fieldOps(List<UpsertReq.FieldPartialUpdateOp> fieldOps)
    .build()
);
```

**BUILDER 方法：**

- `data(List<JsonObject> data)`

    要插入/upsert 的数据行列表，采用 JSON 对象形式。

- `databaseName(String databaseName)`

    数据库名称。如未指定，则默认为当前数据库。

- `collectionName(String collectionName)`

    目标集合的名称。

- `partitionName(String partitionName)`

    目标分区的名称。

- `partialUpdate(boolean partialUpdate)`

    是否在 upsert 期间启用部分字段更新。当您只想更新主键和每一行中提供的字段时，请将其设置为 `true`。如果您在 `fieldOps` 中使用 `ARRAY_APPEND` 或 `ARRAY_REMOVE`，SDK 会自动以部分更新语义发送请求。

- `fieldOps(List<UpsertReq.FieldPartialUpdateOp> fieldOps)`

    控制在部分 upsert 期间如何应用 `data` 中的字段。对于大多数字段，可省略此参数，或使用默认的 `REPLACE` 操作来替换请求中携带的字段值。对于 `ARRAY` 字段，使用 `ARRAY_APPEND` 将请求负载追加到现有数组，或使用 `ARRAY_REMOVE` 删除所有与请求负载匹配的现有元素，而无需先读取并重写整个数组。每个 `FieldPartialUpdateOp` 都只针对一个 `fieldName`。该字段在 `data` 中的值必须与数组的 `element_type` 匹配；执行 `ARRAY_APPEND` 后，最终数组不得超过该字段的 `max_capacity`。

**FieldPartialUpdateOp BUILDER 方法：**

- `fieldName(String fieldName)`

    受部分更新操作影响的字段。

- `opType(UpsertReq.FieldPartialUpdateOp.OpType opType)`

    要应用的操作。有效值为 `REPLACE`、`ARRAY_APPEND` 和 `ARRAY_REMOVE`。非 `REPLACE` 操作意味着采用部分更新语义。

**返回：**

*UpsertResp*

一个 **UpsertResp** 对象，其中包含已插入或已更新实体数量的信息。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常，包括无效的字段级操作参数，例如 `null` 操作、空的 `fieldName` 或 `null` 的 `opType`。

## 示例\{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;

import java.util.Arrays;
import java.util.Collections;

Gson gson = new Gson();

// 1. Set up a client.
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Upsert a complete row.
JsonObject row = new JsonObject();
row.addProperty("id", 0L);
row.add("vector", gson.toJsonTree(Arrays.asList(2.0f, 3.0f)));
row.addProperty("color", "purple");

UpsertReq upsertReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(row))
        .build();
client.upsert(upsertReq);

// 3. Partially update selected fields.
JsonObject partialRow = new JsonObject();
partialRow.addProperty("id", 0L);
partialRow.addProperty("color", "green");

UpsertReq partialUpdateReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(partialRow))
        .partialUpdate(true)
        .build();
client.upsert(partialUpdateReq);

// 4. Apply a field-level operation during upsert.
JsonObject arrayRow = new JsonObject();
arrayRow.addProperty("id", 0L);
arrayRow.add("tags", gson.toJsonTree(Arrays.asList("new-tag")));

UpsertReq fieldOpReq = UpsertReq.builder()
        .collectionName("test")
        .data(Collections.singletonList(arrayRow))
        .partialUpdate(true)
        .fieldOps(Collections.singletonList(
                UpsertReq.FieldPartialUpdateOp.builder()
                        .fieldName("tags")
                        .opType(UpsertReq.FieldPartialUpdateOp.OpType.ARRAY_APPEND)
                        .build()))
        .build();
client.upsert(fieldOpReq);
```

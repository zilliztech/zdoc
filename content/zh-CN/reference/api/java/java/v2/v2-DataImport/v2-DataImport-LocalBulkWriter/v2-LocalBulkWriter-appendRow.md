---
title: "appendRow() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会校验一行数据并将其追加到写入器。当缓冲数据超过配置的 `chunkSize` 时，写入器会自动提交当前文件。 | Java | v2"
type: docx
token: LzctdSxZ9ogGTwxx1yXcTc7ynvf
sidebar_position: 6
keywords: 
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - 什么是 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - appendRow()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# appendRow()

此操作会校验一行数据并将其追加到写入器。当缓冲数据超过配置的 `chunkSize` 时，写入器会自动提交当前文件。

`StructFieldSchema` 字段可以包含 binary、float16、bfloat16 和 int8 向量值。

```java
public void appendRow(JsonObject rowData)
```

**异常：**

- **Exception**

    当请求校验、传输或服务器执行失败时抛出。请检查异常消息，以了解确切的失败原因。

## 示例\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```

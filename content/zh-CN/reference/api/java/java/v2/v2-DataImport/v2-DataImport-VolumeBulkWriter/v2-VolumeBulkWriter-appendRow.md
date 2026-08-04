---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "校验并向 writer 追加一行数据。当缓冲数据超过已配置的 `chunkSize` 时，writer 会自动提交当前文件。 | Java | v2"
type: docx
token: IBAFdWOAKogmCIxHzVIc4NaDn4g
sidebar_position: 1
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - appendRow()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# appendRow()

校验并向 writer 追加一行数据。当缓冲数据超过已配置的 `chunkSize` 时，writer 会自动提交当前文件。

[`StructFieldSchema`](./v2-Collections-StructFieldSchema) 字段可以包含 binary、float16、bfloat16 和 int8 向量值。

```java
public void appendRow(JsonObject rowData)
```

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **Exception**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```

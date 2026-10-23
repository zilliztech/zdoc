---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会验证并向写入器追加一行数据。当缓冲数据超过已配置的 `chunkSize` 时，写入器会自动提交当前文件。 | Java | v2"
type: docx
token: IBAFdWOAKogmCIxHzVIc4NaDn4g
sidebar_position: 1
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - 云
  - appendRow()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# appendRow()

此操作会验证并向写入器追加一行数据。当缓冲数据超过已配置的 `chunkSize` 时，写入器会自动提交当前文件。

[`StructFieldSchema`](./v2-Collections-StructFieldSchema) 字段可包含 binary、float16、bfloat16 和 int8 向量值。

```java
public void appendRow(JsonObject rowData)
```

**参数：**

- **rowData** （*JsonObject*） -

    要追加的行数据，以 JSON 对象表示。每一行将列名映射到值，并且必须通过目标 Schema 的验证。

**异常：**

- **Exception**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```

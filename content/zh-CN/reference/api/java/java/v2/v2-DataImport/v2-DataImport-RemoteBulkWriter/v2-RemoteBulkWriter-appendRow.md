---
title: "appendRow() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会向 RemoteBulkWriter 缓冲区追加一行数据。当缓冲区已满或调用 `commit()` 时，数据将上传到远程存储。 | Java | v2"
type: docx
token: PLJTd37DWozRwbx74AIcQyh4nmc
sidebar_position: 6
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
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

此操作会向 RemoteBulkWriter 缓冲区追加一行数据。当缓冲区已满或调用 `commit()` 时，数据将上传到远程存储。

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**参数：**

- **rowData** (*JsonObject*) -

    表示单行数据的 JSON 对象。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
RemoteBulkWriter writer = new RemoteBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```

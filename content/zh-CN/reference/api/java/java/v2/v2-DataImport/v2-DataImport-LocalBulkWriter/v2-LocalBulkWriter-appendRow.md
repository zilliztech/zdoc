---
title: "appendRow() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将一行数据追加到 LocalBulkWriter 缓冲区中。当缓冲区已满或调用 `commit()` 时，数据将被写入文件。 | Java | v2"
type: docx
token: OgXWdeRGhoxMYqxzNSrcSZAknIb
sidebar_position: 6
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
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

此操作会将一行数据追加到 LocalBulkWriter 缓冲区中。当缓冲区已满或调用 `commit()` 时，数据将被写入文件。

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**参数：**

- **rowData** (*JsonObject*) -

    表示单行数据的 JSON 对象。

**返回：**

*void*

**异常：**

- **IOException**

    这是一个受检异常，当此操作期间发生任何数据读取或数据写入错误时会抛出该异常。

- **InterruptedException**

    这是一个受检异常，当当前处于“阻塞”状态（等待、休眠或因其他原因被占用）的线程被另一个线程通过 `Thread.interrupt()` 方法中断时，会抛出该异常。

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
LocalBulkWriter writer = new LocalBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```

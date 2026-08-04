---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回此 RemoteBulkWriter 实例已写入的总行数。 | Java | v2"
type: docx
token: QH3hdlzwDoxHjTxPj39c6qMSnbg
sidebar_position: 7
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

此操作返回此 RemoteBulkWriter 实例已写入的总行数。

```java
public Long getTotalRowCount()
```

**返回：**

*Long*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
RemoteBulkWriter writer = new RemoteBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```

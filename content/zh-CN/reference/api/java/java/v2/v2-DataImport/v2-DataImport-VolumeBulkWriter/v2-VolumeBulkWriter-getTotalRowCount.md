---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回此 VolumeBulkWriter 实例已写入的总行数。 | Java | v2"
type: docx
token: JgY9doHQjoNBfMxVnpfcZeHongb
sidebar_position: 5
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
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

此操作返回此 VolumeBulkWriter 实例已写入的总行数。

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
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```


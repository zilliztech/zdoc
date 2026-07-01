---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-getTotalRowCount
sidebar_key: java/v2-RemoteBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the total number of rows written by this RemoteBulkWriter instance. | Java | v2"
type: docx
token: QH3hdlzwDoxHjTxPj39c6qMSnbg
sidebar_position: 7
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

This operation returns the total number of rows written by this RemoteBulkWriter instance.

```java
public Long getTotalRowCount()
```

**RETURNS:**

*Long*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
RemoteBulkWriter writer = new RemoteBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```

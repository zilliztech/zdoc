---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-getTotalRowCount
sidebar_key: java/v2-LocalBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the total number of rows written by this LocalBulkWriter instance. | Java | v2"
type: docx
token: AUQvd5EdFomWEWx3DrwcffYHnmb
sidebar_position: 7
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

This operation returns the total number of rows written by this LocalBulkWriter instance.

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
LocalBulkWriter writer = new LocalBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```

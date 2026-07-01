---
title: "getTotalRowCount() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-getTotalRowCount
sidebar_key: java/v2-VolumeBulkWriter-getTotalRowCount
sidebar_label: "getTotalRowCount()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the total number of rows written by this VolumeBulkWriter instance. | Java | v2"
type: docx
token: JgY9doHQjoNBfMxVnpfcZeHongb
sidebar_position: 5
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - getTotalRowCount()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getTotalRowCount()

This operation returns the total number of rows written by this VolumeBulkWriter instance.

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
VolumeBulkWriter writer = new VolumeBulkWriter(config);
// ... append rows
Long totalRows = writer.getTotalRowCount();
System.out.println("Total rows written: " + totalRows);
```


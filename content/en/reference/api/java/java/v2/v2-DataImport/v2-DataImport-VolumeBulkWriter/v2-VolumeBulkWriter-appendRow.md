---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends a row of data to the VolumeBulkWriter buffer. The data will be written to a file when the buffer is full or when `commit()` is called. | Java | v2"
type: docx
token: TfLbdZoRvoa4RyxUWwncTDm2nHh
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

This operation appends a row of data to the VolumeBulkWriter buffer. The data will be written to a file when the buffer is full or when `commit()` is called.

```java
public void appendRow(JsonObject rowData) throws IOException, InterruptedException
```

**PARAMETERS:**

- **rowData** (*JsonObject*) -

    A JSON object representing a single row of data.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **IOException**

    This is a checked exception thrown when any data-read or data-write errors occur during this operation.

- **InterruptedException**

    This is a checked exception thrown when a thread that is currently "blocking" (waiting, sleeping, or otherwise occupied) is interrupted by another thread using the `Thread.interrupt()` method.

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
VolumeBulkWriter writer = new VolumeBulkWriter(config);
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.add("vector", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f}));
writer.appendRow(row);
```


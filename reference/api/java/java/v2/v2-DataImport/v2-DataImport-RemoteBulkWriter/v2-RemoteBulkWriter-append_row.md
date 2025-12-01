---
title: "append_row() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends records to the writer. | Java | v2"
type: docx
token: L115dnbLyoXAVSxkUKxcuK4gncf
sidebar_position: 1
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - javaV226
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

```java
public void appendRow(JsonObject rowData)
```

## Request Syntax\{#request-syntax}

```java
remoteBulkWriter.appendRow(
    JsonObject rowData
)
```

**PARAMETERS:**

- **rowData** (*JsonObject*) -

    A dictionary representing an entity to be appended.

    The keys and their values in the dictionary should match the schema referenced in the current **LocalBulkWriter**.

**RETURN TYPE:**

*void*

## Example\{#example}

```java
for (JsonObject rowObject : data) {
    remoteBulkWriter.appendRow(rowObject);
}
```

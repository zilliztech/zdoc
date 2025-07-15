---
displayed_sidbar: javaSidebar
title: "append_row() | Java | v2"
slug: /java/java/v2-RemoteBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
notebook: false
description: "This operation appends records to the writer. | Java | v2"
type: docx
token: L115dnbLyoXAVSxkUKxcuK4gncf
sidebar_position: 1
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - javaV225
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

```java
public void appendRow(JsonObject rowData)
```

## Request Syntax{#request-syntax}

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

## Example{#example}

```java
for (JsonObject rowObject : data) {
    remoteBulkWriter.appendRow(rowObject);
}
```

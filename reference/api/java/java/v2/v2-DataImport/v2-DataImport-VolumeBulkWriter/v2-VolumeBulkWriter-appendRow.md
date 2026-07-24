---
title: "appendRow() | Java | v2"
slug: /java/java/v2-VolumeBulkWriter-appendRow
sidebar_label: "appendRow()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Validates and appends one row to the writer. When buffered data exceeds the configured `chunkSize`, the writer commits the current file automatically. | Java | v2"
type: docx
token: IBAFdWOAKogmCIxHzVIc4NaDn4g
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

Validates and appends one row to the writer. When buffered data exceeds the configured `chunkSize`, the writer commits the current file automatically.

[`StructFieldSchema`](./v2-Collections-StructFieldSchema) fields can contain binary, float16, bfloat16, and int8 vector values.

```java
public void appendRow(JsonObject rowData)
```

**RETURNS:**

*void*

This operation does not return a value.

**EXCEPTIONS:**

- **Exception**

    Raised when request validation, transport, or server execution fails. Inspect the exception message for the exact failure reason.

## Example\{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("id", 1L);
row.addProperty("title", "Dune");
writer.appendRow(row);
```

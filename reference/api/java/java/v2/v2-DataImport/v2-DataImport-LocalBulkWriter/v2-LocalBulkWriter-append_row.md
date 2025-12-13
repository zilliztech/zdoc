---
title: "append_row() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends records to the writer. | Java | v2"
type: docx
token: HofVdjV0koj42QxX0iHcQb05nab
sidebar_position: 1
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - javaV226
  - knn
  - Image Search
  - LLMs
  - Machine Learning
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
localBulkWriter.appendRow(
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
JsonObject row = new JsonObject();
row.addProperty("path", "path_" + i);
row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
row.addProperty("label", "label_" + i);

localBulkWriter.appendRow(row);
```

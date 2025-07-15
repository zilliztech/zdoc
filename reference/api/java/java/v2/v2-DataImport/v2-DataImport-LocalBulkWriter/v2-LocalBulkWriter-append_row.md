---
displayed_sidbar: javaSidebar
title: "append_row() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
notebook: false
description: "This operation appends records to the writer. | Java | v2"
type: docx
token: HofVdjV0koj42QxX0iHcQb05nab
sidebar_position: 1
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - javaV225
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
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

## Example{#example}

```java
JsonObject row = new JsonObject();
row.addProperty("path", "path_" + i);
row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
row.addProperty("label", "label_" + i);

localBulkWriter.appendRow(row);
```

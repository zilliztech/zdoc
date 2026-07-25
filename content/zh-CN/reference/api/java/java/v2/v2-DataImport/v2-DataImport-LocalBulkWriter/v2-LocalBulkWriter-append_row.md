---
displayed_sidbar: javaSidebar
title: "append_row() | Java | v2"
slug: /java/java/v2-LocalBulkWriter-append_row
sidebar_label: "append_row()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation appends records to the writer. | Java | v2"
type: docx
token: HofVdjV0koj42QxX0iHcQb05nab
sidebar_position: 1
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends records to the writer.

```java
public void appendRow(JsonObject rowData)
```

## Request Syntax

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

## Example

```java
JsonObject row = new JsonObject();
row.addProperty("path", "path_" + i);
row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
row.addProperty("label", "label_" + i);

localBulkWriter.appendRow(row);
```

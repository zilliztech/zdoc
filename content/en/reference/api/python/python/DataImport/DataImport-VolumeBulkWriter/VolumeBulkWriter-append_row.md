---
title: "append_row() | Python"
slug: /python/python/VolumeBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation appends a single row of data to the internal buffer. When the buffer size exceeds the configured chunk size, the buffer is automatically flushed to local files and uploaded to the remote volume. | Python"
type: docx
token: Wlw2dkci9oDVsmx8hkDcf85qndf
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# append_row()

This operation appends a single row of data to the internal buffer. When the buffer size exceeds the configured chunk size, the buffer is automatically flushed to local files and uploaded to the remote volume.

## Request Syntax\{#request-syntax}

```python
VolumeBulkWriter.append_row(
    row: Dict[str, Any],
    **kwargs
)
```

**PARAMETERS:**

- **row** (*Dict[str, Any]*) -

    **[REQUIRED]**

    A dictionary representing a single row of data. The keys must match the field names defined in the collection schema, and the values must conform to the corresponding field types.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the row data fails validation against the collection schema. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
writer.append_row(
    row={
        "id": 1,
        "vector": [0.1] * 128,
    },
)
```

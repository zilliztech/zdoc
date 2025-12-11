---
title: "compact() | Python | ORM"
slug: /python/python/Collection-compact
sidebar_label: "compact()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation compacts and merges small segments in the current collection. | Python | ORM"
type: docx
token: BHx6dnSmPoaqHAxKCvncbuk9nWb
sidebar_position: 2
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - pymilvus26
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts and merges small segments in the current collection.

## Request Syntax\{#request-syntax}

```python
compact(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation times out when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Compact small segments
collection.compact()
```

## Related operations\{#related-operations}

The following operations are related to `compact()`:

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [get_compaction_state()](./Collection-get_compaction_state)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)


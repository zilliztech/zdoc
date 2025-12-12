---
title: "wait_for_compaction_completed() | Python | ORM"
slug: /python/python/Collection-wait_for_compaction_completed
sidebar_label: "wait_for_compaction_completed()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation blocks the current session until the compaction request is completed. | Python | ORM"
type: docx
token: VFKIdx0tDoeAzSx4Ud6c3u5Snsf
sidebar_position: 29
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_compaction_completed()
  - pymilvus26
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_compaction_completed()

This operation blocks the current session until the compaction request is completed.

## Request Syntax\{#request-syntax}

```python
wait_for_compaction_completed(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This arises when any error occurs during this operation.

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

# Check the compaction state
collection.wait_for_compaction_completed()
```

## Related operations\{#related-operations}

The following operations are related to `wait_for_compaction_completed()`:

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [get_compaction_state()](./Collection-get_compaction_state)


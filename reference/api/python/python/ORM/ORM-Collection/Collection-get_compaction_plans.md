---
displayed_sidbar: pythonSidebar
title: "get_compaction_plans() | Python | ORM"
slug: /python/python/Collection-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation gets the current compaction plans. | Python | ORM"
type: docx
token: D6Q7dq4USotLS3xxMP0cFiGLnsf
sidebar_position: 12
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_plans()
  - pymilvus25
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

This operation gets the current compaction plans.

## Request Syntax{#request-syntax}

```python
get_compaction_plans(
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

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

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
collection.get_compaction_plans()

# Compaction Plans:
#  - compaction id: 446738261026576357
#  - state: Completed
#  - plans: []
```

## Related operations{#related-operations}

The following operations are related to `get_compaction_plans()`:

- [compact()](./Collection-compact)

- [get_compaction_state()](./Collection-get_compaction_state)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)


---
displayed_sidbar: pythonSidebar
title: "get_compaction_state() | Python | ORM"
slug: /python/python/Collection-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation gets the current compaction state. | Python | ORM"
type: docx
token: AXcMd0xiOovIX6xR4ZrcKA15nwh
sidebar_position: 13
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_state()
  - pymilvus25
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_compaction_state()

This operation gets the current compaction state. 

## Request Syntax{#request-syntax}

```python
get_compaction_state(
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
collection.get_compaction_state()

# CompactionState
#  - compaction id: 446738261026568285
#  - State: Completed
#  - executing plan number: 4
#  - timeout plan number: 0
#  - complete plan number: 4
```

## Related operations{#related-operations}

The following operations are related to `get_compaction_state()`:

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [wait_for_compaction_completed()](./Collection-wait_for_compaction_completed)


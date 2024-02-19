---
displayed_sidbar: pythonSidebar
slug: /python/Collection-get_compaction_plans
beta: false
notebook: false
token: D6Q7dq4USotLS3xxMP0cFiGLnsf
sidebar_position: 24
---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

This operation gets the current compaction plans.

```python
pymilvus.Collection.get_compaction_plans(
    timeout: float | None
)
```

The following operations are related to `get_compaction_plans()`:

- compact()

- get_compaction_state()

- wait_for_compaction_completed()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# Call the compact method
collection.compact()

# Get the compaction state
collection.get_compaction_plans()
```

**PARAMETERS:**

- **timeout** (*float *|* None*)  

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

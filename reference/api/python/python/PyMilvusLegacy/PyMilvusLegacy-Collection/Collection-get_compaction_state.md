---
displayed_sidbar: pythonSidebar
slug: /python/Collection-get_compaction_state
beta: false
notebook: false
token: AXcMd0xiOovIX6xR4ZrcKA15nwh
sidebar_position: 23
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

This operation gets the current compaction state. 

```python
pymilvus.Collection.get_compaction_state(
    timeout: float | None
)
```

The following operations are related to `get_compaction_state()`:

- compact()

- get_compaction_plans()

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
collection.get_compaction_state()
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
collection.get_compaction_state()

# CompactionState
#  - compaction id: 446738261026568285
#  - State: Completed
#  - executing plan number: 4
#  - timeout plan number: 0
#  - complete plan number: 4
```


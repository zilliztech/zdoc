---
displayed_sidbar: pythonSidebar
slug: /python/Collection-get_compaction_state
beta: false
notebook: false
type: docx
token: AXcMd0xiOovIX6xR4ZrcKA15nwh
sidebar_position: 13
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

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

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


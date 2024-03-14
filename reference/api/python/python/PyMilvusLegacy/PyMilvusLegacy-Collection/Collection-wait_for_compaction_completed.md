---
displayed_sidbar: pythonSidebar
slug: /python/Collection-wait_for_compaction_completed
beta: false
notebook: false
type: docx
token: VFKIdx0tDoeAzSx4Ud6c3u5Snsf
sidebar_position: 28
---

import Admonition from '@theme/Admonition';


# wait_for_compaction_completed()

This operation blocks the current session until the compaction request is completed.

## Request Syntax{#request-syntax}

```python
wait_for_compaction_completed(
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

    This arises when any error occurs during this operation.

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
collection.wait_for_compaction_completed()
```

## Related operations{#related-operations}

The following operations are related to `wait_for_compaction_completed()`:

- [compact()](./Collection-compact)

- [get_compaction_plans()](./Collection-get_compaction_plans)

- [get_compaction_state()](./Collection-get_compaction_state)


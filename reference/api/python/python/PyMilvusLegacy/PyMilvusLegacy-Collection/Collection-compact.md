---
displayed_sidbar: pythonSidebar
slug: /python/Collection-compact
beta: false
notebook: false
token: BHx6dnSmPoaqHAxKCvncbuk9nWb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts and merges small segments in the current collection.

```python
pymilvus.Collection.compact(
    timeout: float | None
)
```

The following operations are related to `compact()`:

- get_compaction_plans()

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
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation times out when any response arrives or any error occurs.

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
```

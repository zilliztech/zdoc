---
displayed_sidbar: pythonSidebar
slug: /python/Partition-drop
beta: false
notebook: false
token: D3sndK8DgoqDkUxaNGcctwcSnuE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# drop()

This operation drops the current partition. 

## Request Syntax{#request-syntax}

```python
drop(
    timeout: float | None
)
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

_None_

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

# Create a partition
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Drop the partition
partition.drop()
```

## Related operations{#related-operations}

The following operations are related to `drop()`:

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

- [release()](./Partition-release)


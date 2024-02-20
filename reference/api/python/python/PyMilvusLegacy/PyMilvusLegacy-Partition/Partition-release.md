---
displayed_sidbar: pythonSidebar
slug: /python/Partition-release
beta: false
notebook: false
token: ZQ2RdE2AOoH9bfx4k3Sc3Ny0ngb
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# release()

This operation releases the data of the current partition from memory.

```python
pymilvus.Partition.release(
    timeout: float | None
)
```

The following operations are related to `release()`:

- Partition

- load()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="string")

# Get an existing partition
partition = Partition(collection, name="string")

# Load the partition data
partition.load()

# Release the partition data
partition.release()
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
partition = Partition(collection, name="comedy", description="comedy films")

# Load the partition data
partition.load()

# Release the partition data
partition.release()
```


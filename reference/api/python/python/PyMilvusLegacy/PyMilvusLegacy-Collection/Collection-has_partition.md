---
displayed_sidbar: pythonSidebar
slug: /python/Collection-has_partition
beta: false
notebook: false
token: QsOsda2lRoJP32xNSLWcbgMOnKI
sidebar_position: 16
---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether the specified partition exists in the current collection.

```python
pymilvus.Collection.has_partition(
    partition_name: str, 
    timeout: float | None,
)
```

The following operations are related to `has_collection()`:

- Collection

- Partition

- partition()

- create_partition()

- drop_partition()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# Check whether the specified partition exists
collection.has_partition(partition_name="string")
```

__PARAMETERS:__

- __partition_name__ (_str_) -

    The name of the partition to drop.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the current collection has the specified partition or not

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

# Create a partition
partition = collection.create_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # True

# Drop the partition
collection.drop_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # False
```

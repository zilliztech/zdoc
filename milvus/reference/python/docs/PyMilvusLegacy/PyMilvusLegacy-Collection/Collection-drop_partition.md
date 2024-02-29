---
displayed_sidbar: pythonSidebar
slug: /python/Collection-drop_partition
beta: false
notebook: false
type: docx
token: Aym2dpBuIo81mExCqyLcSWhunBe
sidebar_position: 10
---

# drop_partition()

This operation drops a specified partition from the current collection.

```python
drop_partition(
    partition_name: str
    timeout: float | None
)
```

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# drop an existing partition
collection.drop_partition(
    partition_name="string"
)
```

__PARAMETERS:__

- __partition_name__ (_str_) -

    The name of the partition to drop.

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

# Create a partition
partition = collection.create_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # True

# Drop the partition
collection.drop_partition("test_partition")

# Check whether the partition exists
collection.has_partition("test_partition") # False
```

## Related operations{#related-operations}

The following operations are related to `drop_collection()`:

- [Collection](./PyMilvusLegacy-Collection)

- [Partition](./PyMilvusLegacy-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [has_partition()](./Collection-has_partition)


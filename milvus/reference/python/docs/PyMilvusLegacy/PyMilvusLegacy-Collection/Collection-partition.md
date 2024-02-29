---
displayed_sidbar: pythonSidebar
slug: /python/Collection-partition
beta: false
notebook: false
type: docx
token: SvCrdEJIdosGQYxQZhrc2OAXnpd
sidebar_position: 20
---

# partition()

This operation gets the specified partition in the current collection.

## Request Syntax{#request-syntax}

```python
partition(
    partition_name: str
)
```

__PARAMETERS:__

- __partition_name__ (_str_) -

    __[REQUIRED]__

    The name of the partition to get.

__RETURN TYPE:__

_Partition _| _NoneType_

__RETURNS:__

A __Partition__ object. If the current collection does not have a partition of the specified name, __None__ is returned.

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
partition = collection.partition(partition_name="test_partition")
```

## Related operations{#related-operations}

The following operations are related to `partition()`:

- [Collection](./PyMilvusLegacy-Collection)

- [Partition](./PyMilvusLegacy-Partition)

- [create_partition()](./Collection-create_partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)


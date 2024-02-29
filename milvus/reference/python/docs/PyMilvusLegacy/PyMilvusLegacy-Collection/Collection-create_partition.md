---
displayed_sidbar: pythonSidebar
slug: /python/Collection-create_partition
beta: false
notebook: false
type: docx
token: Sh7HdgJOIoJipXx5AoNcicjMnyd
sidebar_position: 5
---

# create_partition()

This operation creates a partition in the target collection.

## Request Syntax{#request-syntax}

```python
create_partition(
    partition_name: str, 
    description: str | None, 
)
```

__PARAMETERS:__

- __partition_name__ (_string_)

    __[REQUIRED]__

    The name of the partition to create.

- __description__ (_string_)

    The description of this partition.

__RETURN TYPE:__

_Partition_

__RETURNS:__

A partition object.

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
partition = collection.create_partition(partition_name="test_partition")

# Output
# {"name":"test_partition","collection_name":"test_collection","description":""}
```

## Related operations{#related-operations}

The following operations are related to `create_partition()`:

- [Collection](./PyMilvusLegacy-Collection)

- [Partition](./PyMilvusLegacy-Partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)


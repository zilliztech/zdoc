---
displayed_sidbar: pythonSidebar
slug: /python/python/Collection-has_partition
beta: FALSE
notebook: FALSE
type: docx
token: QsOsda2lRoJP32xNSLWcbgMOnKI
sidebar_position: 16
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether the specified partition exists in the current collection.

## Request Syntax{#request-syntax}

```python
has_partition(
    partition_name: str, 
    timeout: float | None,
)
```

**PARAMETERS:**

- **partition_name** (*str*) -

    The name of the partition to drop.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the current collection has the specified partition or not

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

The following operations are related to `has_collection()`:

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)


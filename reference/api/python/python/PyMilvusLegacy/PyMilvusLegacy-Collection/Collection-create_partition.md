---
displayed_sidbar: pythonSidebar
slug: /python/Collection-create_partition
beta: false
notebook: false
token: Sh7HdgJOIoJipXx5AoNcicjMnyd
sidebar_position: 27
---

import Admonition from '@theme/Admonition';


# create_partition()

This operation creates a partition in the target collection.

```python
pymilvus.Collection.create_partition(
    partition_name: str, 
    description: str | None, 
)
```

The following operations are related to `create_partition()`:

- Collection

- Partition

- partition()

- drop_partition()

- has_partition()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# Create a partition
partition = collection.create_partition(
    partition_name="string" 
    description="string"
)
```

**PARAMETERS:**

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to create.

- **description** (*string*)

    The description of this partition.

**RETURN TYPE:**

*Partition*

**RETURNS:**

A partition object.

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
partition = collection.create_partition(partition_name="test_partition")

# Output
# {"name":"test_partition","collection_name":"test_collection","description":""}
```

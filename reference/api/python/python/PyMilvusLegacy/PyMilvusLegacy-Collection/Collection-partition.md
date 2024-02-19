---
displayed_sidbar: pythonSidebar
slug: /python/Collection-partition
beta: false
notebook: false
token: SvCrdEJIdosGQYxQZhrc2OAXnpd
sidebar_position: 21
---

import Admonition from '@theme/Admonition';


# partition()

This operation gets the specified partition in the current collection.

```python
pymilvus.Collection.partition(
    partition_name: str
)
```

The following operations are related to `partition()`:

- Collection

- Partition

- create_partition()

- drop_partition()

- has_partition()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# Get a specified partition
partition = collection.partition(
    partition_name="string"
)
```

**PARAMETERS:**

- **partition_name** (*str*) -

    **[REQUIRED]**

    The name of the partition to get.

**RETURN TYPE:**

*Partition *| *NoneType*

**RETURNS:**

A **Partition** object. If the current collection does not have a partition of the specified name, **None** is returned.

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
partition = collection.partition(partition_name="test_partition")
```


---
displayed_sidbar: pythonSidebar
title: "partition() | Python | ORM"
slug: /python/python/Collection-partition
sidebar_label: "partition()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation gets the specified partition in the current collection. | Python | ORM"
type: docx
token: SvCrdEJIdosGQYxQZhrc2OAXnpd
sidebar_position: 21
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - partition()
  - pymilvus25
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# partition()

This operation gets the specified partition in the current collection.

## Request Syntax{#request-syntax}

```python
partition(
    partition_name: str
)
```

**PARAMETERS:**

- **partition_name** (*str*) -

    **[REQUIRED]**

    The name of the partition to get.

**RETURN TYPE:**

*Partition* | *NoneType*

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

## Related operations{#related-operations}

The following operations are related to `partition()`:

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)


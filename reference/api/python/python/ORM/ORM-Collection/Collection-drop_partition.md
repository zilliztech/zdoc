---
displayed_sidbar: pythonSidebar
title: "drop_partition() | Python | ORM"
slug: /python/python/Collection-drop_partition
sidebar_label: "drop_partition()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation drops a specified partition from the current collection. | Python | ORM"
type: docx
token: Aym2dpBuIo81mExCqyLcSWhunBe
sidebar_position: 10
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - drop_partition()
  - pymilvus25
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


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

**PARAMETERS:**

- **partition_name** (*str*) -

    The name of the partition to drop.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

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

The following operations are related to `drop_collection()`:

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [create_partition()](./Collection-create_partition)

- [partition()](./Collection-partition)

- [has_partition()](./Collection-has_partition)


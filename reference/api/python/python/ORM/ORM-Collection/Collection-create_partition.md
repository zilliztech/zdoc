---
title: "create_partition() | Python | ORM"
slug: /python/python/Collection-create_partition
sidebar_label: "create_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a partition in the target collection. | Python | ORM"
type: docx
token: Sh7HdgJOIoJipXx5AoNcicjMnyd
sidebar_position: 5
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - create_partition()
  - pymilvus26
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_partition()

This operation creates a partition in the target collection.

## Request Syntax\{#request-syntax}

```python
create_partition(
    partition_name: str, 
    description: str | None, 
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

## Examples\{#examples}

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

## Related operations\{#related-operations}

The following operations are related to `create_partition()`:

- [Collection](./ORM-Collection)

- [Partition](./ORM-Partition)

- [partition()](./Collection-partition)

- [drop_partition()](./Collection-drop_partition)

- [has_partition()](./Collection-has_partition)


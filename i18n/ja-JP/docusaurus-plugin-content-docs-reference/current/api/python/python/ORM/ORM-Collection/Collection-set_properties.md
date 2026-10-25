---
title: "set_properties() | Python | ORM"
slug: /python/python/Collection-set_properties
sidebar_label: "set_properties()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets properties for the コレクション. | Python | ORM"
type: docx
token: ECmAdaYKboPTNlxqkLxcUEZ4nrh
sidebar_position: 27
keywords: 
  - rag ベクトル データベース
  - what is ベクトル db
  - what are ベクトル データベース
  - ベクトル データベース comparison
  - zilliz
  - zilliz cloud
  - cloud
  - set_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# set_properties()

This operation sets properties for the コレクション.

## Request Syntax\{#request-syntax}

```python
set_properties(
    properties: dict, 
    timeout: float | None, 
    kwargs
)
```

**PARAMETERS:**

- **properties** (dict) -

    A set of コレクション properties in the form of a dictionary. Currently, you can set the following properties:

    - **コレクション.ttl.seconds**

        Once this property is set, data in the current コレクション expires in the specified time. Expired data in the コレクション will be cleaned up and will not be involved in searches or queries.

    - **mmap.enabled**

        Whether to enable memory-mapped storage at the コレクション level. For more information, refer to [Configure memory mapping](https://milvus.io/docs/mmap.md#Configure-memory-mapping).

- **timeout** (*float*)  -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

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

# Set the TTL for the data in the collection
collection.set_properties(
    properties={
        "collection.ttl.seconds": 60
    }
)
```

## Related operations\{#related-operations}

以下の操作は `insert()` に関連しています。

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)


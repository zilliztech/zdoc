---
title: "set_properties() | Python | ORM"
slug: /python/python/Collection-set_properties
sidebar_label: "set_properties()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets properties for the collection. | Python | ORM"
type: docx
token: ECmAdaYKboPTNlxqkLxcUEZ4nrh
sidebar_position: 27
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - set_properties()
  - pymilvus26
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# set_properties()

This operation sets properties for the collection.

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

    A set of collection properties in the form of a dictionary. Currently, you can set the following properties:

    - **collection.ttl.seconds**

        Once this property is set, data in the current collection expires in the specified time. Expired data in the collection will be cleaned up and will not be involved in searches or queries.

    - **mmap.enabled**

        Whether to enable memory-mapped storage at the collection level. For more information, refer to [Configure memory mapping](https://milvus.io/docs/mmap.md#Configure-memory-mapping).

- **timeout** (*float*)  -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

The following operations are related to `insert()`:

- [describe()](./Collection-describe)

- [drop()](./Collection-drop)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)


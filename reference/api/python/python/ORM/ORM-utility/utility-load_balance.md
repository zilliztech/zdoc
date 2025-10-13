---
title: "load_balance() | Python | ORM"
slug: /python/python/utility-load_balance
sidebar_label: "load_balance()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets up a load-balancing group between two query nodes for a specific collection. | Python | ORM"
type: docx
token: XYNMdg3Vpo3SE7xTRVqcJNvrn0d
sidebar_position: 32
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - load_balance()
  - pymilvus25
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_balance()

This operation sets up a load-balancing group between two query nodes for a specific collection.

## Request Syntax{#request-syntax}

```python
load_balance(
    collection_name: str,
    src_node_id: int,
    dst_node_ids: list[int] | None,
    sealed_segment_ids: list[int] | None,
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **collection_name** (*str*) -
**&#91;REQUIRED&#93;**

    The name of an existing collection for which a load-balancing group is set up.

- **src_node_id** (*int*) -
**&#91;REQUIRED&#93;**

    The ID of the query node the collection currently uses.

- **dst_node_ids** (*list&#91;int&#93;*) -

    The IDs of the query nodes to be added to the load-balancing group.

- **sealed_segment_ids** (*list&#91;int&#93;*) -

    The IDs of the sealed segments to load-balance.

- **timeout** (*float*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

**RETURN TYPE:**

*NoneType*

**RETURNS:**
None

**EXCEPTIONS:**

N/A

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

utility.load_balance(
    collection_name="test_collection",
    src_node_id=446781855410073001,
    dst_node_ids=[478798283048914039],
    sealed_segment_ids=None,
)
```


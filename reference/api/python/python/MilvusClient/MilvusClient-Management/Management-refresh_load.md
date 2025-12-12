---
title: "refresh_load() | Python | MilvusClient"
slug: /python/python/Management-refresh_load
sidebar_label: "refresh_load()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads the unloaded data of a loaded collection into memory. | Python | MilvusClient"
type: docx
token: X3NXdtC2koiAxyxhcUBcv38Wnsh
sidebar_position: 12
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_load()
  - pymilvus26
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_load()

This operation loads the unloaded data of a loaded collection into memory.

## Request syntax\{#request-syntax}

```python
refresh_load(
    collection_name: str,
    timeout: Optional[str] = None
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection of this operation.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

 None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Refresh the load status of the collection
client.refresh_load(
    collection_name="test_collection"
)
```

## Related methods\{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [release_collection()](./Management-release_collection)


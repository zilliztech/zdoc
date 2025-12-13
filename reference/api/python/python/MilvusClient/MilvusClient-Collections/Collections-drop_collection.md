---
title: "drop_collection() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection
sidebar_label: "drop_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a collection. | Python | MilvusClient"
type: docx
token: QNB4d2q2ZorIApxpnzqczW2HnL7
sidebar_position: 11
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection()
  - pymilvus26
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a collection.

## Request syntax\{#request-syntax}

```python
drop_collection(collection_name: str) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

## Examples\{#examples}

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

# 3. List collections
res = client.list_collections() 

# ['test_collection']

# 4. Drop the collection
client.drop_collection(collection_name="test_collection")

# 5. List collections
res = client.list_collections() 

# []
```

## Related methods\{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)


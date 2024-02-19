---
displayed_sidbar: pythonSidebar
slug: /python/Collections-drop_collection
beta: false
notebook: false
token: QNB4d2q2ZorIApxpnzqczW2HnL7
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.drop_collection(collection_name: str) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. List collections
res = client.list_collections() # ['test_collection']

# 4. Drop the collection
client.drop_collection(collection_name="test_collection")

# 5. List collections
res = client.list_collections() # []
```


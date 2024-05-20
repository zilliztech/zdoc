---
displayed_sidbar: this.displayedSidebar
slug: /python/python/Collections-drop_collection
beta: FALSE
notebook: FALSE
type: docx
token: QNB4d2q2ZorIApxpnzqczW2HnL7
sidebar_position: 9
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a collection.

## Request syntax{#request-syntax}

```python
drop_collection(collection_name: str) -> None
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

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)


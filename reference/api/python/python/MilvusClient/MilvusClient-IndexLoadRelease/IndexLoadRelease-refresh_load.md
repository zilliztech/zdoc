---
displayed_sidbar: pythonSidebar
slug: /python/IndexLoadRelease-refresh_load
beta: false
notebook: false
token: X3NXdtC2koiAxyxhcUBcv38Wnsh
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# refresh_load()

This operation refreshes the load status of an already loaded collection.

## Request Syntax{#request-syntax}

```python
pymilvus.refresh_load(
    collection_name: str,
    timeout: Optional[str] = None
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection of this operation.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

 None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

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

# 3. Refresh the load status of the collection
client.refresh_load(
    collection_name="test_collection"
)
```


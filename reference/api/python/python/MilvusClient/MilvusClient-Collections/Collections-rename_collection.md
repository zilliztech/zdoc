---
displayed_sidbar: pythonSidebar
slug: /python/Collections-rename_collection
beta: false
notebook: false
token: IeiIdJ71Pox2OjxMiOzczUTenud
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# rename_collection()

This operation renames an existing collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.rename_collection(
    old_name: str,
    new_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **old_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- **new_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection after this operation.

    Setting this to the value of **old_name** results in a **MilvusException**.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

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

# 3. Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)
```

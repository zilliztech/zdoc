---
displayed_sidbar: pythonSidebar
slug: /python/python/Collections-drop_alias
beta: false
notebook: false
type: docx
token: FpWXdmIuforYz9xUCsqclyCXnLe
sidebar_position: 8
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_alias()

This operation drops a specified collection alias. 

## Request syntax{#request-syntax}

```python
drop_alias(
    alias: str,
    timeout: float | None
) -> None
```

**PARAMETERS:**

- **alias** (*str*) -

    **[REQUIRED]**

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to a non-existing alias.

- **BaseException**

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. Drop the alias
client.drop_alias(alias="test")
```

## Related methods{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [list_aliases()](./Collections-list_aliases)


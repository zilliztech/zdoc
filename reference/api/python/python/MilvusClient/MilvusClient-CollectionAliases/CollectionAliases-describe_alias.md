---
displayed_sidbar: pythonSidebar
slug: /python/CollectionAliases-describe_alias
beta: false
notebook: false
token: HN7nddgueo3scIxmPXAcpjkFnDf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# describe_alias()

This operation displays the details of an alias.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.describe_alias(
    alias: str,
    timeout: Optional[float] = None
) -> Dict
```

**PARAMETERS:**

- **alias **(*str*) -

    **[REQUIRED]**

    The alias of a collection. Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to an existing alias.

- **BaseException**

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. Describe the alias
client.describe_alias(alias="test")
```


---
displayed_sidbar: pythonSidebar
slug: /python/Collections-describe_alias
beta: false
notebook: false
token: HN7nddgueo3scIxmPXAcpjkFnDf
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# describe_alias()

This operation displays the details of an alias.

## Request Syntax{#request-syntax}

```python
describe_alias(
    alias: str,
    timeout: Optional[float] = None
) -> dict
```

__PARAMETERS:__

- __alias __(_str_) -

    __[REQUIRED]__

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to an existing alias.

- __BaseException__

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

# 4. Describe the alias
client.describe_alias(alias="test")
```

## Related methods{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)


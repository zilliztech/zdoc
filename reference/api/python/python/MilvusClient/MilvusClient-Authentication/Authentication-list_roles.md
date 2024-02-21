---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-list_roles
beta: false
notebook: false
token: MApVdDl17oU8OixzbMPcgceKnOh
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# list_roles()

This operation lists all custom roles.

## Request syntax{#request-syntax}

```python
list_roles(
    timeout: Optional[float] = None
) -> dict
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of role names.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

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

# 2. Create a role
client.create_role(role_name="read_only")

# 3. List all roles
client.list_roles()

# ['admin', 'public', 'read_only']
```

## Related methods{#related-methods}

- [describe_role()](./Authentication-describe_role)

- [grant_role()](./Authentication-grant_role)

- [revoke_role()](./Authentication-revoke_role)


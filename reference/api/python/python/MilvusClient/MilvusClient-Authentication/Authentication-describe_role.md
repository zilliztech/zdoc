---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-describe_role
beta: false
notebook: false
token: JJz3dFrE2oJP3AxySWYcJlf4nMh
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# describe_role()

This operation describes a specific role.

## Request syntax{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> List[Dict]
```

__PARAMETERS:__

- __role_name__ (_str_) -

    __[REQUIRED]__

    The name of the role to describe.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of dictionaries containing the permissions assigned to the role.

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

# 3. Describe the role
client.describe_role(role_name="read_only")
```

## Related methods{#related-methods}

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_role()](./Authentication-revoke_role)


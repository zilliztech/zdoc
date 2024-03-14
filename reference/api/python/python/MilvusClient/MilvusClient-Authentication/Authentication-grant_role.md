---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-grant_role
beta: false
notebook: false
type: docx
token: DsnpdZuDGo77TYxFuYvcDpOgnIf
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# grant_role()

This operation grants a role to a user.

## Request syntax{#request-syntax}

```python
grant_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __user_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing user.

- __role_name__ (_str_) -

    __[REQUIRED]__

    The name of the role to assign.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

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

# 2. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")
```

<Admonition type="info" icon="📘" title="Notes">

<p>Each Zilliz Cloud cluster has three built-in roles, namely, <strong>db_ro</strong>, <strong>db_rw</strong>, and <strong>db_admin</strong>. For details, refer to <a href="/docs/user-roles#cluster-built-in-roles">Cluster Built-in Roles</a>.</p>

</Admonition>

## Related methods{#related-methods}

- [describe_role()](./Authentication-describe_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_role()](./Authentication-revoke_role)


---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "Updates user credential/description-related signature behavior. Async variant shares the sync method parameter and response contract. | Python | MilvusClient"
type: docx
token: Q8QIdA1DioRRL9xUtlgcCPLHnPc
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - update_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_password()

Updates user credential/description-related signature behavior. Async variant shares the sync method parameter and response contract.

## Request Syntax\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **user_name** (*str*) -
**[REQUIRED]**
The name of the user whose password is changed.

- **old_password** (*str*) -
**[REQUIRED]**
The current password of the user.

- **new_password** (*str*) -
**[REQUIRED]**
The new password for the user.

- **reset_connection** (*Optional[bool]*) -
Default: `False`
The flag that reconnects the client with the new password after the update.

- **timeout** (*Optional[float]*) -
Default: `None`
The maximum time, in seconds, to wait for the RPC to complete.

- **description** (*Optional[str]*) -
Default: `None`
The optional updated description of the user account.

- **kwargs** (*Any*) -
The additional request context options.

**RETURN TYPE:**

*None*

**RETURNS:**

Returns no value after the password is updated successfully.

**EXCEPTIONS:**

- **MilvusException**
Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

Demonstrates update password usage.

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
client.create_user("analyst", "Milvus123", description="Analytics account")
client.update_user("analyst", description="Updated analytics account")
client.create_role("read_only", description="Read-only role")
client.alter_role("read_only", description="Updated read-only role")
print(client.describe_user("analyst"))
print(client.describe_role("read_only"))
```

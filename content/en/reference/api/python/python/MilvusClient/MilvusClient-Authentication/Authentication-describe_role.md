---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the description and privileges of a specific role. | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

This operation returns the description and privileges of a specific role.

## Request Syntax\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> dict
```

**PARAMETERS:**

- **role_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The name of the role to describe.

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  The maximum time, in seconds, to wait for the RPC to complete.

- **kwargs** (*Any*) -<br/>
  The additional request context options.

**RETURN TYPE:**

*dict*

**RETURNS:**

Dictionary with role, description, and privileges.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

Demonstrates describe role usage.

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

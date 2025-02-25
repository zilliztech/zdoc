---
displayed_sidbar: pythonSidebar
title: "drop_user() | Python | MilvusClient"
slug: /python/python/Authentication-drop_user
sidebar_label: "drop_user()"
beta: false
notebook: false
description: "This operation drops a user. | Python | MilvusClient"
type: docx
token: WtyZdeFKMoSv5exaYRxcPLCSndg
sidebar_position: 9
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_user()
  - pymilvus25
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_user()

This operation drops a user.

## Request syntax{#request-syntax}

```python
drop_user(
    user_name: str,
    timeout: Optional[float] = None
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to drop.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

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

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Drop the user
client.drop_user(user_name="user_1")
```

## Related methods{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [list_users()](./Authentication-list_users)

- [update_password()](./Authentication-update_password)


---
displayed_sidbar: pythonSidebar
title: "create_user() | Python | MilvusClient"
slug: /python/python/Authentication-create_user
sidebar_label: "create_user()"
beta: false
notebook: false
description: "This operation creates a user. | Python | MilvusClient"
type: docx
token: BDupd28JqoNY9HxVOTfcv86enRe
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus25
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_user()

This operation creates a user.

## Request syntax{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the user to create.

- **password** (*str*) -

    **&#91;REQUIRED&#93;**

    The password of the user to create.

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
```


---
displayed_sidbar: pythonSidebar
title: "drop_privilege_group() | Python | MilvusClient"
slug: /python/python/Authentication-drop_privilege_group
sidebar_label: "drop_privilege_group()"
beta: false
notebook: false
description: "This operation drops the specified privilege group. | Python | MilvusClient"
type: docx
token: OxrMdOaVKoDUY5x2DlTcZO6GnHc
sidebar_position: 7
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_privilege_group()
  - pymilvus25
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_privilege_group()

This operation drops the specified privilege group.

## Request Syntax{#request-syntax}

```python
drop_privilege_group(
    self,
    group_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **group_name** (*str*) -

    The name of the target privilege group.

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

client.drop_privilege_group(
    group_name="my_privilege_group"
)
```


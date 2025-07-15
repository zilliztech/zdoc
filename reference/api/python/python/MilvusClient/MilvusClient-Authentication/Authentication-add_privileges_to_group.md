---
displayed_sidbar: pythonSidebar
title: "add_privileges_to_group() | Python | MilvusClient"
slug: /python/python/Authentication-add_privileges_to_group
sidebar_label: "add_privileges_to_group()"
beta: false
notebook: false
description: "This operation adds privileges to the specified privilege group. | Python | MilvusClient"
type: docx
token: MbTMdBf7Bow3k6xA4R4c7j1DnRd
sidebar_position: 1
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - add_privileges_to_group()
  - pymilvus25
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_privileges_to_group()

This operation adds privileges to the specified privilege group.

## Request Syntax{#request-syntax}

```python
add_privileges_to_group(
    self,
    group_name: str,
    privileges: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **group_name** (*str*) -

    The name of the target privilege group.

- **privileges** (*List[str]*) -

    The privilages to add in a list.

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

client.add_privileges_to_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
)
```


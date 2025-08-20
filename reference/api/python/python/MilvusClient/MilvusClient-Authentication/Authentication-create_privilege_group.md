---
displayed_sidbar: pythonSidebar
title: "create_privilege_group() | Python | MilvusClient"
slug: /python/python/Authentication-create_privilege_group
sidebar_label: "create_privilege_group()"
beta: false
notebook: false
description: "This operation creates a privilege group. | Python | MilvusClient"
type: docx
token: HNJqdocBjo2zm9xcIVdchRvcnab
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - create_privilege_group()
  - pymilvus25
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_privilege_group()

This operation creates a privilege group.

## Request Syntax{#request-syntax}

```python
create_privilege_group(
    self,
    group_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **group_name** (*str*) -

    The name of the target privilege group.

- **timeout** (*Optional&#91;float&#93;*) - 

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

client.create_privilege_group(
    group_name="my_privilege_group"
)
```


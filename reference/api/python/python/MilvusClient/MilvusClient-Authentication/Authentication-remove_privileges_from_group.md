---
displayed_sidbar: pythonSidebar
title: "remove_privileges_from_group() | Python | MilvusClient"
slug: /python/python/Authentication-remove_privileges_from_group
sidebar_label: "remove_privileges_from_group()"
beta: false
notebook: false
description: "This operation removes the specified privileges from a group. | Python | MilvusClient"
type: docx
token: IGPAdBQ5Von3lFxv4uSc5dGDnAd
sidebar_position: 16
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - remove_privileges_from_group()
  - pymilvus25
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# remove_privileges_from_group()

This operation removes the specified privileges from a group.

## Request Syntax{#request-syntax}

```python
remove_privileges_from_group(
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

    The privilages to remove in a list.

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

client.remove_privileges_to_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
)
```


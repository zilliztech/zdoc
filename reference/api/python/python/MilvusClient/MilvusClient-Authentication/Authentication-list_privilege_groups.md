---
title: "list_privilege_groups() | Python | MilvusClient"
slug: /python/python/Authentication-list_privilege_groups
sidebar_label: "list_privilege_groups()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all existing privilege groups. | Python | MilvusClient"
type: docx
token: N6kjdex5Ao0lRqxPXBhcxq4AnNh
sidebar_position: 13
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - list_privilege_groups()
  - pymilvus26
  - vector database
  - IVF
  - knn
  - Image Search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_privilege_groups()

This operation lists all existing privilege groups.

## Request Syntax\{#request-syntax}

```python
list_privilege_groups(
    self,
    timeout: Optional[float] = None,
    **kwargs,
) -> List[Dict[str, str]]
```

**PARAMETERS:**

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*List[Dict[str, str]]*

**RETURNS:**

A list of privilege group names.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

res = client.list_privilege_groups()

# ['my_privilege_group']
```


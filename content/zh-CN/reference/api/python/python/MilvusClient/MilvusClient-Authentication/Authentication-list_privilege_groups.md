---
displayed_sidbar: pythonSidebar
title: "list_privilege_groups() | Python | MilvusClient"
slug: /python/python/Authentication-list_privilege_groups
sidebar_label: "list_privilege_groups()"
added_since: v2.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all existing privilege groups. | Python | MilvusClient"
type: docx
token: N6kjdex5Ao0lRqxPXBhcxq4AnNh
sidebar_position: 13
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - list_privilege_groups()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_privilege_groups()

This operation lists all existing privilege groups.

## Request Syntax

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

## Example

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

res = client.list_privilege_groups()

# ['my_privilege_group']
```


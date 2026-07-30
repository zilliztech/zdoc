---
displayed_sidbar: pythonSidebar
title: "get_compact_state() | Python | MilvusClient"
slug: /python/python/Management-get_compact_state
sidebar_label: "get_compact_state()"
added_since: v2.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the status of the specified compaction job. | Python | MilvusClient"
type: docx
token: WEsjdspGLokueRxggM1cNFgknze
sidebar_position: 7
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - get_compact_state()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_compact_state()

This operation returns the status of the specified compaction job.

## Request Syntax

```python
get_compaction_state(
    self,
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> str
```

**PARAMETERS:**

- **job_id** (*int*) -

    The compaction job ID.

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*str*

**RETURNS:**

The state of the specified compaction job. Possible values are

- `UndefinedState`

- `Executing`

- `Completed`

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

client.get_compact_state(
    job_id=45389273892800
)

# Completed
```


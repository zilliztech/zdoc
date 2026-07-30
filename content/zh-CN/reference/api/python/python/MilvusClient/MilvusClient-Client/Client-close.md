---
displayed_sidbar: pythonSidebar
title: "close() | Python | MilvusClient"
slug: /python/python/Client-close
sidebar_label: "close()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation closes the current Milvus client. | Python | MilvusClient"
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# close()

This operation closes the current Milvus client.

## Request syntax

```python
close() -> None
```

**PARAMETERS:**

None

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**Exceptions:**

None

## Examples

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

# 2. Close the client
client.close()
```


---
title: "close() | Python | MilvusClient"
slug: /python/python/Client-close
sidebar_label: "close()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation closes the current Milvus client. | Python | MilvusClient"
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus26
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# close()

This operation closes the current Milvus client.

## Request syntax\{#request-syntax}

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

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Close the client
client.close()
```


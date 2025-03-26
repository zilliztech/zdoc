---
displayed_sidbar: pythonSidebar
title: "close() | Python | MilvusClient"
slug: /python/python/Client-close
sidebar_label: "close()"
beta: false
notebook: false
description: "This operation closes the current Milvus client. | Python | MilvusClient"
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus25
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# close()

This operation closes the current Milvus client.

## Request syntax{#request-syntax}

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

## Examples{#examples}

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


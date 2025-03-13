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
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus25
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
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


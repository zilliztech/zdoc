---
displayed_sidbar: pythonSidebar
title: "flush() | Python | MilvusClient"
slug: /python/python/Management-flush
sidebar_label: "flush()"
added_since: v2.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation flushes the streaming data and seals segments. It is recommended to call this operation after all the data has been inserted into a collection. | Python | MilvusClient"
type: docx
token: JnPrdOiPyo2e5gxzzFycbnvwnSd
sidebar_position: 6
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# flush()

This operation flushes the streaming data and seals segments. It is recommended to call this operation after all the data has been inserted into a collection.

## Request Syntax

```python
flush(
    self,
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

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

## Example

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

client.flush(
    collection_name="collection_name"
)
```


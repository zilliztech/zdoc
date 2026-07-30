---
displayed_sidbar: pythonSidebar
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
added_since: v2.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection. | Python | MilvusClient"
type: docx
token: BThKd2QThoQKGPx1ofKczmADnC6
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# compact()

This operation compacts the collection by merging small segments into larger ones. It is recommended to call this operation after inserting a large amount of data into a collection.

## Request Syntax

```python
compact(
    self,
    collection_name: str,
    is_clustering: Optional[bool] = False,
    timeout: Optional[float] = None,
    **kwargs,
) -> int
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **timeout** (*Optional[float]*) - 

    The timeout duration for this operation.

    Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*int*

**RETURNS:**

A compaction job ID, which can be used to get the compaction status.

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

client.compact(
    collection_name="collection_name"
)
```


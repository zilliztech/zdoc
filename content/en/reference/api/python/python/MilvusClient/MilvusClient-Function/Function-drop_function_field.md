---
title: "drop_function_field() | Python | MilvusClient"
slug: /python/python/Function-drop_function_field
sidebar_label: "drop_function_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes a function field from an existing collection it drops the bound function, the field, and its backing index. | Python | MilvusClient"
type: docx
token: UxyedGPErolaikxcssgc2IF1nAh
sidebar_position: 7
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_function_field()

This operation removes a function field from an existing collection: it drops the bound function, the field, and its backing index.

## Request Syntax\{#request-syntax}

```python
drop_function_field(
    collection_name: str,
    function_name: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **function_name** (*str*) -

    The name of the function whose output field should be dropped.

- **timeout** (*float | None*) -

    Default: `None`

    The timeout in seconds for this operation.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.drop_function_field(
    collection_name="docs",
    function_name="bm25_sparse",
)
```

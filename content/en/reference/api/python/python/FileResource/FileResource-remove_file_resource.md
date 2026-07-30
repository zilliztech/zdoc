---
title: "remove_file_resource() | Python"
slug: /python/python/FileResource-remove_file_resource
sidebar_label: "remove_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Removes a file resource previously registered via `addfileresource()` from the Milvus cluster. The call is idempotent removing a name that is not currently registered completes successfully without raising an exception. | Python"
type: docx
token: DLsXdlRA3odugzx4sIccnBVKn0d
sidebar_position: 3
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - remove_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_file_resource()

Removes a file resource previously registered via `add_file_resource()` from the Milvus cluster. The call is idempotent: removing a name that is not currently registered completes successfully without raising an exception.

## Request syntax\{#request-syntax}

```python
remove_file_resource(
    name: str,
    timeout: float | None = None,
    **kwargs
)
```

**PARAMETERS**:

- **name** (*str*) -
 The name of the resource to remove, as originally passed to `add_file_resource()`.

- **timeout** (*float* | *None*) -
 The timeout duration (in seconds) for this operation. A value of `None` indicates that no timeout is applied.

**RETURNS**:

*None*

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.remove_file_resource(name="zh_terms")

# Removing a name that is not currently registered is a no-op.
client.remove_file_resource(name="already_gone")
```


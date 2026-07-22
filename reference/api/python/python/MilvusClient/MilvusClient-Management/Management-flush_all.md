---
title: "flush_all() | Python | MilvusClient"
slug: /python/python/Management-flush_all
sidebar_label: "flush_all()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation flushes all collections in the current database. This ensures all inserted data is written to persistent storage. | Python | MilvusClient"
type: docx
token: QejKdv2qKo97mQxEV0CcaSM5nLh
sidebar_position: 17
keywords: 
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
  - zilliz
  - zilliz cloud
  - cloud
  - flush_all()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush_all()

This operation flushes all collections in the current database. This ensures all inserted data is written to persistent storage.

<Admonition type="info" icon="📘" title="Notes">

This only applies to managed collections.

</Admonition>

## Request syntax\{#request-syntax}

```python
client.flush_all(
    timeout: float = None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Flush all collections
client.flush_all()
```

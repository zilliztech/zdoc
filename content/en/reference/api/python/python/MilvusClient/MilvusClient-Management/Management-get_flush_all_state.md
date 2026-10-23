---
title: "get_flush_all_state() | Python | MilvusClient"
slug: /python/python/Management-get_flush_all_state
sidebar_label: "get_flush_all_state()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns whether a flush-all operation has completed. Use this after calling `flushall()` to check the flush status. | Python | MilvusClient"
type: docx
token: Y1ZHdwi2wotA3wxwZGsc0Nsnnvc
sidebar_position: 20
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - get_flush_all_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_flush_all_state()

This operation returns whether a flush-all operation has completed. Use this after calling `flush_all()` to check the flush status.

<Admonition type="info" title="Notes">

This only applies to managed collections.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.get_flush_all_state(
    flush_all_ts: int,
    timeout: float = None
) -> bool
```

**PARAMETERS:**

- **flush_all_ts** (*int*) -

    **[REQUIRED]**

    The timestamp returned by the flush-all operation that identifies the target flush-all round.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.flush_all()

# Check if flush completed
is_done = client.get_flush_all_state(flush_all_ts=0)
print(is_done)  # True or False
```

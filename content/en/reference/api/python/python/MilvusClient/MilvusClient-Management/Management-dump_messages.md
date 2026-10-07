---
title: "dump_messages() | Python | MilvusClient"
slug: /python/python/Management-dump_messages
sidebar_label: "dump_messages()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation dumps the messages of a physical channel between the given message IDs and timeticks. | Python | MilvusClient"
type: docx
token: W2HMdGNjrokVNvxQqYEcFR5Yn4g
sidebar_position: 16
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - dump_messages()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# dump_messages()

This operation dumps the messages of a physical channel between the given message IDs and timeticks.

## Request Syntax\{#request-syntax}

```python
dump_messages(
    pchannel: str,
    start_message_id: Dict,
    start_timetick: int = 0,
    end_timetick: int = 0,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **pchannel** (*str*) -

    **[REQUIRED]**

    The name of the physical channel from which to dump messages.

- **start_message_id** (*Dict*) -

    **[REQUIRED]**

    The starting write-ahead-log position, expressed as an object with `id` and `wal_name`. The `message_id` from `get_replicate_info()` can be passed directly.

- **start_timetick** (*int*) -

    The inclusive lower timetick bound. Use `0` to omit the lower bound.

- **end_timetick** (*int*) -

    The inclusive upper timetick bound. Use `0` to keep streaming until the RPC is cancelled.

- **timeout** (*Optional[float]*) -

    The maximum time, in seconds, allowed for the entire stream.

- **kwargs** (*Any*) -

    The additional keyword arguments passed to the underlying client or request.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
messages = client.dump_messages(
    pchannel="by-dev-rootcoord-dml_0_449019091。",
    start_message_id={},
)
```

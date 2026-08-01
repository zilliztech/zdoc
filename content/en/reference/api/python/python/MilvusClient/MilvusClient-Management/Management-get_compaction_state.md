---
title: "get_compaction_state() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_state
sidebar_label: "get_compaction_state()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns the current state of a compaction job. Use this after calling `compact()` to verify that compaction has completed. | Python | MilvusClient"
type: docx
token: MSDVdu103obklexX8GvcW5cWnCf
sidebar_position: 19
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_state()

This operation returns the current state of a compaction job. Use this after calling `compact()` to verify that compaction has completed.

<Admonition type="info" icon="📘" title="Notes">

This method was previously named `get_compact_state()`. The behavior is identical.

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

This only applies to managed collections.

</Admonition>

## Request syntax\{#request-syntax}

```python
client.get_compaction_state(
    job_id: int,
    timeout: float = None
) -> str
```

**PARAMETERS:**

- **job_id** (*int*) -

    **[REQUIRED]**

    The ID of the compaction job returned by `compact()`.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*str*

**RETURNS:**

The state name of the compaction job. Possible values are `"UndefiedState"`, `"Executing"`, and `"Completed"`.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when the job ID is invalid or the server encounters an error.

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Start compaction and check its state
job_id = client.compact(collection_name="my_collection")
state = client.get_compaction_state(job_id=job_id)
print(state)  # "Executing" or "Completed"
```


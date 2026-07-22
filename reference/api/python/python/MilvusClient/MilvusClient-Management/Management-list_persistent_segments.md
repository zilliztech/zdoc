---
title: "list_persistent_segments() | Python | MilvusClient"
slug: /python/python/Management-list_persistent_segments
sidebar_label: "list_persistent_segments()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all persistent (flushed) segments for a collection, including information about row count, sort status, and storage level. | Python | MilvusClient"
type: docx
token: QsGNdp1t3oHaunxgIZGc3PdSnof
sidebar_position: 25
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - list_persistent_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_persistent_segments()

This operation lists all persistent (flushed) segments for a collection, including information about row count, sort status, and storage level.

<Admonition type="info" icon="📘" title="Notes">

This only applies to managed collections.

</Admonition>

## Request syntax\{#request-syntax}

```python
client.list_persistent_segments(
    collection_name: str,
    timeout: float = None
) -> List[SegmentInfo]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*List[SegmentInfo]*

**RETURNS:**

A list of persistent segment information objects containing segment_id, collection_id, collection_name, num_rows, is_sorted, state, level, and storage_version.

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

segments = client.list_persistent_segments(collection_name="my_collection")
for seg in segments:
    print(f"Segment {seg.segment_id}: {seg.num_rows} rows, level={seg.level}")
```

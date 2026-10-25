---
title: "list_persistent_segments() | Python | MilvusClient"
slug: /python/python/Management-list_persistent_segments
sidebar_label: "list_persistent_segments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all persistent (flushed) segments for a collection, including information about row count, sort status, and storage level. | Python | MilvusClient"
type: docx
token: EvBwdrnRHoExdlxVKcLcZyeQnHg
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

---

import Admonition from '@theme/Admonition';


# list_persistent_segments()

This operation lists all persistent (flushed) segments for a collection, including information about row count, sort status, and storage level.

<Admonition type="info" title="Notes">

This only applies to managed collections.

</Admonition>

## Request Syntax\{#request-syntax}

```python
list_persistent_segments(
    collection_name: str,
    timeout: Optional[float] = None,
    states: Optional[Sequence[SegmentState]] = None,
    **kwargs
) -> List[SegmentInfo]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list[SegmentInfo]*

**RETURNS:**

A list of persistent segment information objects. Each SegmentInfo object carries the members listed below.

**PARAMETERS:**

- **segment_id** (*int*) -

    The ID of the segment.

- **collection_id** (*int*) -

    The ID of the collection that the segment belongs to.

- **collection_name** (*str*) -

    The name of the collection that the segment belongs to.

- **num_rows** (*int*) -

    The number of rows in the segment.

- **is_sorted** (*bool*) -

    The flag indicating whether the data in the segment is sorted.

- **state** (*SegmentState*) -

    The lifecycle state of the segment.

- **level** (*SegmentLevel*) -

    The storage level of the segment.

- **storage_version** (*int*) -

    The storage version of the segment.

- **partition_id** (*int*) -

    The ID of the partition that the segment belongs to. Available in PyMilvus v3.0.2 or later.

- **insert_channel** (*str*) -

    The insert channel that the segment data was written to. Available in PyMilvus v3.0.2 or later.

- **compaction_from** (*list[int]*) -

    The IDs of the segments that this segment was compacted from. Available in PyMilvus v3.0.2 or later.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, SegmentState

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
segments = client.list_persistent_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
```

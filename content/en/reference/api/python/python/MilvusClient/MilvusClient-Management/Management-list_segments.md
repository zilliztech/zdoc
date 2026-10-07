---
title: "list_segments() | Python | MilvusClient"
slug: /python/python/Management-list_segments
sidebar_label: "list_segments()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists a collection's segments still retained in the requested lifecycle states. | Python | MilvusClient"
type: docx
token: XQaYdrunfo03uZxNvv9csRTGnYc
sidebar_position: 28
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list_segments()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_segments()

This operation lists a collection's segments still retained in the requested lifecycle states.

## Request Syntax\{#request-syntax}

```python
list_segments(
    collection_name: str,
    states: Optional[Sequence[SegmentState]] = None,
    timeout: Optional[float] = None,
    **kwargs
) -> List[SegmentInfo]
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **states** (*Sequence[SegmentState] | None*) -

    Default: `None`

    The lifecycle states to filter by, such as a list containing SegmentState.Sealed. All retained states are returned when omitted.

- **timeout** (*float | None*) -

    Default: `None`

    The timeout in seconds for this operation.

**RETURN TYPE:**

*list[SegmentInfo]*

**RETURNS:**

A list of SegmentInfo objects describing the retained segments, including each segment's identifier and lifecycle state.

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
segments = client.list_segments(
    collection_name="docs",
    states=[SegmentState.Sealed],
)
for s in segments:
    print(
        s.segment_id,
        s.state,
    )
```

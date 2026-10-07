---
title: "list_compaction_tasks() | Python | MilvusClient"
slug: /python/python/Management-list_compaction_tasks
sidebar_label: "list_compaction_tasks()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all compaction tasks still retained for a collection. | Python | MilvusClient"
type: docx
token: G3gAdImCAoH7wCxiur7co8JTnz8
sidebar_position: 27
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - list_compaction_tasks()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_compaction_tasks()

This operation lists all compaction tasks still retained for a collection.

## Request Syntax\{#request-syntax}

```python
list_compaction_tasks(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> CompactionPlans
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **timeout** (*float | None*) -

    Default: `None`

    The timeout in seconds for this operation.

**RETURN TYPE:**

*CompactionPlans*

**RETURNS:**

A CompactionPlans object whose plans list carries the retained compaction tasks. Each plan exposes its identifiers and a task state from the CompactionTaskState enum (such as Executing, Completed, Failed, or Timeout). The response also carries the collection name.

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection that the listed tasks belong to.

- **state** (*State*) -

    The overall state of the compaction job. Possible values are UndefiedState, Executing, and Completed.

- **plans** (*list[Plan]*) -

    The retained compaction tasks. Each Plan object carries the members listed below.

    - **plan_id** (*int*) -

        The ID of this compaction task.

    - **task_id** (*int*) -

        An alias of plan_id.

    - **trigger_id** (*int*) -

        The ID of the compaction trigger.

    - **collection_id** (*int*) -

        The ID of the collection being compacted.

    - **partition_id** (*int*) -

        The ID of the partition being compacted.

    - **channel** (*str*) -

        The insert channel that the segments belong to.

    - **compaction_type** (*CompactionType*) -

        The type of this compaction.

    - **state** (*CompactionTaskState*) -

        The state of this compaction task.

    - **failure_reason** (*str*) -

        The reason why this task failed, or an empty string.

    - **sources** (*list*) -

        The IDs of the source segments to merge.

    - **target** (*int*) -

        The ID of the target segment.

    - **targets** (*list[int]*) -

        The IDs of the target segments. Falls back to target when the server does not return multiple targets.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
plans = client.list_compaction_tasks(collection_name="docs")
print(
    plans.collection_name,
    len(plans.plans),
)
```

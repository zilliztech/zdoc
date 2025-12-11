---
title: "hybridts_to_datetime() | Python | ORM"
slug: /python/python/utility-hybridts_to_datetime
sidebar_label: "hybridts_to_datetime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation converts a hybrid timestamp to a Python's datetime object. | Python | ORM"
type: docx
token: EBAFdcmoKoNJISxM8i1cqXzRn9H
sidebar_position: 19
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - hybridts_to_datetime()
  - pymilvus26
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybridts_to_datetime()

This operation converts a hybrid timestamp to a Python's datetime object.

## Request Syntax\{#request-syntax}

```python
hybridts_to_datetime(
    hybridts: int,
    tz: datetime.timezone | None,
)
```

**PARAMETERS:**

- **hybridts** (*int*) -

    **[REQUIRED]**

    A hybrid timestamp.

- **tz** (*datetime.timezone*) -

    A **datetime.timezone** object.

**RETURNS:**
A **datetime.datetime** object.

**EXCEPTIONS:**

N/A

**EXAMPLE:**

```python
import time
from pymilvus import utility

epoch_t = time.time()

ts = utility.mkts_from_unixtime(epoch_t)

d = utility.hybridts_to_datetime(ts)
```

## Related operations\{#related-operations}

The following operations are related to `hybridts_to_datetime()`:

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


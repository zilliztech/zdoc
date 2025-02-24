---
displayed_sidbar: pythonSidebar
title: "mkts_from_hybridts() | Python | ORM"
slug: /python/python/utility-mkts_from_hybridts
sidebar_label: "mkts_from_hybridts()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation makes a hybrid timestamp from another hybrid timestamp. | Python | ORM"
type: docx
token: GRarduHPSoFY3Yx9EWRcdcTfn1g
sidebar_position: 35
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - mkts_from_hybridts()
  - pymilvus25
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# mkts_from_hybridts()

This operation makes a hybrid timestamp from another hybrid timestamp.

## Request Syntax{#request-syntax}

```python
mkts_from_hybridts(
    hybridts: int,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**PARAMETERS:**

- **hybridts** (*float*) -

    **[REQUIRED]**

    A hybrid timestamp.

    A hybrid timestamp is a non-negative integer ranging from **0** to **18446744073709551615**.

- **milliseconds** (*float*) -
An incremental time interval in milliseconds.

- **delta** (*Optional[timedelta]*) -

    A **datetime.timedelta** object that represents the duration expressing the difference between two `date`, `time`, or `datetime` instances to microsecond resolution.

**RETURN TYPE:**

*int*

**RETURNS:**
A hybrid timestamp, which is a non-negative integer ranging from **0** to **18446744073709551615**.

## **Examples**{#examples}

```python
import time
from datetime import timedelta
from pymilvus import utility

# Get a UNIX epoch timestamp
epoch1 = time.time()

# Make a hybrid timestamp
ts = utility.mkts_from_unixtime(epoch1)

# Set up a timedelta object
delta = timedelta(
    days=50,
    seconds=27,
    microseconds=10,
    milliseconds=29000,
    minutes=5,
    hours=8,
    weeks=2
)

# Get a hybrid timestamp
mkts_from_hybridts(
    hybridts=ts,
    milliseconds=1000,
    delta=delta,
)
```

## Related operations{#related-operations}

The following operations are related to `mkts_from_hybridts()`:

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


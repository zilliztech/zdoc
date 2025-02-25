---
displayed_sidbar: pythonSidebar
title: "mkts_from_datetime() | Python | ORM"
slug: /python/python/utility-mkts_from_datetime
sidebar_label: "mkts_from_datetime()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation makes a hybrid timestamp from a Python's datetime.datetime object. | Python | ORM"
type: docx
token: LCQTdebkConhUqxwnk7c3EbPnWh
sidebar_position: 34
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - mkts_from_datetime()
  - pymilvus25
  - IVF
  - knn
  - Image Search
  - LLMs
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# mkts_from_datetime()

This operation makes a hybrid timestamp from a Python's **datetime.datetime** object.

## Request Syntax{#request-syntax}

```python
mkts_from_datetime(
    d_time: datetime,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**PARAMETERS:**

- **d_time** (*datetime*) -
**[REQUIRED]**
A **datetime.datetime** object.

- **milliseconds** (*float*) -
An incremental time interval in milliseconds.

- **delta** (*Optional[timedelta]*) -

    A **datetime.timedelta** object that represents the duration expressing the difference between two `date`, `time`, or `datetime` instances to microsecond resolution.

**RETURN TYPE:**

*int*

**RETURNS:**
A hybrid timestamp, which is a non-negative integer ranging from **0** to **18446744073709551615**.

## Examples{#examples}

```python
from datetime import datetime, timedelta
from pymilvus import utility

ts = mkts_from_datetime(
    d_time=datetime.now(),
    milliseconds=0.0,
    delta=None,
)
```

## Related operations{#related-operations}

The following operations are related to `mkts_from_datetime()`:

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


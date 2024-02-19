---
displayed_sidbar: pythonSidebar
slug: /python/utility-mkts_from_datetime
beta: false
notebook: false
token: LCQTdebkConhUqxwnk7c3EbPnWh
sidebar_position: 41
---

import Admonition from '@theme/Admonition';


# mkts_from_datetime()

This operation makes a hybrid timestamp from a Python's **datetime.datetime** object.

```python
pymilvus.utility.mkts_from_datetime(
    d_time: datetime,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

The following operations are related to `mkts_from_datetime()`:

- mkts_from_unixtime()

- mkts_from_hybridts()

- hybridts_to_datetime()

- hybridts_to_unixtime()

See also the Python SDK Reference.

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from datetime import datetime, timedelta
from pymilvus import utility

utility.mkts_from_datetime(
    d_time=datetime.now(),
    milliseconds=0.0,
    delta=datetime.timedelta()
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


---
displayed_sidbar: pythonSidebar
slug: /python/utility-mkts_from_datetime
beta: false
notebook: false
token: LCQTdebkConhUqxwnk7c3EbPnWh
sidebar_position: 34
---

import Admonition from '@theme/Admonition';


# mkts_from_datetime()

This operation makes a hybrid timestamp from a Python's __datetime.datetime__ object.

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

__PARAMETERS:__

- __d_time__ (_datetime_) -
__[REQUIRED]__
A __datetime.datetime__ object.

- __milliseconds__ (_float_) -
An incremental time interval in milliseconds.

- __delta__ (_Optional[timedelta]_) -

    A __datetime.timedelta__ object that represents the duration expressing the difference between two `date`, `time`, or `datetime` instances to microsecond resolution.

__RETURN TYPE:__

_int_

__RETURNS:__
A hybrid timestamp, which is a non-negative integer ranging from __0__ to __18446744073709551615__.

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


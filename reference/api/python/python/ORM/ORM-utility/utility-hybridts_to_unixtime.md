---
displayed_sidbar: pythonSidebar
title: "hybridts_to_unixtime() | Python | ORM"
slug: /python/python/utility-hybridts_to_unixtime
sidebar_label: "hybridts_to_unixtime()"
beta: false
notebook: false
description: "This operation converts a hybrid timestamp to a UNIX epoch timestamp | Python | ORM"
type: docx
token: HbMMdqtQGoQqwixsyrjcTTh0nu5
sidebar_position: 20
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# hybridts_to_unixtime()

This operation converts a hybrid timestamp to a UNIX epoch timestamp

## Request Syntax{#request-syntax}

```python
hybridts_to_unixtime(
    hybridts: int,
)
```

**PARAMETERS:**

- **hybridts** (*int*) -

    **[REQUIRED]**

    A hybrid timestamp.

    A hybrid timestamp is a non-negative integer ranging from **0** to **18446744073709551615**.

**RETURN TYPE:**

*float*

**RETURNS:**
A UNIX epoch time, which is an integer that represents the time elapsed since January 1, 1970 (midnight UTC/GMT) in seconds.

## **Examples**{#examples}

```python
import time
from pymilvus import utility

# Get a UNIX epoch timestamp
epoch1 = time.time()

# Make a hybrid timestamp
ts = utility.mkts_from_unixtime(epoch1)

# Converts the hybrid timestamp to a UNIX epoch timestamp
epoch2 = utility.hybridts_to_unixtime(ts)

# Asserts the equation
assert epoch1 == epoch2
```

## Related operations{#related-operations}

The following operations are related to `hybridts_to_unixtime()`:

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


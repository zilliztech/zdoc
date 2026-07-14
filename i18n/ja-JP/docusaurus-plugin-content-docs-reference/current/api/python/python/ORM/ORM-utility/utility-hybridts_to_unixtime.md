---
title: "hybridts_to_unixtime() | Python | ORM"
slug: /python/python/utility-hybridts_to_unixtime
sidebar_label: "hybridts_to_unixtime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は hybrid timestamp を UNIX epoch timestamp に変換します | Python | ORM"
type: docx
token: HbMMdqtQGoQqwixsyrjcTTh0nu5
sidebar_position: 20
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - hybridts_to_unixtime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybridts_to_unixtime()

この操作は hybrid timestamp を UNIX epoch timestamp に変換します

## Request Syntax\{#request-syntax}

```python
hybridts_to_unixtime(
    hybridts: int,
)
```

**PARAMETERS:**

- **hybridts** (*int*) -

    **[REQUIRED]**

    hybrid timestamp。

    hybrid timestamp は、**0** から **18446744073709551615** までの非負整数です。

**RETURN TYPE:**

*float*

**RETURNS:**
UNIX epoch time。これは、1970年1月1日（UTC/GMT の午前0時）から経過した時間を秒単位で表す整数です。

## **Examples**\{#examples}

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

## Related operations\{#related-operations}

次の操作は `hybridts_to_unixtime()` に関連しています。

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


---
title: "hybridts_to_datetime() | Python | ORM"
slug: /python/python/utility-hybridts_to_datetime
sidebar_label: "hybridts_to_datetime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、hybrid timestamp を Python の datetime object に変換します。 | Python | ORM"
type: docx
token: EBAFdcmoKoNJISxM8i1cqXzRn9H
sidebar_position: 19
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - hybridts_to_datetime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybridts_to_datetime()

この操作は、hybrid timestamp を Python の datetime object に変換します。

## リクエスト構文\{#request-syntax}

```python
hybridts_to_datetime(
    hybridts: int,
    tz: datetime.timezone | None,
)
```

**パラメータ:**

- **hybridts** (*int*) -

    **[必須]**

    hybrid timestamp。

- **tz** (*datetime.timezone*) -

    **datetime.timezone** object。

**戻り値:**
**datetime.datetime** object。

**例外:**

該当なし

**例:**

```python
import time
from pymilvus import utility

epoch_t = time.time()

ts = utility.mkts_from_unixtime(epoch_t)

d = utility.hybridts_to_datetime(ts)
```

## 関連操作\{#related-operations}

以下の操作は `hybridts_to_datetime()` に関連しています。

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


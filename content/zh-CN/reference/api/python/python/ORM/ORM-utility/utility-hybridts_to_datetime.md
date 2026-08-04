---
title: "hybridts_to_datetime() | Python | ORM"
slug: /python/python/utility-hybridts_to_datetime
sidebar_label: "hybridts_to_datetime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将混合时间戳转换为 Python 的 datetime 对象。 | Python | ORM"
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

此操作将混合时间戳转换为 Python 的 datetime 对象。

## 请求语法\{#request-syntax}

```python
hybridts_to_datetime(
    hybridts: int,
    tz: datetime.timezone | None,
)
```

**参数：**

- **hybridts** (*int*) -

    **[必需]**

    一个混合时间戳。

- **tz** (*datetime.timezone*) -

    一个 **datetime.timezone** 对象。

**返回：**
一个 **datetime.datetime** 对象。

**异常：**

N/A

**示例：**

```python
import time
from pymilvus import utility

epoch_t = time.time()

ts = utility.mkts_from_unixtime(epoch_t)

d = utility.hybridts_to_datetime(ts)
```

## 相关操作\{#related-operations}

以下操作与 `hybridts_to_datetime()` 相关：

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


---
title: "hybridts_to_unixtime() | Python | ORM"
slug: /python/python/utility-hybridts_to_unixtime
sidebar_label: "hybridts_to_unixtime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将混合时间戳转换为 UNIX 纪元时间戳 | Python | ORM"
type: docx
token: HbMMdqtQGoQqwixsyrjcTTh0nu5
sidebar_position: 20
keywords: 
  - Chroma 与 Milvus 对比
  - Annoy 向量搜索
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

此操作会将混合时间戳转换为 UNIX 纪元时间戳

## 请求语法\{#request-syntax}

```python
hybridts_to_unixtime(
    hybridts: int,
)
```

**参数：**

- **hybridts** (*int*) -

    **[必需]**

    一个混合时间戳。

    混合时间戳是一个非负整数，取值范围为 **0** 到 **18446744073709551615**。

**返回类型：**

*float*

**返回：**
UNIX 纪元时间，它是一个整数，表示自 1970 年 1 月 1 日（UTC 午夜/GMT)起经过的时间，以秒为单位。

## **示例**\{#examples}

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

## 相关操作\{#related-operations}

以下操作与 `hybridts_to_unixtime()` 相关：

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


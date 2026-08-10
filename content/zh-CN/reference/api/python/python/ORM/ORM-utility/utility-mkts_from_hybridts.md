---
title: "mkts_from_hybridts() | Python | ORM"
slug: /python/python/utility-mkts_from_hybridts
sidebar_label: "mkts_from_hybridts()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据另一个混合时间戳生成一个混合时间戳。 | Python | ORM"
type: docx
token: GRarduHPSoFY3Yx9EWRcdcTfn1g
sidebar_position: 35
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - zilliz
  - zilliz cloud
  - 云
  - mkts_from_hybridts()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# mkts_from_hybridts()

此操作根据另一个混合时间戳生成一个混合时间戳。

## 请求语法\{#request-syntax}

```python
mkts_from_hybridts(
    hybridts: int,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**参数：**

- **hybridts** (*float*) -

    **[必需]**

    一个混合时间戳。

    混合时间戳是一个非负整数，范围为 **0** 到 **18446744073709551615**。

- **milliseconds** (*float*) -<br/>
  以毫秒为单位的增量时间间隔。

- **delta** (*Optional[timedelta]*) -

    一个 **datetime.timedelta** 对象，表示两个 [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time) 或 [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) 实例之间差异时长的对象，精确到微秒。

**返回类型：**

*int*

**返回：**
一个混合时间戳，它是一个非负整数，范围为 **0** 到 **18446744073709551615**。

## **示例**\{#examples}

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

## 相关操作\{#related-operations}

以下操作与 `mkts_from_hybridts()` 相关：

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


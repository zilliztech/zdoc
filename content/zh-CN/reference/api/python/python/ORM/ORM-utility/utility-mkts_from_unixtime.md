---
title: "mkts_from_unixtime() | Python | ORM"
slug: /python/python/utility-mkts_from_unixtime
sidebar_label: "mkts_from_unixtime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据 UNIX 纪元时间戳转换为混合时间戳。 | Python | ORM"
type: docx
token: ZdKEd2ua6o9AHHxKq25ctNSdncb
sidebar_position: 36
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - mkts_from_unixtime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# mkts_from_unixtime()

此操作根据 UNIX 纪元时间戳转换为混合时间戳。

## 请求语法\{#request-syntax}

```python
mkts_from_unixtime(
    epoch: float,
    milliseconds: float = 0.0,
    delta: Optional[timedelta] = None,
)
```

```python
from pymilvus import utility

utility.mkts_from_unixtime(
    epoch=1704550236
    milliseconds=0.0
    delta=None
)
```

**参数：**

- **epoch** (*float*) -

    **[必需]**

    UNIX 纪元时间戳。

    UNIX 纪元时间戳是一个整数，表示自 1970 年 1 月 1 日（UTC/GMT 午夜）以来经过的秒数。

- **milliseconds** (*float*) -<br/>
  以毫秒为单位的增量时间间隔。

- **delta** (*Optional[timedelta]*) -

    表示一个 **datetime.timedelta** 对象，用于以微秒分辨率表示两个 [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time) 或 [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) 实例之间差值所对应的持续时间。

**返回类型：**

*int*

**返回：**
混合时间戳，即一个范围从 **0** 到 **18446744073709551615** 的非负整数。

## **示例**\{#examples}

```python
import time
from datetime import timedelta
from pymilvus import utility

# Get a UNIX epoch timestamp
epoch1 = time.time()

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
mkts_from_unixtime(
    epoch=epoch1,
    milliseconds=1000,
    delta=delta,
)
```

## 相关操作\{#related-operations}

以下操作与 `mkts_from_unixtime()` 相关：

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)


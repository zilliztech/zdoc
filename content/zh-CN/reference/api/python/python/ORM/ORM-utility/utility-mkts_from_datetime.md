---
title: "mkts_from_datetime() | Python | ORM"
slug: /python/python/utility-mkts_from_datetime
sidebar_label: "mkts_from_datetime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从 Python 的 **datetime.datetime** 对象生成混合时间戳。 | Python | ORM"
type: docx
token: LCQTdebkConhUqxwnk7c3EbPnWh
sidebar_position: 34
keywords: 
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - Annoy 向量搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - mkts_from_datetime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# mkts_from_datetime()

此操作从 Python 的 **datetime.datetime** 对象生成混合时间戳。

## 请求语法\{#request-syntax}

```python
mkts_from_datetime(
    d_time: datetime,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**参数：**

- **d_time** (*datetime*) -<br/>
  **[必需]**<br/>
  一个 **datetime.datetime** 对象。

- **milliseconds** (*float*) -<br/>
  以毫秒为单位的增量时间间隔。

- **delta** (*Optional[timedelta]*) -

    一个 **datetime.timedelta** 对象，表示两个 [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time) 或 [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) 实例之间差异所表示的持续时间，精确到微秒。

**返回类型：**

*int*

**返回：**
混合时间戳，是一个范围从 **0** 到 **18446744073709551615** 的非负整数。

## 示例\{#examples}

```python
from datetime import datetime, timedelta
from pymilvus import utility

ts = mkts_from_datetime(
    d_time=datetime.now(),
    milliseconds=0.0,
    delta=None,
)
```

## 相关操作\{#related-operations}

以下操作与 `mkts_from_datetime()` 相关：

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


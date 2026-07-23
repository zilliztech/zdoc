---
title: "mkts_from_unixtime() | Python | ORM"
slug: /python/python/utility-mkts_from_unixtime
sidebar_label: "mkts_from_unixtime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、UNIX エポックタイムスタンプからハイブリッドタイムスタンプに変換します。 | Python | ORM"
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

この操作は、UNIX エポックタイムスタンプからハイブリッドタイムスタンプに変換します。

## Request Syntax\{#request-syntax}

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

**PARAMETERS:**

- **epoch** (*float*) -

    **[REQUIRED]**

    UNIX エポックタイムスタンプです。

    UNIX エポックタイムスタンプは、1970 年 1 月 1 日（UTC/GMT の午前 0 時）から経過した時間を秒単位で表す整数です。

- **milliseconds** (*float*) -<br/>
  ミリ秒単位の増分時間間隔です。

- **delta** (*Optional[timedelta]*) -

    マイクロ秒精度で 2 つの [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time)、または [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) インスタンス間の差を表す期間を示す **datetime.timedelta** オブジェクトです。

**RETURN TYPE:**

*int*

**RETURNS:**
ハイブリッドタイムスタンプを返します。これは **0** から **18446744073709551615** の範囲の非負整数です。

## **Examples**\{#examples}

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

## Related operations\{#related-operations}

次の操作は `mkts_from_unixtime()` に関連しています。

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)


---
title: "mkts_from_hybridts() | Python | ORM"
slug: /python/python/utility-mkts_from_hybridts
sidebar_label: "mkts_from_hybridts()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、別のハイブリッドタイムスタンプからハイブリッドタイムスタンプを作成します。 | Python | ORM"
type: docx
token: GRarduHPSoFY3Yx9EWRcdcTfn1g
sidebar_position: 35
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - mkts_from_hybridts()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# mkts_from_hybridts()

この操作は、別のハイブリッドタイムスタンプからハイブリッドタイムスタンプを作成します。

## Request Syntax\{#request-syntax}

```python
mkts_from_hybridts(
    hybridts: int,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**PARAMETERS:**

- **hybridts** (*float*) -

    **[REQUIRED]**

    ハイブリッドタイムスタンプ。

    ハイブリッドタイムスタンプは、**0** から **18446744073709551615** までの非負整数です。

- **milliseconds** (*float*) -<br/>
  ミリ秒単位の増分時間間隔。

- **delta** (*Optional[timedelta]*) -

    2 つの [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time)、または [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) インスタンス間の差をマイクロ秒精度で表す期間を示す **datetime.timedelta** オブジェクト。

**RETURN TYPE:**

*int*

**RETURNS:**
ハイブリッドタイムスタンプ。これは、**0** から **18446744073709551615** までの非負整数です。

## **Examples**\{#examples}

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

## 関連操作\{#related-operations}

以下の操作は `mkts_from_hybridts()` に関連しています。

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


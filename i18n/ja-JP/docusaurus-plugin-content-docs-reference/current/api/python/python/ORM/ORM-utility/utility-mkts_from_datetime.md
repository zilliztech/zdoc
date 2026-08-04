---
title: "mkts_from_datetime() | Python | ORM"
slug: /python/python/utility-mkts_from_datetime
sidebar_label: "mkts_from_datetime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Python の datetime.datetime オブジェクトからハイブリッドタイムスタンプを作成します。 | Python | ORM"
type: docx
token: LCQTdebkConhUqxwnk7c3EbPnWh
sidebar_position: 34
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - mkts_from_datetime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# mkts_from_datetime()

この操作は、Python の **datetime.datetime** オブジェクトからハイブリッドタイムスタンプを作成します。

## リクエスト構文\{#request-syntax}

```python
mkts_from_datetime(
    d_time: datetime,
    milliseconds: float = 0.0,
    delta: datetime.timedelta | None,
)
```

**PARAMETERS:**

- **d_time** (*datetime*) -<br/>
  **[REQUIRED]**<br/>
  **datetime.datetime** オブジェクト。

- **milliseconds** (*float*) -<br/>
  ミリ秒単位の増分時間間隔。

- **delta** (*Optional[timedelta]*) -

    マイクロ秒精度で 2 つの [`date`](https://docs.python.org/3/library/datetime.html#datetime.date)、[`time`](https://docs.python.org/3/library/datetime.html#datetime.time)、または [`datetime`](https://docs.python.org/3/library/datetime.html#datetime.datetime) インスタンス間の差を表す期間を示す **datetime.timedelta** オブジェクト。

**RETURN TYPE:**

*int*

**RETURNS:**
ハイブリッドタイムスタンプ。これは **0** から **18446744073709551615** の範囲の非負整数です。

## 例\{#examples}

```python
from datetime import datetime, timedelta
from pymilvus import utility

ts = mkts_from_datetime(
    d_time=datetime.now(),
    milliseconds=0.0,
    delta=None,
)
```

## 関連操作\{#related-operations}

以下の操作は `mkts_from_datetime()` に関連しています。

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [hybridts_to_unixtime()](./utility-hybridts_to_unixtime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)


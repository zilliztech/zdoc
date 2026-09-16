---
title: "hybridts_to_unixtime() | Python | ORM"
slug: /python/python/utility-hybridts_to_unixtime
sidebar_label: "hybridts_to_unixtime()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、hybrid timestamp を UNIX epoch タイムスタンプに変換します。 | Python | ORM"
type: docx
token: HbMMdqtQGoQqwixsyrjcTTh0nu5
sidebar_position: 20
keywords: 
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - クラウド
  - hybridts_to_unixtime()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybridts_to_unixtime()

この操作は、hybrid timestamp を UNIX epoch タイムスタンプに変換します。

## リクエスト構文\{#request-syntax}

```python
hybridts_to_unixtime(
    hybridts: int,
)
```

**パラメータ:**

- **hybridts** (*int*) -

    **[必須]**

    hybrid timestamp。

    hybrid timestamp は、**0** から **18446744073709551615** までの非負整数です。

**戻り値の型:**

*float*

**戻り値:**
UNIX epoch タイムスタンプ。これは、1970年1月1日の午前0時 (UTC/GMT) からの経過時間を秒単位で表す整数です。

## 例\{#examples}

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

## 関連操作\{#related-operations}

以下の操作は `hybridts_to_unixtime()` に関連しています。

- [mkts_from_datetime()](./utility-mkts_from_datetime)

- [hybridts_to_datetime()](./utility-hybridts_to_datetime)

- [mkts_from_hybridts()](./utility-mkts_from_hybridts)

- [mkts_from_unixtime()](./utility-mkts_from_unixtime)

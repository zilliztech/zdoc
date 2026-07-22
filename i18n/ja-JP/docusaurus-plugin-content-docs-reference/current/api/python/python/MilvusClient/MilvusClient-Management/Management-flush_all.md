---
title: "flush_all() | Python | MilvusClient"
slug: /python/python/Management-flush_all
sidebar_label: "flush_all()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベース内のすべての collection を flush します。これにより、挿入されたすべてのデータが永続ストレージに書き込まれることが保証されます。 | Python | MilvusClient"
type: docx
token: QejKdv2qKo97mQxEV0CcaSM5nLh
sidebar_position: 17
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AIチャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - flush_all()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush_all()

この操作は、現在のデータベース内のすべての collection を flush します。これにより、挿入されたすべてのデータが永続ストレージに書き込まれることが保証されます。

<Admonition type="info" icon="📘" title="注意">

これは managed collection にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.flush_all(
    timeout: float = None
)
```

**パラメーター:**

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Flush all collections
client.flush_all()
```

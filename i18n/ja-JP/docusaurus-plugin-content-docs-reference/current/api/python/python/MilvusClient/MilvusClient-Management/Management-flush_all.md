---
title: "flush_all() | Python | MilvusClient"
slug: /python/python/Management-flush_all
sidebar_label: "flush_all()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在のデータベース内のすべてのコレクションをフラッシュします。これにより、挿入されたすべてのデータが永続ストレージに書き込まれることが保証されます。 | Python | MilvusClient"
type: docx
token: YaXGd43eqog2RExt8btcwxQOn0f
sidebar_position: 17
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
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

この操作は、現在のデータベース内のすべてのコレクションをフラッシュします。これにより、挿入されたすべてのデータが永続ストレージに書き込まれることが保証されます。

## リクエスト構文\{#request-syntax}

```python
client.flush_all(
    timeout: float = None
)
```

**パラメーター:**

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、いずれかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Flush all collections
client.flush_all()
```

---
title: "close() | Python | MilvusClient"
slug: /python/python/Client-close
sidebar_label: "close()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の Milvus クライアントを閉じます。 | Python | MilvusClient"
type: docx
token: CWZGd48FJoFHXYx40NMcTd2FnKc
sidebar_position: 1
keywords: 
  - Vector Dimension
  - ANN Search
  - ベクトル埋め込みとは
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - close()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# close()

この操作は現在の Milvus クライアントを閉じます。

## リクエスト構文\{#request-syntax}

```python
close() -> None
```

**パラメーター:**

なし

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

なし

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Close the client
client.close()
```


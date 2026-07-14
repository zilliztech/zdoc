---
title: "list_privilege_groups() | Python | MilvusClient"
slug: /python/python/Authentication-list_privilege_groups
sidebar_label: "list_privilege_groups()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のすべての privilege group を一覧表示します。 | Python | MilvusClient"
type: docx
token: N6kjdex5Ao0lRqxPXBhcxq4AnNh
sidebar_position: 13
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - list_privilege_groups()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_privilege_groups()

この操作は既存のすべての privilege group を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_privilege_groups(
    self,
    timeout: Optional[float] = None,
    **kwargs,
) -> List[Dict[str, str]]
```

**パラメータ:**

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間です。

    これを None に設定すると、いずれかのレスポンスが到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*List[Dict[str, str]]*

**戻り値:**

privilege group 名のリスト。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定された alias が存在しない場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

res = client.list_privilege_groups()

# ['my_privilege_group']
```


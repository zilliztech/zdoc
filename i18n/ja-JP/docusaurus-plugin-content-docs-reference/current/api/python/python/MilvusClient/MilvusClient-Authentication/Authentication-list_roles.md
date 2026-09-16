---
title: "list_roles() | Python | MilvusClient"
slug: /python/python/Authentication-list_roles
sidebar_label: "list_roles()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべてのカスタムロールを一覧表示します。 | Python | MilvusClient"
type: docx
token: MApVdDl17oU8OixzbMPcgceKnOh
sidebar_position: 14
keywords: 
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_roles()

この操作は、すべてのカスタムロールを一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_roles(
    timeout: Optional[float] = None
) -> dict
```

**パラメータ:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト期間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

ロール名のリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. List all roles
client.list_roles()

# ['db_admin', 'db_ro', 'db_rw']
```

<Admonition type="info" title="Notes">

各 Zilliz Cloud クラスターには、**db\_ro**、**db\_rw**、**db\_admin** という 3 つの組み込みロールがあります。詳細は、[クラスター Built-in Roles](/docs/cluster-roles#built-in-cluster-roles) を参照してください。

</Admonition>


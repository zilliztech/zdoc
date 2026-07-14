---
title: "drop_resource_group() | Python | ORM"
slug: /python/python/utility-drop_resource_group
sidebar_label: "drop_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はリソースグループを削除します。 | Python | ORM"
type: docx
token: EofGdftYjoQ9E6x8mxLcpbG1nhc
sidebar_position: 11
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - drop_resource_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_resource_group()

この操作はリソースグループを削除します。 

## リクエスト構文\{#request-syntax}

```python
drop_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **name** (*str*) -

    **[必須]**

    削除するリソースグループの名前。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Drop the created resource group
utility.drop_resource_group(
    name="rg_01",
    using="default"
)
```

## 関連する操作\{#related-operations}

以下の操作は `drop_resource_group()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)


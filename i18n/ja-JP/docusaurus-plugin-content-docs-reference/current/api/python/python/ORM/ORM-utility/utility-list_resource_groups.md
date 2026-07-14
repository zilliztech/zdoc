---
title: "list_resource_groups() | Python | ORM"
slug: /python/python/utility-list_resource_groups
sidebar_label: "list_resource_groups()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在接続されている Zilliz Cloud クラスター内のすべてのリソースグループを一覧表示します。 | Python | ORM"
type: docx
token: FXTZd5FgNo9ta0xvjaIclEM1nPf
sidebar_position: 26
keywords: 
  - 疎ベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - list_resource_groups()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_resource_groups()

この操作は、現在接続されている Zilliz Cloud クラスター内のすべてのリソースグループを一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_resource_groups(
    using: str,
    timeout: float | None,
)
```

**パラメーター:**

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**
すべてのリソースグループ名のリスト。

**例:**

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Create another resource group
utility.create_resource_group(
    name="rg_02",
    using="default"
)

# List all resource groups
utility.list_resource_groups(
    using="default"
) # ["__default_resource_group", "rg_01", "rg_02"]
```

## 関連操作\{#related-operations}

以下の操作は `list_resource_groups()` に関連しています。

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)


---
title: "list_grants() | Python | ORM"
slug: /python/python/Role-list_grants
sidebar_label: "list_grants()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールに付与されているすべての権限を一覧表示します。 | Python | ORM"
type: docx
token: YRoGdgQmWoIEaJx84ICcHTILnMe
sidebar_position: 8
keywords: 
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - list_grants()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_grants()

この操作は、現在のロールに付与されているすべての権限を一覧表示します。

## Request Syntax\{#request-syntax}

```python
list_grants(
    db_name: str
)
```

**PARAMETERS:**

- **db_name** (*str*)

    Zilliz Cloud がこの操作を実行するデータベースの名前。

    指定したデータベースが存在しない場合、空の結果が返されます。

**RETURN TYPE:**

*GrantInfo*

**RETURNS:**

**GrantItem** オブジェクトのリストを含む **GrantInfo** オブジェクト。

```python
├── GrantInfo
│   └── groups  
│       └── GrantItem
│           ├── object
│           ├── object_name
│           ├── role_name
│           ├── grantor_name
│           ├── privilege
│           └── db_name
```

**GrantItem** オブジェクトには以下のフィールドが含まれます:

**EXCEPTIONS:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が送出されます。

## Examples\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List all privileges granted to the current role.
res = list_grants(
    db_name="test_db"
)
```

## Related operations\{#related-operations}

以下の操作は `get_replicas()` に関連しています:

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [remove_user()](./Role-remove_user)


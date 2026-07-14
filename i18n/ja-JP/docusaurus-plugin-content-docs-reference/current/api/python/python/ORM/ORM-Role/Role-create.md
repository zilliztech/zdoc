---
title: "create() | Python | ORM"
slug: /python/python/Role-create
sidebar_label: "create()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在のロールを作成します。 | Python | ORM"
type: docx
token: G3h4d3jx6oXFHBxFZlyc9jLKnTO
sidebar_position: 2
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - zilliz
  - zilliz cloud
  - クラウド
  - create()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create()

この操作は現在のロールを作成します。 

## Request Syntax\{#request-syntax}

```python
create()
```

**PARAMETERS:**

なし

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

```python
from pymilvus import Role, utility

# Get an existing role
role = Role(name="test")

# Create a new role
role.create()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
# - RoleItem: <role_name:test>, <users:()>
```

## Related operations\{#related-operations}

以下の操作は `create()` に関連しています。

- [add_user()](./Role-add_user)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)


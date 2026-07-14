---
title: "drop() | Python | ORM"
slug: /python/python/Role-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のロールを削除します。指定されたロールが存在する場合、この操作は成功します。そうでない場合、この操作は失敗します。 | Python | ORM"
type: docx
token: KEzNdJPoDoHOjlx2FC8cNcHqngg
sidebar_position: 3
keywords: 
  - ANN Search
  - vector embeddings とは
  - vector database チュートリアル
  - vector databases の仕組み
  - zilliz
  - zilliz cloud
  - cloud
  - drop()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop()

この操作は既存のロールを削除します。指定されたロールが存在する場合、この操作は成功します。そうでない場合、この操作は失敗します。

## Request Syntax\{#request-syntax}

```python
drop()
```

**PARAMETERS:**

該当なし

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## Examples\{#examples}

```python
from pymilvus import Role, utility

# Create a new role
role = Role(name="test")

role.create()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:public>, <users:()>
# - RoleItem: <role_name:test>, <users:()>

# Drop the role
role.drop()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:public>, <users:()>
```

## Related operations\{#related-operations}

以下の操作は `drop()` に関連しています。

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)


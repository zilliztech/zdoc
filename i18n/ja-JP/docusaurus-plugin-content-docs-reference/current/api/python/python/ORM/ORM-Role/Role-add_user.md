---
title: "add_user() | Python | ORM"
slug: /python/python/Role-add_user
sidebar_label: "add_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のユーザーを現在のロールに追加します。追加されると、そのユーザーは現在のロールで許可されている権限を取得し、特定の操作を実行できるようになります。 | Python | ORM"
type: docx
token: W7GJdpYrYoYhSaxW6uzcVAZinYf
sidebar_position: 1
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - add_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_user()

この操作は、既存のユーザーを現在のロールに追加します。追加されると、そのユーザーは現在のロールで許可されている権限を取得し、特定の操作を実行できるようになります。

## リクエスト構文\{#request-syntax}

```python
add_user(
    username: str
)
```

**パラメーター:**

- **username** (*str*) -

    **[必須]**

    ロールに追加するユーザー名。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import Role, utility

# Create a user
user = utility.create_user(user="admin", password="123456")

# Create a role
role=Role(
    name="admin",
)

role.create()

# Add the user to the role
role.add_user(username="admin")

# List role information
utility.list_roles(include_user_info=True)

# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
```

## 関連する操作\{#related-operations}

`add_user()` に関連する操作は次のとおりです。

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


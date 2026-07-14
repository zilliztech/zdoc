---
title: "remove_user() | Python | ORM"
slug: /python/python/Role-remove_user
sidebar_label: "remove_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールからユーザーを削除します。削除されると、ユーザーは現在のロールで許可されている権限を失います。 | Python | ORM"
type: docx
token: SlmSdaD7rocMJsxThNHcOtEknVd
sidebar_position: 9
keywords: 
  - ベクターストア
  - オープンソース vector database
  - Vector index
  - オープンソース vector database
  - zilliz
  - zilliz cloud
  - cloud
  - remove_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_user()

この操作は、現在のロールからユーザーを削除します。削除されると、ユーザーは現在のロールで許可されている権限を失います。

## リクエスト構文\{#request-syntax}

```python
remove_user(
    username: str
)
```

**パラメータ:**

- **username** (*str*) -

    **[必須]**

    ロールから削除するユーザー名。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name=role_name)

# Remove the specified user from the current role
role.remove_user(username)

# List all users of the current role
users = role.get_users()
```

## 関連操作\{#related-operations}

以下の操作は `add_user()` に関連しています。

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)


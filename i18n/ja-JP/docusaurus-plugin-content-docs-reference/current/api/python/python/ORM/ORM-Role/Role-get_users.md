---
title: "get_users() | Python | ORM"
slug: /python/python/Role-get_users
sidebar_label: "get_users()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールに関連付けられているすべてのユーザーを一覧表示します。 | Python | ORM"
type: docx
token: CCOhd671iog6rRxu8aOcaPncnLK
sidebar_position: 4
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - get_users()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_users()

この操作は、現在のロールに関連付けられているすべてのユーザーを一覧表示します。

## リクエスト構文\{#request-syntax}

```python
get_users()
```

**パラメータ**

該当なし

**戻り値の型:**

*tuple*

**戻り値:**

現在のロールに追加されているすべてのユーザーの名前を含むタプルです。

## 例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="admin")

# List all users associated with the current role
users = role.get_users() # (admin, )
```

## 関連する操作\{#related-operations}

以下の操作は `get_users()` に関連しています。

- [add_user()](./Role-add_user)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


---
title: "is_exist() | Python | ORM"
slug: /python/python/Role-is_exist
sidebar_label: "is_exist()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールが存在するかどうかを確認します。 | Python | ORM"
type: docx
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - is_exist()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# is_exist()

この操作は、現在のロールが存在するかどうかを確認します。

## リクエスト構文\{#request-syntax}

```python
is_exist()
```

**パラメータ:**

該当なし

**戻り値の型:**

*bool*

**戻り値:**

現在のロールが存在するかどうかを示すブール値

**例外:**

*None*

## 例\{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

## 関連操作\{#related-operations}

以下の操作は `is_exist()` に関連しています。

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


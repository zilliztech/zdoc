---
title: "list_grant() | Python | ORM"
slug: /python/python/Role-list_grant
sidebar_label: "list_grant()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールと指定されたオブジェクトの関係を一覧表示します。 | Python | ORM"
type: docx
token: JXNXdQuwhoYmZQxSohNcdxtwnzh
sidebar_position: 7
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - list_grant()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_grant()

この操作は、現在のロールと指定されたオブジェクトの関係を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_grant(
    object: str,
    object_name: str,
    db_name: str
)
```

**パラメータ:**

- **object** (*str*)

    **[必須]**

    権限を付与するオブジェクトのタイプです。

    この値は大文字と小文字を区別します。詳細については、Users & Roles を参照してください。

- **object_name** (*str*)

    **[必須]**

    **object** で指定されたタイプの対象オブジェクトの名前です。

    collection 名、ユーザー名、またはワイルドカード (*) を指定できます。

- **db_name** (*str*)

    オブジェクトが属するデータベースの名前です。指定しない場合は、デフォルトデータベースが適用されます。

**戻り値の型:**

*GrantInfo*

**戻り値:**

**GrantItem** オブジェクトのリストを含む **GrantInfo** オブジェクトです。

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

**GrantItem** オブジェクトには次のフィールドが含まれます。

- **object** (*str*)

    権限が属するオブジェクトのタイプです。

- **object_name** (*str*)

    ロールに指定された権限が付与されているオブジェクトの名前です。

- **role_name** (*str*)

    確認するロールの名前です。

- **grantor_name** (*str*）

    特定のロールをユーザーに付与したユーザーの名前です。

- **privilege** (*str*)

    ロールに付与されている権限です。

- **db_name** (str)

    この操作が実行されたデータベースの名前です。

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List the relationship between the current role and the specified object.
res = list_grant(
    object="Collection",
    object_name="test_collection",
    db_name="test_db"
)
```

## 関連操作\{#related-operations}

以下の操作は `get_replicas()` に関連しています。

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


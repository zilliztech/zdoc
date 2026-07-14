---
title: "revoke() | Python | ORM"
slug: /python/python/Role-revoke
sidebar_label: "revoke()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、現在のロールに付与されている権限を取り消します。 | Python | ORM"
type: docx
token: UUJWdoEnjoXx69xahsScdMVSnzf
sidebar_position: 10
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - revoke()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke()

この操作は、現在のロールに付与されている権限を取り消します。

## Request Syntax\{#request-syntax}

```python
revoke(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

**PARAMETERS:**

- **object** (*string*)

    **[REQUIRED]**

    権限を付与する対象オブジェクトのタイプです。

    値では大文字と小文字が区別されます。詳細については、Users & Roles を参照してください。

- **object_name** (*string*)

    **[REQUIRED]**

    **object** で指定されたタイプの対象オブジェクトの名前です。

    collection 名、ユーザー名、またはワイルドカード (*) を指定できます。

- **privilege** (*string*)

    **[REQUIRED]**

    付与する権限の名前です。

    詳細については、Users & Roles を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    - **[Collection](./ORM-Collection)**、**Global**、**User** のような種類のオブジェクトにすべての権限を付与するには、権限名に `*` を使用します。
    
    - `object` が `Global` に設定されている場合、`privilege` を `\*` に設定しても `All` に設定した場合と同等ではありません。`All` 権限には、あらゆる collection と user object を含むすべての権限が含まれます。

    </Admonition>

- **db_name** (*string*)

    オブジェクトが属するデータベースの名前です。指定しない場合は、デフォルトのデータベースが適用されます。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(role_name)

# Grant a privilege to the current role 
role.revoke("Collection", collection_name, "Insert")
```

## Related operations\{#related-operations}

以下の操作は `revoke()` に関連しています。

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


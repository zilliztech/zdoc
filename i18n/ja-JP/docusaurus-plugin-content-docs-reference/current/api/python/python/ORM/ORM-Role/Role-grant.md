---
title: "grant() | Python | ORM"
slug: /python/python/Role-grant
sidebar_label: "grant()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在の role に権限を付与します。 | Python | ORM"
type: docx
token: BapSdVXjQoQXnbxnRYScCagAn1f
sidebar_position: 5
keywords: 
  - vectordb
  - マルチモーダル vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - grant()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant()

この操作は現在の role に権限を付与します。

## Request Syntax\{#request-syntax}

```python
grant(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

**PARAMETERS:**

- **object** (*string*)

    **[REQUIRED]**

    権限を付与する対象 object のタイプです。

    この値は大文字と小文字を区別します。詳細は Users & Roles を参照してください。

- **object_name** (*string*)

    **[REQUIRED]**

    **object** で指定したタイプの対象 object の名前です。

    collection 名、ユーザー名、またはワイルドカード (*) を指定できます。

- **privilege** (*string*)

    **[REQUIRED]**

    付与する権限の名前です。

    詳細は Users & Roles を参照してください。

    <Admonition type="info" icon="📘" title="注意">

    - **[Collection](./ORM-Collection)**、**Global**、**User** のような種類の object にすべての権限を付与するには、権限名に `*` を使用します。
    
    - `object` を `Global` に設定した場合、`privilege` を `\*` に設定しても `All` に設定することと同じではありません。`All` 権限には、collection および user object を含むすべての権限が含まれます。

    </Admonition>

- **db_name** (*string*)

    object が属するデータベースの名前です。指定しない場合は、デフォルトのデータベースが適用されます。

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
role.grant("Collection", collection_name, "Insert")
```

## Related operations\{#related-operations}

以下の操作は `grant()` に関連しています。

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)


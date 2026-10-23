---
title: "revoke_privilege() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege
sidebar_label: "revoke_privilege()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のオブジェクトに対して以前にロールへ付与した権限を取り消します。このメソッドを使用して、特定のリソースに対するロールのアクセスを制限します。 | Python | MilvusClient"
type: docx
token: QWmhdTWWao6UH4xnS0sc4WJfnzg
sidebar_position: 22
keywords: 
  - milvus ベクトルデータベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_privilege()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_privilege()

この操作は、特定のオブジェクトに対して以前にロールへ付与した権限を取り消します。このメソッドを使用して、特定のリソースに対するロールのアクセスを制限します。

<Admonition type="info" title="Note">

このメソッドは、以前の revoke_privileges()（複数形）に代わるものです。動作は同じです。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.revoke_privilege(
    role_name: str,
    object_type: str,
    privilege: str,
    object_name: str,
    db_name: str = "",
    timeout: float = None
)
```

**パラメーター：**

- **role_name** (*str*) -

    **[REQUIRED]**

    権限を取り消す対象のロールの名前です。

- **object_type** (*str*) -

    **[REQUIRED]**

    権限が付与されたオブジェクトのタイプです。有効な値は "コレクション"、"Global"、"User" です。

- **privilege** (*str*) -

    **[REQUIRED]**

    取り消す権限の名前です。サポートされている権限の完全なリストについては、Milvus のドキュメントを参照してください。

- **object_name** (*str*) -

    **[REQUIRED]**

    権限が付与されたオブジェクトの名前です。指定したタイプのすべてのオブジェクトを示すには、"&ast;" を使用します。

- **db_name** (*str*) -

    データベースの名前です。指定しない場合、現在のデータベースがデフォルトになります。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型：**

*NoneType*

**戻り値：**

None。

**例外：**

- **MilvusException**

    ロールが存在しない場合、権限が無効な場合、またはサーバーでエラーが発生した場合に、この例外が発生します。ロールが存在しない場合、権限が無効な場合、またはサーバーでエラーが発生した場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Revoke insert privilege on a collection from a role
client.revoke_privilege(
    role_name="readOnly",
    object_type="Collection",
    privilege="Insert",
    object_name="my_collection"
)
```

---
title: "revoke_privilege() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege
sidebar_label: "revoke_privilege()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会撤销先前授予角色在特定对象上的权限。使用此方法可限制角色对特定资源的访问。 | Python | MilvusClient"
type: docx
token: QWmhdTWWao6UH4xnS0sc4WJfnzg
sidebar_position: 22
keywords: 
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - revoke_privilege()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# revoke_privilege()

此操作会撤销先前授予角色在特定对象上的权限。使用此方法可限制角色对特定资源的访问。

<Admonition type="info" title="Note">

此方法取代之前的 revoke_privileges()（复数）。行为完全相同。

</Admonition>

## 请求语法\{#request-syntax}

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

**参数：**

- **role_name** （*str*） -

    **[必需]**

    要从中撤销权限的角色的名称。

- **object_type** （*str*） -

    **[必需]**

    已授予权限的对象的类型。可选值包括 “Collection”、“Global” 和 “User”。

- **privilege** （*str*） -

    **[必需]**

    要撤销的权限的名称。有关支持的权限的完整列表，请参见 Milvus 文档。

- **object_name** （*str*） -

    **[必需]**

    已授予权限的对象的名称。使用 “&ast;” 表示指定类型的所有对象。

- **db_name** （*str*） -

    Database 的名称。如果未指定，则默认为当前 Database。

- **timeout** （*float | None*） -

    此操作的超时持续时间。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

None。

**异常：**

- **MilvusException**

    当角色不存在、权限无效或服务器遇到错误时，将引发此异常。当角色不存在、权限无效或服务器遇到错误时，将引发此异常。

## 示例\{#examples}

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

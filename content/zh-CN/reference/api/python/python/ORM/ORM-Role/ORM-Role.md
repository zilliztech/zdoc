---
title: "Role | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "Role"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Role 实例表示一个具有特定访问权限的角色。 | Python | ORM"
type: docx
token: LZL1d0kckouPXNxJLCmcwbCTnkG
sidebar_position: 11
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - Role
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Role

**Role** 实例表示一个具有特定访问权限的角色。

```python
class pymilvus.Role
```

## 构造函数\{#constructor}

通过名称和其他参数构造一个角色。

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" icon="📘" title="说明">

仅调用构造函数并不会创建该角色。您必须显式调用角色对象的 `create()` 方法来创建该角色。

</Admonition>

**参数：**

- **name** (*string*) - 

    **[REQUIRED]**

    要创建的角色名称。

- **using** (*string*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

**返回类型：**

*Role*

**返回：**

一个角色对象。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## 方法\{#methods}

以下是 `Role` 类的方法：


---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回授予某个角色的权限以及该角色的描述。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

此操作返回授予某个角色的权限以及该角色的描述。

## 请求语法\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> dict
```

**参数：**

- **role_name** (*str*) -

    **[必需]**

    要描述的角色名称。

- **timeout** (*float*) -

    此操作的超时时长。

**返回类型：**

*dict*

包含 `role`、`description` 和 `privileges` 的字典。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **ParamError**

    当参数值无效时，将引发此异常。

## 示例\{#examples}

```python
role_info = client.describe_role(role_name="analytics_reader")
print(role_info["description"])
print(role_info["privileges"])
```

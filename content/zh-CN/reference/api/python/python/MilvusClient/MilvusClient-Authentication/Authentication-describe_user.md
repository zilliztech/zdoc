---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回分配给用户的角色以及用户描述。 | Python | MilvusClient"
type: docx
token: TwTnduPOioywHDx8hPQc80tRnKg
sidebar_position: 6
keywords: 
  - 什么是 milvus
  - milvus 数据库
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - 云
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_user()

此操作返回分配给用户的角色以及用户描述。

## 请求语法\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None
) -> dict
```

**参数：**

- **user_name** (*str*) -

    **[必填]**

    要描述的用户名称。

- **timeout** (*float*) -

    此操作的超时时长。

**返回类型：**

*dict*

一个包含 `user_name`、`roles` 和 `description` 的字典。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **ParamError**

    当参数值无效时，将引发此异常。

## 示例\{#examples}

```python
user_info = client.describe_user(user_name="analyst_user")
print(user_info["roles"])
print(user_info["description"])
```

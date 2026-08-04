---
title: "create_user() | Python | MilvusClient"
slug: /python/python/utility-create_user
sidebar_label: "create_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用密码创建用户。 | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_user()

此操作使用密码创建用户。

## 请求语法\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **user_name** (*str*) -

    **[必需]**

    要创建的用户名称。

- **password** (*str*) -

    **[必需]**

    用户的密码。

- **timeout** (*float*) -

    此操作的超时时长。

**返回类型：**

*None*

此操作不返回任何值。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **ParamError**

    当参数值无效时，将引发此异常。

## 示例\{#examples}

```python
client.create_user(
    user_name="analyst_user",
    password="P@ssw0rd!",
)
```

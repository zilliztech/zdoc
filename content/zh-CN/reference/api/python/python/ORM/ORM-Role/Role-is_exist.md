---
title: "is_exist() | Python | ORM"
slug: /python/python/Role-is_exist
sidebar_label: "is_exist()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查当前角色是否存在。 | Python | ORM"
type: docx
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - Zilliz
  - Zilliz Cloud
  - 云
  - is_exist()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# is_exist()

此操作检查当前角色是否存在。

## 请求语法\{#request-syntax}

```python
is_exist()
```

**参数：**

无/A

**返回类型：**

*bool*

**返回值：**

一个布尔值，表示当前角色是否存在

**异常：**

*None*

## 示例\{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

## 相关操作\{#related-operations}

以下操作与 `is_exist()` 相关：

- [add_user()](./Role-add_user)

- [get_users()](./Role-get_users)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)


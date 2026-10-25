---
title: "create_role() | Python | MilvusClient"
slug: /python/python/Authentication-create_role
sidebar_label: "create_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作为基于角色的访问控制创建角色。 | Python | MilvusClient"
type: docx
token: HRqudGOOnokInhxczclcADBDn8g
sidebar_position: 3
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - create_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_role()

此操作为基于角色的访问控制创建角色。

## 请求语法\{#request-syntax}

```python
create_role(
```

**参数：**

- **role_name** （*str*） -

    **[必需]**

    要创建的角色的名称。

- **timeout** （*float*） -

    此操作的超时时长。

- **description** （*str*） -

    要创建的角色的描述。该值默认为空字符串。

**返回类型：**

*None*

**返回：**

此操作不返回任何值。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。此操作期间发生任何错误时，将引发此异常。

- **ParamError**

    当参数值无效时，将引发此异常。当参数值无效时，将引发此异常。

## 示例\{#examples}

```python
client.create_role(role_name="analytics_reader")
```

---
title: "drop_role() | Python | MilvusClient"
slug: /python/python/Authentication-drop_role
sidebar_label: "drop_role()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会删除一个自定义角色。 | Python | MilvusClient"
type: docx
token: KUAXdm3o3opQPex8N69cMlPbnTh
sidebar_position: 8
keywords: 
  - llm 幻觉
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - zilliz
  - zilliz cloud
  - 云
  - drop_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_role()

此操作会删除一个自定义角色。

## 请求语法\{#request-syntax}

```python
drop_role(
    role_name: str,
    force_drop: bool = False,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**参数：**

- **role_name** (*str*) -

    **[必需]**

    要删除的角色名称。

- **force_drop** (*bool*) -

    是否强制删除该角色，即使该角色已被分配权限或用户。默认值为 **False**。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

- **BaseException**

    当此操作失败时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a role
client.create_role(role_name="read_only")

# Drop a role
client.drop_role(role_name="read_only")

# Force drop a role with assigned privileges
client.drop_role(role_name="custom_role", force_drop=True)
```

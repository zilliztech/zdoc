---
title: "create_alias() | Python | MilvusClient"
slug: /python/python/Collections-create_alias
sidebar_label: "create_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为现有 Collection 创建别名。 | Python | MilvusClient"
type: docx
token: Kqlodu0AWoefKvxczcxc1c36nlf
sidebar_position: 4
keywords: 
  - 开源向量 Database
  - 开源向量数据库 db
  - 向量 Database 示例
  - rag 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - create_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_alias()

此操作为现有 Collection 创建别名。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于专用服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
create_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要为其创建别名的 Collection 名称。

- **alias** (*str*) -

    **[必需]**

    Collection 的别名。在执行此操作前，请确保该别名尚不存在。如果已存在，则会发生异常。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Collection 别名？
    
        Collection 别名是 Collection 的附加名称。当您希望将应用程序切换到新的 Collection，而无需对代码进行任何更改时，Collection 别名会很有用。
    
        在 Zilliz Cloud 上，Collection 别名是全局唯一标识符。一个别名只能分配给一个 Collection。反之，一个 Collection 可以有多个别名。
    
        以下是将一个 Collection 的别名重新分配给另一个 Collection 的示例：
    
        假设有两个 Collection：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的 Collection 别名，它最初分配给 `collection_1`：
    
        - `collection_1` 的 alias = ["bob"]
    
        - `collection_2` 的 alias = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1` 的 alias = []
    
        - `collection_2` 的 alias = ["bob"]

    </Admonition>

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任何响应或发生任何错误时超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在您将 `alias` 设置为现有别名时。

- **BaseException**

    当此操作失败时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")
```

## 相关方法\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)


---
title: "alter_alias() | Python | MilvusClient"
slug: /python/python/Collections-alter_alias
sidebar_label: "alter_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将一个 Collection 的别名重新分配给另一个 Collection。 | Python | MilvusClient"
type: docx
token: CBc3d1mrdoYqmDxe4Kcc9zxAnzh
sidebar_position: 1
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - 云
  - alter_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_alias()

此操作会将一个 Collection 的别名重新分配给另一个 Collection。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 dedicated serving cluster 和按需计算。

- 对于 serving cluster 中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
alter_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要重新分配别名的目标 Collection 名称。

- **alias** (*str*) -

    **[必需]**

    Collection 的别名。请注意，该别名必须预先存在。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Collection 别名？
    
        Collection 别名是 Collection 的附加名称。当您希望在不修改代码的情况下将应用切换到新的 Collection 时，Collection 别名会非常有用。
    
        在 Zilliz Cloud 中，Collection 别名是全局唯一标识符。一个别名只能分配给且仅能分配给一个 Collection。反过来，一个 Collection 可以有多个别名。
    
        下面是一个将某个 Collection 的别名重新分配给另一个 Collection 的示例：
    
        假设有两个 Collection：`collection_1` 和 `collection_2`。还有一个名为 `bob` 的 Collection 别名，原本分配给 `collection_1`：
    
        - `collection_1` 的别名 = ["bob"]
    
        - `collection_2` 的别名 = []
    
        调用 `alter_alias("collection_2", "bob")` 后：
    
        - `collection_1` 的别名 = []
    
        - `collection_2` 的别名 = ["bob"]

    </Admonition>

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定别名不存在时。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create two collections
client.create_collection(collection_name="test_collection_1", dimension=5)
client.create_collection(collection_name="test_collection_2", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection_1", alias="test")

# 4. Reassign the alias to the other collection
client.alter_alias(collection_name="test_collection_2", alias="test")
```

## 相关方法\{#related-methods}

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)


---
title: "describe_alias() | Python | MilvusClient"
slug: /python/python/Collections-describe_alias
sidebar_label: "describe_alias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作显示别名的详细信息。 | Python | MilvusClient"
type: docx
token: HN7nddgueo3scIxmPXAcpjkFnDf
sidebar_position: 8
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - 云
  - describe_alias()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_alias()

此操作显示别名的详细信息。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 Dedicated 服务集群和按需计算。

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
describe_alias(
    alias: str,
    timeout: Optional[float] = None
) -> dict
```

**参数：**

- **alias** (*str*) -

    **[必需]**

    Collection 的别名。

    执行此操作前，请确保该别名已存在。否则将引发异常。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*Dict*

**返回：**

包含别名详细信息的字典。

```python
{
    alias: 'string',
    collection_name: 'string',
    db_name: 'default'
}
```

**参数：**

- **alias** (*str*) -

    指定的别名。

- **collection_name** (*str*) -

    绑定的 Collection 名称。

- **db_name** (*str*) -

    绑定的 Collection 所属的 Database。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在您将 `alias` 设置为不存在的别名时。

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

# 4. Describe the alias
client.describe_alias(alias="test")

# {
#     'alias': 'test', 
#     'collection_name': 'test_collection', 
#     'db_name': 'default'
# }
```

## 相关方法\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)


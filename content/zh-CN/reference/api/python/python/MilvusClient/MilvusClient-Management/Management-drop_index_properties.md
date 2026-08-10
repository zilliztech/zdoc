---
title: "drop_index_properties() | Python | MilvusClient"
slug: /python/python/Management-drop_index_properties
sidebar_label: "drop_index_properties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除指定的索引属性。 | Python | MilvusClient"
type: docx
token: M2kXd5zWSoMIOnxXWamcgCkznih
sidebar_position: 15
keywords: 
  - Milvus 基准测试
  - 托管式 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Zilliz
  - Zilliz Cloud
  - 云
  - drop_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_index_properties()

此操作会删除指定的索引属性。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 dedicated serving 集群和按需计算。

- 如果要对 serving 集群中的 Collection 执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要对按需计算中的 Collection 执行此操作，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以连接到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
drop_index_properties(
    self,
    collection_name: str,
    index_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    目标 Collection 的名称。

- **index_name** (*str*) -

    要删除的索引文件名称。

- **property_keys** (*List[str]*) -

    要删除的属性名称列表。支持的属性如下：

    - `mmap.enabled`

- **timeout** (*Optional[float]*) - 

    此操作的超时时长。

    将其设置为 None 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    property_keys = ["mmap.enabled"]
)
```

